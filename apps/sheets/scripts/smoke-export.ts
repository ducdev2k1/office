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
  const failures: string[] = [];
  page.on('response', (res) => { if (res.status() >= 400) failures.push(`${res.status()} ${res.url()}`); });
  page.on('pageerror', (err) => failures.push(`[pageerror] ${err.message}`));

  const client = await page.createCDPSession();
  await client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: '/tmp/opencode/downloads' });
  await client.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: '/tmp/opencode/downloads', eventsEnabled: true });

  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(1500);

  const input = await page.$('input[type=file]');
  if (!input) throw new Error('file input not found');
  await input.uploadFile(FILE);
  await sleep(3500);

  const clicked = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')];
    const btn = btns.find((b) => b.textContent?.includes('Export') || b.textContent?.includes('Xuất'));
    if (!btn) return false;
    btn.click();
    return true;
  });
  if (!clicked) throw new Error('export button not found');
  await sleep(3000);

  const fs = await import('fs');
  const dir = '/tmp/opencode/downloads';
  let files: string[] = [];
  if (fs.existsSync(dir)) files = fs.readdirSync(dir);
  const downloaded = files.filter((f) => f.endsWith('.xlsx'));
  console.log('downloaded files:', downloaded);

  const canvas = await page.evaluate(() => document.querySelectorAll('canvas').length);
  console.log('canvas count:', canvas);
  console.log('http/page errors:', failures.length);
  failures.slice(0, 6).forEach((f) => console.log('  ', f.slice(0, 120)));
  await browser.close();

  if (failures.length > 0 || downloaded.length === 0) {
    console.log('RESULT: FAIL');
    process.exitCode = 1;
  } else {
    console.log('RESULT: PASS');
  }
};

main().catch((e) => { console.error(e); process.exit(1); });