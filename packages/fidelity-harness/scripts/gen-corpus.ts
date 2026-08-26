import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateCorpus } from '../src/corpus-generator.utils';

const run = async (): Promise<void> => {
  const rootDir = fileURLToPath(new URL('../../../', import.meta.url));
  const outDir = path.join(rootDir, 'corpus');
  fs.mkdirSync(outDir, { recursive: true });
  for (const file of await generateCorpus()) {
    const target = path.join(outDir, file.name);
    fs.writeFileSync(target, Buffer.from(file.buffer));
    console.log(target);
  }
  console.log(`\nCorpus ghi ra: ${outDir}`);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
