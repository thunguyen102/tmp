import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const featureDir = path.resolve('qa-automation', 'vacancies');
const evidenceDir = path.join(featureDir, 'logs', 'evidence');
fs.mkdirSync(evidenceDir, { recursive: true });

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
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {});
  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForTimeout(1000);

  await page.screenshot({ path: path.join(evidenceDir, 'blank-save-fresh.png'), fullPage: true });
  fs.writeFileSync(path.join(evidenceDir, 'blank-save-fresh-body.txt'), await page.locator('body').innerText(), 'utf8');

  const errors = await page.locator('.oxd-input-field-error-message, .oxd-text.oxd-text--span.oxd-input-field-error-message').evaluateAll((els) =>
    els.map((e) => (e.textContent || '').trim()).filter(Boolean),
  );
  fs.writeFileSync(path.join(evidenceDir, 'blank-save-fresh-errors.json'), JSON.stringify(errors, null, 2), 'utf8');
} catch (error) {
  fs.writeFileSync(path.join(evidenceDir, 'blank-save-fresh-error.txt'), String(error?.stack || error), 'utf8');
} finally {
  await browser.close();
}
