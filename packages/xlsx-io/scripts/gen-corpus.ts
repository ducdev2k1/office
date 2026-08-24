import fs from 'fs';
import os from 'os';
import path from 'path';
import { generateCorpus } from '../src/__tests__/corpus-generator.utils';

const run = async (): Promise<void> => {
  const outDir = path.join(os.tmpdir(), 'office-xlsx-corpus');
  fs.mkdirSync(outDir, { recursive: true });
  for (const file of await generateCorpus()) {
    const target = path.join(outDir, file.name);
    fs.writeFileSync(target, Buffer.from(file.buffer));
    console.log(`${target}`);
  }
  console.log(`\nCorpus ghi ra: ${outDir}`);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
