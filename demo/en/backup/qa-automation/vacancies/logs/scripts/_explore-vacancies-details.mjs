import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const featureDir = path.resolve('qa-automation', 'vacancies');
const evidenceDir = path.join(featureDir, 'logs', 'evidence');
fs.mkdirSync(evidenceDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1800 } });

const dumpText = async (name) => {
  const text = await page.locator('body').innerText();
  fs.writeFileSync(path.join(evidenceDir, name), text, 'utf8');
};

const dumpControls = async (name) => {
  const controls = await page.locator('input, button, textarea, select, [role="button"]').evaluateAll((els) =>
    els.map((e, i) => ({
      i,
      tag: e.tagName,
      role: e.getAttribute('role'),
      type: e.getAttribute('type'),
      name: e.getAttribute('name'),
      placeholder: e.getAttribute('placeholder'),
      aria: e.getAttribute('aria-label'),
      text: (e.innerText || e.value || '').trim(),
      id: e.id,
      className: e.className,
    })),
  );
  fs.writeFileSync(path.join(evidenceDir, name), JSON.stringify(controls, null, 2), 'utf8');
};

try {
  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await page.locator('input[name="username"]').fill('Admin');
  await page.locator('input[name="password"]').fill('admin123');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle', timeout: 60000 }).catch(() => {}),
    page.getByRole('button', { name: /login/i }).click(),
  ]);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {});
  await page.getByText('Recruitment', { exact: true }).click();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {});
  await page.getByText('Vacancies', { exact: true }).click();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {});
  await page.screenshot({ path: path.join(evidenceDir, 'vacancies-list.png'), fullPage: true });
  await dumpText('vacancies-list-body.txt');
  await dumpControls('vacancies-list-controls.json');

  const filterLabels = await page.locator('.oxd-input-group label, .oxd-select-wrapper label, label').evaluateAll((els) =>
    els.map((e) => (e.textContent || '').trim()).filter(Boolean),
  );
  fs.writeFileSync(path.join(evidenceDir, 'filter-labels.json'), JSON.stringify(filterLabels, null, 2), 'utf8');

  await page.getByRole('button', { name: 'Add' }).click();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {});
  await page.screenshot({ path: path.join(evidenceDir, 'add-form.png'), fullPage: true });
  await dumpText('add-form-body.txt');
  await dumpControls('add-form-controls.json');

  const formLabels = await page.locator('label').evaluateAll((els) =>
    els.map((e) => (e.textContent || '').trim()).filter(Boolean),
  );
  fs.writeFileSync(path.join(evidenceDir, 'add-form-labels.json'), JSON.stringify(formLabels, null, 2), 'utf8');

  const selectButtons = page.locator('[role="listbox"], [role="combobox"], .oxd-select-text');
  const count = await selectButtons.count();
  const optionSnapshots = [];
  for (let i = 0; i < count; i++) {
    const target = selectButtons.nth(i);
    const text = await target.innerText().catch(() => '');
    optionSnapshots.push({ index: i, text });
  }
  fs.writeFileSync(path.join(evidenceDir, 'select-snapshots.json'), JSON.stringify(optionSnapshots, null, 2), 'utf8');
} catch (error) {
  fs.writeFileSync(path.join(evidenceDir, 'details-error.txt'), String(error?.stack || error), 'utf8');
} finally {
  await browser.close();
}
