#!/usr/bin/env node
/**
 * print-check.mjs — end-to-end print fidelity harness.
 *
 * Flow:
 *   1. Poll dev server (default port 2001) until 200 (timeout 30s).
 *   2. Spawn headless Chrome with a fresh profile and remote debugging.
 *   3. Seed a fixture doc via window.__seedDoc (DEV-only).
 *   4. Navigate to /edit/:docId, wait for fonts + stable .page-stack.
 *   5. Page.printToPDF { preferCSSPageSize, printBackground }.
 *   6. pdftotext + pdfinfo, then assert marker continuity.
 *   7. finally: kill Chrome.
 *
 * Zero dependencies: uses global WebSocket (Node 22+).
 */
import { execFileSync, spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

process.env.NO_PROXY = 'localhost,127.0.0.1,::1,*';
process.env.no_proxy = 'localhost,127.0.0.1,::1,*';

const CHROME = process.env.CHROME_BIN || '/usr/bin/google-chrome';
const BASE_URL = process.env.DOCS_URL || 'http://localhost:2001';

const args = {};
for (let i = 2; i < process.argv.length; i += 1) {
  const a = process.argv[i];
  if (a.startsWith('--')) {
    const eq = a.indexOf('=');
    if (eq !== -1) {
      args[a.slice(2, eq)] = a.slice(eq + 1);
    } else {
      const next = process.argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[a.slice(2)] = next;
        i += 1;
      } else {
        args[a.slice(2)] = 'true';
      }
    }
  }
}

let blocks = Number(args.blocks ?? 200);
const paper = args.paper ?? 'a4';
const orientation = args.orientation ?? 'portrait';
const pageBreaks = args.pageBreaks ? String(args.pageBreaks).split(',').map(Number) : [];
const scratchDir = args.out ?? mkdtempSync(join(tmpdir(), 'print-check-'));
const strictPages = args.strictPages === 'true';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------ CDP client ------------------------------ */

class CdpClient {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    ws.onmessage = (event) => {
      const msg = JSON.parse(String(event.data));
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    };
  }

  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
}

/* ------------------------------ helpers ------------------------------ */

const poll = async (fn, timeoutMs, label) => {
  const start = Date.now();
  for (;;) {
    try {
      const value = await fn();
      if (value) return value;
    } catch {
      /* keep polling */
    }
    if (Date.now() - start > timeoutMs) throw new Error(`timeout: ${label}`);
    await sleep(300);
  }
};

const run = (cmd, cwd) =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, { cwd, shell: true, stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`exit ${code}`))));
  });

/* ------------------------------ steps ------------------------------ */

const waitForServer = async () => {
  await poll(
    async () => {
      const res = await fetch(BASE_URL, { signal: AbortSignal.timeout(2000) });
      return res.status === 200;
    },
    30000,
    `dev server at ${BASE_URL}`,
  );
  console.log(`[print-check] server ready: ${BASE_URL}`);
};

const launchChrome = async () => {
  const userDataDir = mkdtempSync(join(tmpdir(), 'print-check-chrome-'));
  const child = spawn(
    CHROME,
    [
      '--headless=new',
      '--remote-debugging-port=0',
      `--user-data-dir=${userDataDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-extensions',
      'about:blank',
    ],
    { stdio: 'ignore' },
  );
  const activePortFile = join(userDataDir, 'DevToolsActivePort');
  const port = await poll(async () => {
    try {
      const content = readFileSync(activePortFile, 'utf8').trim();
      return Number(content.split('\n')[0]);
    } catch {
      return null;
    }
  }, 15000, 'chrome DevTools port');
  console.log(`[print-check] chrome on port ${port}`);
  return { child, userDataDir, port };
};

const connect = async (port) => {
  const pages = await poll(
    async () => {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      if (!res.ok) return null;
      const list = await res.json();
      return list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl) ?? null;
    },
    10000,
    'chrome page target',
  );
  const ws = new WebSocket(pages.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  const cdp = new CdpClient(ws);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  return cdp;
};

const navigate = async (cdp, url) => {
  await cdp.send('Page.navigate', { url });
  await sleep(600);
  await cdp.send('Page.enable');
  await sleep(400);
};

const evaluate = async (cdp, expression) => {
  const { result, exceptionDetails } = await cdp.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (exceptionDetails) throw new Error(`evaluate failed: ${JSON.stringify(exceptionDetails)}`);
  return result.value;
};

const seedDoc = async (cdp) => {
  const spec = { blocks, paperSize: paper, orientation };
  if (pageBreaks.length) spec.pageBreaks = pageBreaks;
  const docId = await evaluate(cdp, `window.__seedDoc(${JSON.stringify(spec)})`);
  if (!docId) throw new Error('window.__seedDoc unavailable or returned empty id');
  console.log(`[print-check] seeded doc ${docId} (${blocks} blocks)`);
  return docId;
};

const waitStable = async (cdp) => {
  const count = await poll(
    async () => {
      const value = await evaluate(
        cdp,
        `(async () => {
          if (!document.fonts || !document.fonts.ready) return null;
          await document.fonts.ready;
          return { count: document.querySelectorAll('.page-stack .page').length };
        })()`,
      );
      if (!value || !value.count) return null;
      const prev = await evaluate(
        cdp,
        `(async () => {
          await new Promise((r) => setTimeout(r, 400));
          return document.querySelectorAll('.page-stack .page').length;
        })()`,
      );
      return prev === value.count ? value.count : null;
    },
    20000,
    'stable .page-stack .page count',
  );
  console.log(`[print-check] screen page count: ${count}`);
  return count;
};

const printPdf = async (cdp) => {
  const { data } = await cdp.send('Page.printToPDF', {
    preferCSSPageSize: true,
    printBackground: true,
    displayHeaderFooter: false,
  });
  const path = join(scratchDir, 'out.pdf');
  writeFileSync(path, Buffer.from(data, 'base64'));
  console.log(`[print-check] pdf written: ${path}`);
  return path;
};

/* ------------------------------ assertions ------------------------------ */

const markerRegex = /\[\[(\d+)\]\]/g;

const extractText = (pdfPath) =>
  execFileSync('pdftotext', ['-layout', pdfPath, '-'], { encoding: 'utf8' });

/**
 * Assert marker continuity across pages. Throws with a descriptive message on
 * any of: missing/duplicate/out-of-order markers, truncated markers, blank
 * pages, or (strictPages) page-count mismatch.
 */
const assertMarkers = (text, screenPageCount) => {
  const pageTexts = text
    .split('\f')
    .filter((p, i, arr) => !(i === arr.length - 1 && p.trim() === ''));
  const seen = [];
  for (const pageText of pageTexts) {
    const matches = [...pageText.matchAll(markerRegex)].map((m) => Number(m[1]));
    seen.push(...matches);
    const truncatedOpen = /\[\[\d*$/.test(pageText.trimEnd());
    const truncatedClose = /^\d*\]\]/.test(pageText.trimStart());
    if (truncatedOpen || truncatedClose) {
      throw new Error(`marker truncated across page boundary on page ${seen.length}`);
    }
  }

  const expected = Array.from({ length: blocks }, (_, i) => i + 1);
  if (seen.length !== expected.length) {
    throw new Error(
      `marker count mismatch: expected ${expected.length}, found ${seen.length} (${JSON.stringify(seen.slice(0, 30))}...)`,
    );
  }
  for (let i = 0; i < seen.length; i += 1) {
    if (seen[i] !== expected[i]) {
      throw new Error(`marker out of order at index ${i}: expected ${expected[i]}, found ${seen[i]}`);
    }
  }

  const emptyPages = pageTexts
    .map((t, i) => ({ i, t }))
    .filter(({ t }) => t.trim().length === 0)
    .map(({ i }) => i + 1);
  if (emptyPages.length) throw new Error(`blank pages detected: ${emptyPages.join(', ')}`);

  const pdfPages = pageTexts.length;
  if (strictPages && pdfPages !== screenPageCount) {
    throw new Error(`page count mismatch: pdf=${pdfPages}, screen=${screenPageCount}`);
  }
  console.log(
    `[print-check] markers: ${seen.length}/${expected.length} in order; pdf pages: ${pdfPages}${strictPages ? '' : ` (screen: ${screenPageCount})`}`,
  );
};

/* ------------------------------ self-test ------------------------------ */

const selftest = () => {
  const cases = [
    { name: 'good', text: '[[1]] a\n\f[[2]] b\n\f[[3]] c', blocks: 3, expect: 'pass' },
    { name: 'missing', text: '[[1]] a\n\f[[2]] b\n\f[[4]] c', blocks: 3, expect: 'fail' },
    { name: 'duplicate', text: '[[1]] a\n\f[[2]] b\n\f[[2]] c', blocks: 3, expect: 'fail' },
    { name: 'truncated', text: '[[1]] a\n\f[[2]] b\n\f[[3', blocks: 3, expect: 'fail' },
    { name: 'blank-page', text: '[[1]] a\n\f\n\f[[2]] b', blocks: 2, expect: 'fail' },
  ];
  let failures = 0;
  for (const c of cases) {
    const prevBlocks = blocks;
    blocks = c.blocks;
    const originalLog = console.log;
    console.log = () => undefined;
    let outcome = 'pass';
    try {
      assertMarkers(c.text, 3);
    } catch {
      outcome = 'fail';
    }
    console.log = originalLog;
    blocks = prevBlocks;
    const ok = outcome === c.expect;
    if (!ok) failures += 1;
    console.log(`[selftest] ${c.name}: got ${outcome}, expected ${c.expect} ${ok ? 'OK' : 'FAIL'}`);
  }
  if (failures) {
    console.error(`[selftest] ${failures} case(s) failed`);
    process.exit(1);
  }
  console.log('[selftest] all assertion cases pass');
  process.exit(0);
};

/* ------------------------------ main ------------------------------ */

const main = async () => {
  if (args.selftest === 'true') {
    selftest();
    return;
  }
  let chrome;
  try {
    await waitForServer();
    chrome = await launchChrome();
    const cdp = await connect(chrome.port);
    await navigate(cdp, `${BASE_URL}/`);
    await evaluate(cdp, 'new Promise((r) => setTimeout(r, 1500))');
    const docId = await seedDoc(cdp);
    await navigate(cdp, `${BASE_URL}/edit/${docId}`);
    const screenPageCount = await waitStable(cdp);
    const pdfPath = await printPdf(cdp);

    const text = extractText(pdfPath);
    const info = execFileSync('pdfinfo', [pdfPath], { encoding: 'utf8' });
    const pagesLine = info.split('\n').find((l) => l.startsWith('Pages:'));
    console.log(`[print-check] pdfinfo: ${pagesLine?.trim()}`);

    assertMarkers(text, screenPageCount);
    console.log('[print-check] PASS');
  } finally {
    if (chrome) {
      chrome.child.kill('SIGKILL');
      rmSync(chrome.userDataDir, { recursive: true, force: true });
    }
  }
};

main().catch((err) => {
  console.error('[print-check] FAIL:', err.message);
  if (process.env.PRINT_CHECK_DEBUG === '1') {
    try {
      const pdf = join(scratchDir, 'out.pdf');
      console.error('--- pdftotext (first 1500 chars) ---');
      console.error(extractText(pdf).slice(0, 1500));
    } catch {
      /* ignore */
    }
  }
  process.exit(1);
});