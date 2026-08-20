import type { OoxmlPackage } from './types';

const textDecoder = new TextDecoder('utf-8');
const textEncoder = new TextEncoder();

const normalizePath = (path: string): string =>
  path.startsWith('/') ? path.slice(1) : path;

export const hasPart = (pkg: OoxmlPackage, path: string): boolean =>
  pkg.parts.has(normalizePath(path));

export const getPartBytes = (pkg: OoxmlPackage, path: string): Uint8Array | undefined =>
  pkg.parts.get(normalizePath(path));

export const setPartBytes = (pkg: OoxmlPackage, path: string, bytes: Uint8Array): void => {
  const norm = normalizePath(path);
  if (!pkg.parts.has(norm) && !pkg.partOrder.includes(norm)) {
    pkg.partOrder.push(norm);
  }
  pkg.parts.set(norm, bytes);
};

export const getPartText = (pkg: OoxmlPackage, path: string): string | undefined => {
  const bytes = getPartBytes(pkg, path);
  if (!bytes) return undefined;
  return textDecoder.decode(bytes);
};

export const setPartText = (pkg: OoxmlPackage, path: string, text: string): void => {
  setPartBytes(pkg, path, textEncoder.encode(text));
};

export const deletePart = (pkg: OoxmlPackage, path: string): boolean => {
  const norm = normalizePath(path);
  const deleted = pkg.parts.delete(norm);
  const idx = pkg.partOrder.indexOf(norm);
  if (idx !== -1) {
    pkg.partOrder.splice(idx, 1);
  }
  return deleted;
};

export const listParts = (pkg: OoxmlPackage): string[] => Array.from(pkg.parts.keys());
