import puppeteer from 'puppeteer-core';
import fs from 'fs';

const CHROME = '/usr/bin/google-chrome';
const URL = process.env.URL ?? 'http://localhost:2004/';
const FILE = process.env.FILE ?? '/home/ducnd/my_project/office/apps/sheets/public/sample-med.xlsx';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const main = async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  const errors: string[] = [];
  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error' || text.includes('Error')) errors.push(`[${msg.type()}] ${text}`);
  });
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));

  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(1500);

  const input = await page.$('input[type=file]');
  if (!input) throw new Error('file input not found');
  await input.uploadFile(FILE);
  await sleep(4000);

  const canvasCount = await page.evaluate(() => document.querySelectorAll('canvas').length);
  const cellsCount = await page.evaluate(() => {
    const els = document.querySelectorAll('[class*="cell"]');
    return els.length;
  });
  const tabCount = await page.evaluate(() => document.querySelectorAll('[class*="tab"]').length);

  console.log('canvas count:', canvasCount);
  console.log('cell-like nodes:', cellsCount);
  console.log('tab-like nodes:', tabCount);
  console.log('console/page errors:', errors.length);
  errors.slice(0, 8).forEach((e) => console.log('  ', e.slice(0, 160)));

  await browser.close();

  if (errors.length > 0) {
    console.log('RESULT: FAIL');
    process.exitCode = 1;
  } else {
    console.log('RESULT: PASS');
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});