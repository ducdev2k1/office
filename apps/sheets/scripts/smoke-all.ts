import puppeteer from 'puppeteer-core';

const CHROME = '/usr/bin/google-chrome';
const URL = 'http://localhost:2012/';
const FILES = [
  '/home/ducnd/my_project/office/apps/sheets/public/sample-small.xlsx',
  '/home/ducnd/my_project/office/apps/sheets/public/sample-med.xlsx',
  '/home/ducnd/my_project/office/apps/sheets/public/sample-large.xlsx',
];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const main = async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  const failures: string[] = [];
  page.on('response', (res) => { if (res.status() >= 400) failures.push(`${res.status()} ${res.url()}`); });
  page.on('pageerror', (err) => failures.push(`[pageerror] ${err.message}`));

  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(1500);
  const input = await page.$('input[type=file]');
  if (!input) throw new Error('file input not found');

  for (const file of FILES) {
    const t0 = Date.now();
    await input.uploadFile(file);
    await sleep(3000);
    const t1 = Date.now();
    const canvas = await page.evaluate(() => document.querySelectorAll('canvas').length);
    const tabs = await page.evaluate(() =>
      [...document.querySelectorAll('[class*="tab"]')].map((el) => (el as HTMLElement).innerText).join(','),
    );
    const name = file.split('/').pop();
    console.log(`${name}: render=${t1 - t0}ms canvas=${canvas} tabs=[${tabs}]`);
  }
  console.log('http failures:', failures.length);
  failures.forEach((f) => console.log('  ', f));
  await browser.close();
  console.log(failures.length > 0 ? 'RESULT: FAIL' : 'RESULT: PASS');
};

main().catch((e) => { console.error(e); process.exit(1); });