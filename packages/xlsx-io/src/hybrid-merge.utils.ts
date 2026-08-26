import { strFromU8, unzipSync, zipSync } from 'fflate';
import type { IWorkbookData } from '@univerjs/core';
import { univerToExceljs } from './univerToExceljs.utils';
import type { XlsxChartSpec } from './types';

const OPAQUE_PART_PREFIXES = [
  'xl/charts/',
  'xl/drawings/',
  'xl/media/',
  'xl/pivotCache/',
  'xl/pivotTables/',
  'xl/embeddings/',
];

const OPAQUE_REL_SUFFIX = '_rels/';

const KNOWN_DEFAULT_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  bmp: 'image/bmp',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  bin: 'application/vnd.openxmlformats-officedocument.spreadsheetml.printerSettings',
};

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isOpaquePart = (name: string): boolean =>
  OPAQUE_PART_PREFIXES.some((prefix) => name.startsWith(prefix));

const extensionOf = (name: string): string => {
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot + 1).toLowerCase();
};

const collectOverridesFor = (
  contentTypesXml: string,
  partNames: string[],
): { overridesXml: string; defaultsNeeded: Set<string> } => {
  let overridesXml = '';
  const defaultsNeeded = new Set<string>();
  for (const name of partNames) {
    const re = new RegExp(`<Override PartName="/${escapeRegExp(name)}"[^>]*/>`, 'i');
    const match = re.exec(contentTypesXml);
    if (match?.[0]) {
      overridesXml += match[0];
    } else {
      defaultsNeeded.add(extensionOf(name));
    }
  }
  return { overridesXml, defaultsNeeded };
};

const ensureDefaults = (contentTypesXml: string, originalCt: string, extensions: Set<string>): string => {
  let additions = '';
  for (const ext of extensions) {
    if (!ext) continue;
    const hasInOutput = new RegExp(`<Default Extension="${ext}"`, 'i').test(contentTypesXml);
    if (hasInOutput) continue;
    const fromOriginal = new RegExp(`<Default Extension="${ext}"[^>]*/>`, 'i').exec(originalCt);
    additions += fromOriginal?.[0] ?? `<Default Extension="${ext}" ContentType="${KNOWN_DEFAULT_TYPES[ext] ?? 'application/octet-stream'}"/>`;
  }
  return additions;
};

interface SheetDrawingRefs {
  sheetName: string;
  relationshipsXml: string;
}

const collectOriginalSheetDrawings = (src: Record<string, Uint8Array>): SheetDrawingRefs[] => {
  const refs: SheetDrawingRefs[] = [];
  for (const name of Object.keys(src)) {
    const match = /^xl\/worksheets\/(sheet\d+)\.xml$/.exec(name);
    if (!match?.[1]) continue;
    const relsName = `xl/worksheets/${OPAQUE_REL_SUFFIX}${match[1]}.xml.rels`;
    const relsBytes = src[relsName];
    if (!relsBytes) continue;
    const relsXml = strFromU8(relsBytes);
    const drawingRels = [...relsXml.matchAll(/<Relationship\b[^>]*Type="[^"]*\/drawing"[^>]*\/>/gi)]
      .map((m) => m[0])
      .join('');
    if (drawingRels) refs.push({ sheetName: match[1], relationshipsXml: drawingRels });
  }
  return refs;
};

const maxRelationshipId = (relsXml: string): number => {
  let max = 0;
  for (const m of relsXml.matchAll(/Id="rId(\d+)"/g)) {
    max = Math.max(max, Number(m[1] ?? 0));
  }
  return max;
};

const wireSheetDrawing = (out: Record<string, Uint8Array>, ref: SheetDrawingRefs): void => {
  const sheetPath = `xl/worksheets/${ref.sheetName}.xml`;
  const sheetBytes = out[sheetPath];
  if (!sheetBytes) return;
  const sheetXml = strFromU8(sheetBytes);
  if (sheetXml.includes('<drawing ') || !sheetXml.includes('xmlns:r=')) return;

  const relsPath = `xl/worksheets/${OPAQUE_REL_SUFFIX}${ref.sheetName}.xml.rels`;
  const existingRelsXml = out[relsPath] ? strFromU8(out[relsPath]) : null;

  let nextId = existingRelsXml ? maxRelationshipId(existingRelsXml) + 1 : 1;
  const newEntries: string[] = [];
  const newIds: string[] = [];
  for (const m of ref.relationshipsXml.matchAll(/<Relationship\b[^>]*\/?>/gi)) {
    const el = m[0] ?? '';
    const type = /Type="([^"]+)"/.exec(el)?.[1];
    const target = /Target="([^"]+)"/.exec(el)?.[1];
    if (!type || !target) continue;
    const targetMode = /TargetMode="([^"]+)"/.exec(el)?.[1];
    const id = `rId${nextId}`;
    nextId += 1;
    newEntries.push(
      `<Relationship Id="${id}" Type="${type}" Target="${target}"${targetMode ? ` TargetMode="${targetMode}"` : ''}/>`,
    );
    newIds.push(id);
  }
  if (newEntries.length === 0) return;

  const updatedRelsXml = existingRelsXml
    ? existingRelsXml.replace('</Relationships>', `${newEntries.join('')}</Relationships>`)
    : `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${newEntries.join('')}</Relationships>`;
  out[relsPath] = new TextEncoder().encode(updatedRelsXml);

  const drawingTags = newIds.map((id) => `<drawing r:id="${id}"/>`).join('');
  out[sheetPath] = new TextEncoder().encode(
    sheetXml.replace(/<\/worksheet>/, `${drawingTags}</worksheet>`),
  );
};

export const mergeOpaqueParts = (rebuilt: Uint8Array, source: Uint8Array): Uint8Array => {
  const out = unzipSync(rebuilt);
  const src = unzipSync(source);

  const copiedParts: string[] = [];
  for (const [name, data] of Object.entries(src)) {
    if (!isOpaquePart(name)) continue;
    if (name in out) continue;
    out[name] = data;
    copiedParts.push(name);
  }
  if (copiedParts.length === 0) return rebuilt;

  const ctPath = '[Content_Types].xml';
  const outCt = out[ctPath] ? strFromU8(out[ctPath]) : '';
  const srcCt = src[ctPath] ? strFromU8(src[ctPath]) : '';
  const { overridesXml, defaultsNeeded } = collectOverridesFor(srcCt, copiedParts);
  const defaultsXml = ensureDefaults(outCt, srcCt, defaultsNeeded);
  if (overridesXml || defaultsXml) {
    out[ctPath] = new TextEncoder().encode(outCt.replace('</Types>', `${overridesXml}${defaultsXml}</Types>`));
  }

  const drawingRefs = collectOriginalSheetDrawings(src);
  for (const ref of drawingRefs) wireSheetDrawing(out, ref);

  return zipSync(out);
};

export interface HybridExportOptions {
  sourceBuffer?: ArrayBuffer | Uint8Array | null;
}

export const exportWorkbookHybrid = async (
  data: IWorkbookData,
  charts?: XlsxChartSpec[],
  options?: HybridExportOptions,
): Promise<ArrayBuffer> => {
  const rebuilt = new Uint8Array(await univerToExceljs(data, charts));
  const source = options?.sourceBuffer;
  if (!source || source.byteLength === 0) return rebuilt.buffer as ArrayBuffer;
  const sourceBytes = source instanceof Uint8Array ? source : new Uint8Array(source);
  return mergeOpaqueParts(rebuilt, sourceBytes).buffer as ArrayBuffer;
};
