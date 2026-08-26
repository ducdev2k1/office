import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const dir = process.argv[2] ?? new URL('../dist/assets', import.meta.url).pathname;

const htmlPath = new URL('../dist/index.html', import.meta.url).pathname;
const html = fs.readFileSync(htmlPath, 'utf8');
const entries = [...html.matchAll(/src="([^"]+\.js)"/g)].map((m) => m[1]);
console.log('ENTRY SCRIPTS:');
for (const s of entries) {
  const b = fs.readFileSync(path.join(dir, path.basename(s)));
  console.log(' ', s, `gzip=${Math.round(zlib.gzipSync(b, { level: 9 }).length / 1024)}KB`);
}
console.log('---');
const files = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith('.js'))
  .map((f) => {
    const b = fs.readFileSync(path.join(dir, f));
    return { f, raw: b.length, gz: zlib.gzipSync(b, { level: 9 }).length };
  })
  .sort((a, b) => b.gz - a.gz);

let totalGz = 0;
let totalRaw = 0;
for (const x of files.slice(0, 12)) {
  console.log(x.f.padEnd(44), `raw=${Math.round(x.raw / 1024)}KB`, `gzip=${Math.round(x.gz / 1024)}KB`);
}
for (const x of files) {
  totalRaw += x.raw;
  totalGz += x.gz;
}
console.log('---');
console.log(`TOTAL js raw=${Math.round(totalRaw / 1024)}KB gzip=${Math.round(totalGz / 1024)}KB across ${files.length} files`);
