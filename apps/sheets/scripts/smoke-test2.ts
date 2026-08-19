import puppeteer from 'puppeteer-core';

const CHROME = '/usr/bin/google-chrome';
const URL = process.env.URL ?? 'http://localhost:2012/';
const FILE = process.env.FILE ?? '/home/ducnd/my_project/office/apps/sheets/public/sample-med.xlsx';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const main = async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  const failures: string[] = [];
  page.on('response', (res) => {
    if (res.status() >= 400) failures.push(`${res.status()} ${res.url()}`);
  });
  page.on('pageerror', (err) => failures.push(`[pageerror] ${err.message}`));

  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(1500);
  const input = await page.$('input[type=file]');
  if (!input) throw new Error('file input not found');
  await input.uploadFile(FILE);
  await sleep(4000);

  const canvasCount = await page.evaluate(() => document.querySelectorAll('canvas').length);
  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 300));
  console.log('canvas count:', canvasCount);
  console.log('body text preview:', JSON.stringify(bodyText));
  console.log('http failures:', failures.length);
  failures.forEach((f) => console.log('  ', f));
  await browser.close();
  console.log(failures.length > 0 ? 'RESULT: FAIL' : 'RESULT: PASS');
};

main().catch((e) => { console.error(e); process.exit(1); });