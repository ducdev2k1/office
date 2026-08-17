import { readFile } from 'fs/promises';
const path = '/home/ducnd/my_project/office/node_modules/.pnpm/@inet+icons@1.4.1/node_modules/@inet/icons/dist/icons.json';
const raw = JSON.parse(await readFile(path, 'utf8'));
const icons = raw.icons ?? raw.payload?.icons ?? [];
const e = icons.find((i) => i.n === 'star');
console.log('DUOTONE FULL:');
console.log(e?.d);
