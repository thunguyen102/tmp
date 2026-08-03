import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const featureDir = path.resolve('qa-automation', 'vacancies');
const evidenceDir = path.join(featureDir, 'logs', 'evidence');
fs.mkdirSync(evidenceDir, { recursive: true });

const logLines = [];
const log = (msg) => logLines.push(msg);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1600 } });

const saveScreenshot = async (name) => {
  await page.screenshot({ path: path.join(evidenceDir, name), fullPage: true });
};

try {
  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  log(`login url: ${page.url()}`);

  await page.locator('input[name="username"]').fill('Admin');
  await page.locator('input[name="password"]').fill('admin123');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle', timeout: 60000 }).catch(() => {}),
    page.getByRole('button', { name: /login/i }).click(),
  ]);
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {});
  log(`post-login url: ${page.url()}`);
  await saveScreenshot('dashboard.png');

  await page.getByText('Recruitment', { exact: true }).click();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {});
  log(`after recruitment: ${page.url()}`);

  await page.getByText('Vacancies', { exact: true }).click();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {});
  log(`after vacancies: ${page.url()}`);
  await saveScreenshot('vacancies.png');

  const bodyText = await page.locator('body').innerText();
  fs.writeFileSync(path.join(evidenceDir, 'body.txt'), bodyText, 'utf8');

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
  fs.writeFileSync(path.join(evidenceDir, 'controls.json'), JSON.stringify(controls, null, 2), 'utf8');
} catch (error) {
  log(`ERROR: ${error?.stack || error}`);
  fs.writeFileSync(path.join(evidenceDir, 'error.txt'), String(error?.stack || error), 'utf8');
} finally {
  fs.writeFileSync(path.join(evidenceDir, 'runlog.txt'), logLines.join('\n\n'), 'utf8');
  await browser.close();
}
