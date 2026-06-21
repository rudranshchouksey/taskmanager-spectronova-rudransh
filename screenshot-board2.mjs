import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1700 } });
await page.goto('http://localhost:5183', { waitUntil: 'networkidle' });
await page.waitForSelector('text=Tasks');
await page.click('button:has-text("Board")');
await page.waitForTimeout(300);
await page.screenshot({ path: 'board-tall.png', fullPage: false });
await browser.close();
