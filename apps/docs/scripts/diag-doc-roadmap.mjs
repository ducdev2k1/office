import { existsSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

const chromePath = ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable'].find((p) => existsSync(p));
const browser = await puppeteer.launch({ executablePath: chromePath, headless: true, args: ['--disable-dev-shm-usage'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });
await page.evaluateOnNewDocument(`
window.__diag = { lt: [] };
new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__diag.lt.push({ s: Math.round(e.startTime), d: Math.round(e.duration) }); }).observe({ type: 'longtask', buffered: true });
`);

await page.goto('http://localhost:20011/', { waitUntil: 'domcontentloaded' });
await new Promise((r) => setTimeout(r, 1500));

const stats = await page.evaluate(async () => {
  const openDb = (name) =>
    new Promise((resolve, reject) => {
      const req = indexedDB.open(name);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  const out = { yjsUpdates: { count: 0, totalBytes: 0 }, record: null, docList: [] };

  try {
    const db = await openDb('doc-roadmap');
    if (db.objectStoreNames.contains('updates')) {
      await new Promise((resolve) => {
        const tx = db.transaction('updates', 'readonly');
        const cursorReq = tx.objectStore('updates').openCursor();
        cursorReq.onsuccess = () => {
          const cursor = cursorReq.result;
          if (!cursor) return;
          out.yjsUpdates.count += 1;
          out.yjsUpdates.totalBytes += cursor.value?.byteLength ?? cursor.value?.length ?? 0;
          cursor.continue();
        };
        tx.oncomplete = resolve;
      });
    }
    db.close();
  } catch (e) {
    out.yjsUpdates.error = String(e);
  }

  try {
    const db = await openDb('one-office');
    await new Promise((resolve) => {
      const tx = db.transaction('documents', 'readonly');
      const cursorReq = tx.objectStore('documents').openCursor();
      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result;
        if (!cursor) return;
        const id = String(cursor.key ?? '');
        out.docList.push({ id, contentLen: cursor.value?.content?.length ?? 0 });
        if (id === 'doc-roadmap') {
          out.record = {
            id,
            title: cursor.value?.title,
            contentLen: cursor.value?.content?.length ?? 0,
            contentKB: Math.round((cursor.value?.content?.length ?? 0) / 1024),
          };
        }
        cursor.continue();
      };
      tx.oncomplete = resolve;
    });
    db.close();
  } catch (e) {
    out.recordError = String(e);
  }
  out.docList.sort((a, b) => b.contentLen - a.contentLen);
  return out;
});

console.log('=== IDB STATS (doc-roadmap) ===');
console.log(JSON.stringify(stats, null, 2));

const t0 = Date.now();
await page.goto('http://localhost:20011/edit/doc-roadmap', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(
  () => Boolean(document.querySelector('.doc-editor')) && document.querySelector('.doc-editor').isContentEditable,
  { timeout: 90_000 },
).catch(() => console.log('TIMEOUT waiting editable'));
const tEdit = Date.now() - t0;
await new Promise((r) => setTimeout(r, 8000));
const diag = await page.evaluate(() => ({
  longTasks: window.__diag.lt.length,
  totalLtMs: window.__diag.lt.reduce((a, b) => a + b.d, 0),
  maxLt: Math.max(0, ...window.__diag.lt.map((t) => t.d)),
  paraCount: document.querySelectorAll('.doc-editor > *').length,
  textLen: document.querySelector('.doc-editor')?.textContent?.length ?? 0,
}));
console.log('=== OPEN /edit/doc-roadmap ===');
console.log(`timeToEditable: ${tEdit}ms`);
console.log(`longTasks(8s): ${diag.longTasks}, sum=${diag.totalLtMs}ms, max=${diag.maxLt}ms`);
console.log(`top-level blocks: ${diag.paraCount}, textLen: ${diag.textLen}`);
const timeline = await page.evaluate(() => window.__diag.lt.slice(0, 20));
console.log('first long tasks:', JSON.stringify(timeline));

await browser.close();
