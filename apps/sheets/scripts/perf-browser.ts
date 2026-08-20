import puppeteer from 'puppeteer-core';

const CHROME = '/usr/bin/google-chrome';
const URL = 'http://localhost:2012/';
const FILE = '/home/ducnd/my_project/office/apps/sheets/public/sample-med.xlsx';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const main = async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();

  const t0 = Date.now();
  await page.goto(URL, { waitUntil: 'load', timeout: 30000 });
  const loadMs = Date.now() - t0;

  await sleep(3000);
  const bootMetrics = await page.evaluate(() => ({
    jsHeap: (performance as any).memory?.usedJSHeapSize ?? 0,
    resources: performance.getEntriesByType('resource').length,
    transferred: performance
      .getEntriesByType('resource')
      .reduce((a, e: any) => a + (e.transferSize || 0), 0),
  }));

  const input = await page.$('input[type=file]');
  if (!input) throw new Error('file input not found');
  const t1 = Date.now();
  await input.uploadFile(FILE);
  await sleep(3500);
  const afterLoadMs = Date.now() - t1;
  const afterMetrics = await page.evaluate(() => ({
    jsHeap: (performance as any).memory?.usedJSHeapSize ?? 0,
    canvas: document.querySelectorAll('canvas').length,
  }));

  console.log('initial load (networkidle-load):', loadMs, 'ms');
  console.log(
    'after boot: jsHeap',
    Math.round(bootMetrics.jsHeap / 1048576),
    'MB, resources',
    bootMetrics.resources,
    'transferred',
    Math.round(bootMetrics.transferred / 1024),
    'KB',
  );
  console.log('xlsx med load+render:', afterLoadMs, 'ms');
  console.log(
    'after xlsx: jsHeap',
    Math.round(afterMetrics.jsHeap / 1048576),
    'MB, canvas',
    afterMetrics.canvas,
  );
  await browser.close();
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
