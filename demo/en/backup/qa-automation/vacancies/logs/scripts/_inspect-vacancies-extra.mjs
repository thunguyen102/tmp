import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('qa-automation', 'vacancies', 'logs', 'evidence');
fs.mkdirSync(outDir, { recursive: true });

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

  const hiring = page.locator('input[placeholder="Type for hints..."]');
  await hiring.fill('man');
  await page.waitForTimeout(2000);
  const hintText = await page.locator('body').innerText();
  fs.writeFileSync(path.join(outDir, 'hiring-man-body.txt'), hintText, 'utf8');

  const allTexts = await page.locator('[role="option"], .oxd-autocomplete-dropdown, .oxd-select-dropdown').evaluateAll((els) =>
    els.map((e) => (e.textContent || '').trim()).filter(Boolean),
  );
  fs.writeFileSync(path.join(outDir, 'hiring-man-options.json'), JSON.stringify(allTexts, null, 2), 'utf8');

  await page.keyboard.press('Escape').catch(() => {});
  const statusFilter = page.getByText('Status').locator('..');
  fs.writeFileSync(path.join(outDir, 'status-filter-text.txt'), await page.locator('body').innerText(), 'utf8');
} catch (error) {
  fs.writeFileSync(path.join(outDir, 'extra-inspect-error.txt'), String(error?.stack || error), 'utf8');
} finally {
  await browser.close();
}
