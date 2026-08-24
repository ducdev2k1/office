import { existsSync } from 'node:fs';
import puppeteer from 'puppeteer-core';
import * as Y from 'yjs';

const chromePath = ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable'].find((p) => existsSync(p));
const browser = await puppeteer.launch({ executablePath: chromePath, headless: true, args: ['--disable-dev-shm-usage'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });

await page.goto('http://localhost:20011/', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(
  () =>
    new Promise((resolve) => {
      const req = indexedDB.open('one-office');
      req.onsuccess = () => {
        const has = req.result.objectStoreNames.contains('documents');
        req.result.close();
        resolve(has);
      };
      req.onerror = () => resolve(false);
    }),
  { timeout: 30_000, polling: 500 },
);

const docId = 'perf-ybloat-' + Date.now();
const ydoc = new Y.Doc();
const frag = ydoc.getXmlFragment('default');
const updates = [];
ydoc.on('update', (u) => updates.push(Buffer.from(u).toString('base64')));
for (let i = 0; i < 3000; i += 1) {
  const line = new Y.XmlText();
  line.insert(0, `Dòng lịch sử chỉnh sửa số ${i} với vài từ để có kích thước nhỏ.`);
  frag.insert(frag.length, [line]);
}

await page.evaluate(async ({ id, list }) => {
  const open = (n) =>
    new Promise((res, rej) => {
      const r = indexedDB.open(n);
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  const db = await open('one-office');
  await new Promise((res, rej) => {
    const tx = db.transaction('documents', 'readwrite');
    tx.objectStore('documents').put({
      id,
      title: 'Perf Y-bloat compaction',
      kind: 'docs',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastOpenedAt: new Date().toISOString(),
      starred: false,
      deletedAt: null,
      content: '<p></p>',
      pageSetup: { paperSize: 'a4', orientation: 'portrait', margins: { top: 20, right: 15, bottom: 20, left: 15 } },
    });
    tx.oncomplete = res;
    tx.onerror = () => rej(tx.error);
  });
  db.close();
  const ydb = await new Promise((res, rej) => {
    const req = indexedDB.open(id, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains('updates')) {
        req.result.createObjectStore('updates', { autoIncrement: true });
      }
    };
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
  await new Promise((resolve, reject) => {
    const tx = ydb.transaction('updates', 'readwrite');
    const store = tx.objectStore('updates');
    for (const b64 of list) {
      const bin = atob(b64);
      const arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i += 1) arr[i] = bin.charCodeAt(i);
      store.add(arr);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  ydb.close();
}, { id: docId, list: updates });

const countEntries = () =>
  page.evaluate(async (id) => {
    const open = (n) =>
      new Promise((res, rej) => {
        const r = indexedDB.open(n);
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      });
    const d = await open(id);
    const cnt = await new Promise((res) => {
      const req = d.transaction('updates', 'readonly').objectStore('updates').count();
      req.onsuccess = () => res(req.result);
    });
    d.close();
    return cnt;
  }, docId);

const openAndMeasure = async (label) => {
  const t0 = Date.now();
  await page.goto(`http://localhost:20011/edit/${docId}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(
    () => Boolean(document.querySelector('.doc-editor')) && document.querySelector('.doc-editor').isContentEditable,
    { timeout: 120_000 },
  );
  const tEdit = Date.now() - t0;
  await new Promise((r) => setTimeout(r, 9000));
  const stats = await page.evaluate(() => ({
    blocks: document.querySelectorAll('.doc-editor > *').length,
    textLen: document.querySelector('.doc-editor')?.textContent?.length ?? 0,
  }));
  console.log(`[${label}] timeToEditable=${tEdit}ms, blocks=${stats.blocks}, textLen=${stats.textLen}`);
  return tEdit;
};

console.log('entries before:', await countEntries());
await openAndMeasure('LAN 1 (mở đầu, merge 3000 updates + kích hoạt compaction)');
await new Promise((r) => setTimeout(r, 2000));
console.log('entries after compaction:', await countEntries());

const t2 = await openAndMeasure('LAN 2 (sau compaction)');
console.log('entries sau lan 2:', await countEntries());

await page.evaluate(async (id) => {
  const del = (n) => new Promise((res) => { const r = indexedDB.deleteDatabase(n); r.onsuccess = r.onerror = r.onblocked = () => res(); });
  const open = (n) => new Promise((res, rej) => { const r = indexedDB.open(n); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const db = await open('one-office');
  await new Promise((res) => {
    const tx = db.transaction('documents', 'readwrite');
    tx.objectStore('documents').delete(id);
    tx.oncomplete = res;
  });
  db.close();
  await del(id);
}, docId);

await browser.close();
