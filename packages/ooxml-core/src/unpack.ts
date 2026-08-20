import JSZip from 'jszip';
import type { OoxmlPackage } from './types';

const toUint8Array = async (input: ArrayBuffer | Uint8Array | Blob): Promise<Uint8Array> => {
  if (input instanceof Uint8Array) {
    return input;
  }
  if (input instanceof Blob) {
    const ab = await input.arrayBuffer();
    return new Uint8Array(ab);
  }
  return new Uint8Array(input);
};

export const unpackOoxml = async (
  input: ArrayBuffer | Uint8Array | Blob,
): Promise<OoxmlPackage> => {
  const bytes = await toUint8Array(input);
  const zip = await JSZip.loadAsync(bytes);

  const parts = new Map<string, Uint8Array>();
  const partOrder: string[] = [];

  const filePromises: Promise<void>[] = [];

  zip.forEach((relativePath, zipEntry) => {
    if (!zipEntry.dir) {
      const normalizedPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
      partOrder.push(normalizedPath);
      filePromises.push(
        zipEntry.async('uint8array').then((data) => {
          parts.set(normalizedPath, data);
        }),
      );
    }
  });

  await Promise.all(filePromises);

  return {
    parts,
    partOrder,
  };
};
