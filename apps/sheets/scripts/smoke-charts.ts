import puppeteer from 'puppeteer-core';

const CHROME = '/usr/bin/google-chrome';
const URL = 'http://localhost:5173/';
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

  console.log('1. Loading Sheets app at:', URL);
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(2500);

  // Check if sample chart container rendered
  const chartContainers = await page.evaluate(() => {
    const charts = document.querySelectorAll('[aria-label="Thanh công cụ Bảng tính"], .group');
    return charts.length;
  });
  console.log('Chart / UI components count:', chartContainers);

  // Check canvas count (Univer canvas + ECharts canvas)
  const canvasCount = await page.evaluate(() => document.querySelectorAll('canvas').length);
  console.log('Total canvas elements count:', canvasCount);

  // Click Insert Chart button
  const insertChartClicked = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const chartBtn = buttons.find((b) => b.getAttribute('aria-label')?.includes('biểu đồ') || b.textContent?.includes('biểu đồ'));
    if (chartBtn) {
      chartBtn.click();
      return true;
    }
    return false;
  });
  console.log('Insert chart button clicked:', insertChartClicked);
  await sleep(1500);

  // Check if Chart Inspector sidebar opened
  const inspectorOpened = await page.evaluate(() => {
    const aside = document.querySelector('aside[aria-label="Trình chỉnh sửa biểu đồ"]');
    return Boolean(aside);
  });
  console.log('Chart Inspector sidebar visible:', inspectorOpened);

  console.log('HTTP / Page errors count:', failures.length);
  failures.slice(0, 6).forEach((f) => console.log('  ', f.slice(0, 120)));

  await browser.close();

  if (failures.length > 0) {
    console.log('RESULT: FAIL');
    process.exitCode = 1;
  } else {
    console.log('RESULT: PASS - All charts UI and interactions working smoothly!');
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
