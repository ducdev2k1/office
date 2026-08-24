import { convertDocxToHtml } from '@office/docx-io';
import { readFileSync } from 'node:fs';

const buf = readFileSync(new URL('./heavy-300-trang.docx', import.meta.url));
const t0 = Date.now();
const html = await convertDocxToHtml(buf);
const t1 = Date.now();
console.log(`convert: ${t1 - t0}ms`);
console.log(`HTML size: ${(html.length / 1024 / 1024).toFixed(2)} MB`);
console.log(`<p> blocks: ${html.match(/<p[ >]/g)?.length ?? 0}`);
console.log(`tables: ${html.match(/<table[ >]/g)?.length ?? 0}`);
console.log(`images: ${html.match(/<img[ >]/g)?.length ?? 0}`);
