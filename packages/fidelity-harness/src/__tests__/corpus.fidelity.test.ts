import { convertDocxToHtml, convertDocxToText, exportDocx } from '@office/docx-io';
import { getPartText, unpackOoxml } from '@office/ooxml-core';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { standardFormatChecks } from '../docx-fidelity';const CORPUS_DIR = process.env.CORPUS_DIR
  ? resolve(process.env.CORPUS_DIR)
  : resolve(dirname(fileURLToPath(import.meta.url)), '../../../../corpus');

const MAX_KEYWORDS = 200;

const listCorpusFiles = (): string[] => {
  try {
    return readdirSync(CORPUS_DIR).filter((f) => f.toLowerCase().endsWith('.docx')).sort();
  } catch {
    return [];
  }
};

const corpusFiles = listCorpusFiles();

const extractKeywords = (text: string): string[] => {
  const tokens = text
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 2);
  return [...new Set(tokens)].slice(0, MAX_KEYWORDS);
};

describe.skipIf(corpusFiles.length === 0)('corpus fidelity — bộ mẫu thật', () => {
  let checks: ReturnType<typeof standardFormatChecks>;

  beforeAll(() => {
    checks = standardFormatChecks();
  });

  it.each(corpusFiles)('round-trip: %s', async (file) => {
    const original = new Uint8Array(readFileSync(resolve(CORPUS_DIR, file)));

    const originalText = await convertDocxToText(original);
    const keywords = extractKeywords(originalText);

    const html = await convertDocxToHtml(original);
    const repacked = await exportDocx(html);

    const originalXml = getPartText(await unpackOoxml(original), 'word/document.xml') ?? '';
    const outputXml = getPartText(await unpackOoxml(repacked), 'word/document.xml') ?? '';
    const outputText = await convertDocxToText(repacked);

    const matched = keywords.filter((kw) => outputText.includes(kw)).length;
    const textFidelity = keywords.length > 0 ? (matched / keywords.length) * 100 : 100;

    const lostFormats = checks
      .filter((c) => c.pattern.test(originalXml) && !c.pattern.test(outputXml))
      .map((c) => c.label);

    expect(textFidelity, `text fidelity ${file}`).toBeGreaterThanOrEqual(95);
    expect(lostFormats, `format bị mất: ${lostFormats.join(', ')}`).toEqual([]);
  });
});
