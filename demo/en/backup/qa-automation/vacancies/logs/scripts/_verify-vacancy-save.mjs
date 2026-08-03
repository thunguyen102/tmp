import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('qa-automation', 'vacancies', 'logs', 'evidence');
fs.mkdirSync(outDir, { recursive: true });

const uniqueName = `QA Vacancy ${Date.now()}`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1800 } });

try {
  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.locator('input[name="username"]').fill('Admin');
  await page.locator('input[name="password"]').fill('admin123');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle', timeout: 60000 }).catch(() => {}),
    page.getByRole('button', { name: /login/i }).click(),
  ]);
  await page.getByText('Recruitment', { exact: true }).click();
  await page.getByText('Vacancies', { exact: true }).click();
  await page.getByRole('button', { name: 'Add' }).click();

  await page.locator('input').first().fill(uniqueName);
  await page.locator('.oxd-select-text').click();
  await page.getByText('QA Engineer', { exact: true }).click();
  await page.locator('input[placeholder="Type for hints..."]').fill('Sumana');
  await page.waitForTimeout(1000);
  await page.getByText('Sumana Testuser', { exact: true }).first().click();
  await page.locator('input[type="checkbox"]').first().check().catch(() => {});
  await page.locator('button[type="submit"]').click();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {});
  await page.screenshot({ path: path.join(outDir, 'save-success.png'), fullPage: true });
  fs.writeFileSync(path.join(outDir, 'save-success-body.txt'), await page.locator('body').innerText(), 'utf8');
  fs.writeFileSync(path.join(outDir, 'save-success-name.txt'), uniqueName, 'utf8');
} catch (error) {
  fs.writeFileSync(path.join(outDir, 'save-success-error.txt'), String(error?.stack || error), 'utf8');
} finally {
  await browser.close();
}
