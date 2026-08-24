import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    return [k, v];
  }),
);

const BASE_URL = args.url ?? 'http://localhost:20011';
const PAGE_CONFIGS = (args.pages ?? '50,150,300').split(',').map(Number);
const RUNS = Number(args.runs ?? '3');
const SETTLE_QUIET_MS = 1200;
const OPEN_TIMEOUT_MS = 120_000;

const resolveChromePath = () => {
  const found = CHROME_CANDIDATES.find((p) => p && existsSync(p));
  if (!found)
    throw new Error('Không tìm thấy Chrome. Đặt biến môi trường CHROME_PATH=/duong/dan/chrome');
  return found;
};

const waitForServer = async (url, timeoutMs) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
};

const ensureServer = async () => {
  if (await waitForServer(BASE_URL, 3_000)) {
    console.log(`✔ Dev server đang chạy tại ${BASE_URL}`);
    return null;
  }
  console.log('… Đang khởi động vite dev server …');
  const port = new URL(BASE_URL).port || '20011';
  const child = spawn('pnpm', ['exec', 'vite', '--port', port, '--strictPort'], {
    cwd: new URL('../', import.meta.url).pathname,
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  child.stderr.on('data', (chunk) => process.stderr.write(`[vite] ${chunk}`));
  if (!(await waitForServer(BASE_URL, 60_000))) {
    child.kill('SIGTERM');
    throw new Error('Dev server không khởi động được trong 60s');
  }
  console.log(`✔ Dev server đã sẵn sàng tại ${BASE_URL}`);
  return child;
};

const OBSERVER_BOOTSTRAP = `
window.__bench = { longTasks: [], interactions: [], lastLongTaskAt: 0 };
new PerformanceObserver((list) => {
  for (const e of list.getEntries()) {
    window.__bench.longTasks.push({ start: e.startTime, dur: e.duration });
    window.__bench.lastLongTaskAt = performance.now();
  }
}).observe({ type: 'longtask', buffered: true });
try {
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      if (e.interactionId) window.__bench.interactions.push({ start: e.startTime, dur: e.duration });
    }
  }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
} catch {}
`;

const median = (nums) => {
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const fmt = (n, unit = '') =>
  n == null || Number.isNaN(n) ? '—' : `${Math.round(n * 10) / 10}${unit}`;

const runOnce = async (browser, baseUrl, pages) => {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.evaluateOnNewDocument(OBSERVER_BOOTSTRAP);

  await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForFunction(() => typeof window.__seedPerfDoc === 'function', { timeout: 60_000 });
  const docId = await page.evaluate(async (p) => window.__seedPerfDoc(p), pages);

  const openStartedAt = Date.now();
  await page.goto(`${baseUrl}/edit/${docId}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForFunction(
    () =>
      Boolean(document.querySelector('.doc-editor')) &&
      document.querySelector('.doc-editor').isContentEditable,
    { timeout: OPEN_TIMEOUT_MS },
  );
  const timeToEditable = Date.now() - openStartedAt;
  await page.evaluate(() => {
    window.__bench.readyAt = performance.now();
    if (!window.__bench.lastLongTaskAt) window.__bench.lastLongTaskAt = performance.now();
  });

  const didSettle = await page
    .waitForFunction(
      (quietMs) => {
        const b = window.__bench;
        return performance.now() - Math.max(b.lastLongTaskAt, b.readyAt) > quietMs;
      },
      { timeout: 30_000, polling: 250 },
      SETTLE_QUIET_MS,
    )
    .then(() => true)
    .catch(() => false);

  const openStats = await page.evaluate(() => {
    const b = window.__bench;
    const totalBlocking = b.longTasks.reduce((sum, t) => sum + Math.max(0, t.dur - 50), 0);
    return {
      longTaskCount: b.longTasks.length,
      longestTask: b.longTasks.length ? Math.max(...b.longTasks.map((t) => t.dur)) : 0,
      totalBlocking,
    };
  });

  const typingStart = await page.evaluate(() => performance.now());
  await page.click('.doc-editor');
  await page.keyboard.down('Control');
  await page.keyboard.press('End');
  await page.keyboard.up('Control');
  await page.keyboard.type(' Kiem thu hieu nang benchmark 123', { delay: 40 });
  await new Promise((r) => setTimeout(r, 600));

  const typingStats = await page.evaluate((startMark) => {
    const durs = window.__bench.interactions.filter((e) => e.start >= startMark).map((e) => e.dur);
    return {
      typingSamples: durs.length,
      keystrokeAvg: durs.length ? durs.reduce((a, b) => a + b, 0) / durs.length : null,
      keystrokeMax: durs.length ? Math.max(...durs) : null,
    };
  }, typingStart);

  const scrollStats = await page.evaluate(async () => {
    const paperWrap = document.querySelector('.paper-wrap');
    let scroller = paperWrap;
    let bestRange = paperWrap ? paperWrap.scrollHeight - paperWrap.clientHeight : 0;
    if (bestRange <= 0) {
      const editor = document.querySelector('.doc-editor');
      let node = editor?.parentElement;
      while (node) {
        const style = getComputedStyle(node);
        const range = node.scrollHeight - node.clientHeight;
        if (/(auto|scroll)/.test(style.overflowY) && range > bestRange) {
          bestRange = range;
          scroller = node;
        }
        node = node.parentElement;
      }
    }
    if (!scroller || bestRange <= 0) return { fpsAvg: null, frameP95: null };

    const deltas = [];
    let last = performance.now();
    let started = false;
    scroller.scrollTop = 0;
    await new Promise((resolve) => {
      const step = (now) => {
        if (!started) {
          started = true;
          last = now;
          scroller.scrollTop += scroller.clientHeight * 0.6;
          requestAnimationFrame(step);
          return;
        }
        deltas.push(now - last);
        last = now;
        scroller.scrollTop += scroller.clientHeight * 0.6;
        const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 4;
        if (atBottom || deltas.length >= 240) {
          resolve();
          return;
        }
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });

    const tail = deltas.slice(2).sort((a, b) => a - b);
    const avg = tail.length ? tail.reduce((a, b) => a + b, 0) / tail.length : null;
    const p95 = tail.length
      ? tail[Math.min(tail.length - 1, Math.floor(tail.length * 0.95))]
      : null;
    return { fpsAvg: avg ? 1000 / avg : null, frameP95: p95 };
  });

  await page.close();
  return { docId, timeToEditable, didSettle, ...openStats, ...typingStats, ...scrollStats };
};

const cleanupPerfDocs = async (browser, baseUrl) => {
  const page = await browser.newPage();
  await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => {
    const db = await new Promise((resolve, reject) => {
      const req = indexedDB.open('one-office');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    const perfIds = [];
    await new Promise((resolve) => {
      const tx = db.transaction('documents', 'readwrite');
      const cursorReq = tx.objectStore('documents').openCursor();
      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result;
        if (!cursor) return;
        const id = String(cursor.key ?? cursor.value?.id ?? '');
        if (id.startsWith('perf-')) {
          perfIds.push(id);
          cursor.delete();
        }
        cursor.continue();
      };
      tx.oncomplete = resolve;
    });
    db.close();
    await Promise.all(
      perfIds.map(
        (id) =>
          new Promise((resolve) => {
            const del = indexedDB.deleteDatabase(id);
            del.onsuccess = del.onerror = del.onblocked = () => resolve();
          }),
      ),
    );
  });
  await page.close();
};

const main = async () => {
  const chromePath = resolveChromePath();
  console.log(`✔ Chrome: ${chromePath}`);

  const serverProc = await ensureServer();
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--disable-dev-shm-usage', '--no-first-run'],
  });

  try {
    const report = {};
    for (const pages of PAGE_CONFIGS) {
      const runs = [];
      for (let i = 0; i < RUNS; i += 1) {
        process.stdout.write(`… Đo ${pages} trang — lần ${i + 1}/${RUNS} …\r`);
        runs.push(await runOnce(browser, BASE_URL, pages));
      }
      await cleanupPerfDocs(browser, BASE_URL);
      report[pages] = {
        timeToEditable: median(runs.map((r) => r.timeToEditable)),
        didSettle: runs.every((r) => r.didSettle),
        longTaskCount: median(runs.map((r) => r.longTaskCount)),
        longestTask: median(runs.map((r) => r.longestTask)),
        totalBlocking: median(runs.map((r) => r.totalBlocking)),
        typingSamples: median(runs.map((r) => r.typingSamples)),
        keystrokeAvg: median(runs.filter((r) => r.keystrokeAvg != null).map((r) => r.keystrokeAvg)),
        keystrokeMax: median(runs.filter((r) => r.keystrokeMax != null).map((r) => r.keystrokeMax)),
        fpsAvg: median(runs.filter((r) => r.fpsAvg != null).map((r) => r.fpsAvg)),
        frameP95: median(runs.filter((r) => r.frameP95 != null).map((r) => r.frameP95)),
      };
    }

    console.log(`\n===== BASELINE DOCS BENCHMARK — dev mode — median/${RUNS} runs =====\n`);
    for (const [pages, m] of Object.entries(report)) {
      console.log(`--- ${pages} trang ---`);
      console.table({
        'Mở file tới gõ được (ms)': fmt(m.timeToEditable),
        'Phân trang yên tĩnh': m.didSettle ? '✔' : '✖ (còn long task liên tục)',
        'Long tasks khi mở': m.longTaskCount,
        'Task dài nhất (ms)': fmt(m.longestTask),
        'Total blocking (ms)': fmt(m.totalBlocking),
        'Gõ: mẫu đo được': m.typingSamples,
        'Gõ: trễ trung bình (ms)': fmt(m.keystrokeAvg),
        'Gõ: trễ tối đa (ms)': fmt(m.keystrokeMax),
        'Cuộn: FPS trung bình': fmt(m.fpsAvg),
        'Cuộn: frame p95 (ms)': fmt(m.frameP95),
      });
    }
    console.log('Ngưỡng nghiệm thu: mở < 2000ms · gõ < 30ms · cuộn ≥ 60fps');
  } finally {
    await browser.close();
    serverProc?.kill('SIGTERM');
  }
};

main().catch((err) => {
  console.error('✖ Benchmark thất bại:', err.message);
  process.exit(1);
});
