import JSZip from 'jszip';
import type { OoxmlPackage } from './types';

export const repackOoxml = async (pkg: OoxmlPackage): Promise<Uint8Array> => {
  const zip = new JSZip();

  const written = new Set<string>();

  // Write files in original order first
  for (const path of pkg.partOrder) {
    const data = pkg.parts.get(path);
    if (data) {
      zip.file(path, data);
      written.add(path);
    }
  }

  // Write any newly added parts that were not in original partOrder
  for (const [path, data] of pkg.parts.entries()) {
    if (!written.has(path)) {
      zip.file(path, data);
    }
  }

  const generated = await zip.generateAsync({
    type: 'uint8array',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 6,
    },
  });

  return generated;
};
