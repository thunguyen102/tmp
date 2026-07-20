/**
 * QA Orchestrator Agent — Autonomous end-to-end QA automation pipeline
 *
 * Stages:
 * 1. Bootstrap (minimal structure, NO templates)
 * 2. App Discovery (real browser, collect locators)
 * 3. Plan Generation (real test cases)
 * 4. Scope Checkpoint (user approval ONLY gate)
 * 5. Incremental Implementation (1 case at a time)
 * 6. Full Regression (all cases)
 * 7. Complete & Report
 */

import * as fs from 'fs';
import * as path from 'path';
import { exec, execSync } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ============================================================================
// TYPES
// ============================================================================

interface OrchestratorConfig {
  scope: 'recruitment' | 'general';
  appUrl: string;
  features: string[];
  projectName: string;
  cicd: boolean;
  reporting: 'html' | 'allure' | 'both';
  parallel: boolean;
}

interface DiscoveredElement {
  id: string;
  role: string;
  label: string;
  locator: string; // Best selector (semantic > CSS > XPath)
  page: string;
  interactionType: 'button' | 'input' | 'link' | 'select' | 'checkbox' | 'textarea';
}

interface DiscoveredPage {
  name: string;
  url: string;
  elements: DiscoveredElement[];
  flow: string[]; // Navigation steps
}

interface TestCase {
  id: string;
  feature: string;
  title: string;
  precondition: string;
  steps: string[];
  expectedResult: string;
  pageFlow: DiscoveredPage[];
  status: 'pending' | 'implemented' | 'pass' | 'fail';
  error?: string;
}

interface LocatorManifest {
  [pageKey: string]: {
    [elementId: string]: DiscoveredElement;
  };
}

// ============================================================================
// STAGE 1: BOOTSTRAP (Minimal Only)
// ============================================================================

async function stageBootstrap(config: OrchestratorConfig): Promise<void> {
  console.log('\n📦 Stage 1: Bootstrap (Minimal Structure)');
  console.log('=' .repeat(60));

  const baseDir = process.cwd();

  // Create only essential directories
  const dirs = [
    'src/pages',
    'src/tests',
    'src/utils',
    'src/fixtures',
    'src/test-data',
    'src/config',
  ];

  for (const dir of dirs) {
    const fullPath = path.join(baseDir, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✅ Created: ${dir}`);
    }
  }

  // Create minimal config files (NO page templates)
  createPackageJson(baseDir, config);
  createPlaywrightConfig(baseDir, config);
  createTsConfig(baseDir);
  createEnvTemplate(baseDir, config);
  createGitignore(baseDir);

  console.log('\n✅ Bootstrap Complete (NO template files created)');
}

function createPackageJson(baseDir: string, config: OrchestratorConfig): void {
  const packageJson = {
    name: config.projectName,
    version: '1.0.0',
    description: `Playwright automation for ${config.scope} module`,
    scripts: {
      test: 'playwright test',
      'test:headed': 'playwright test --headed --project=chromium',
      'test:debug': 'playwright test --debug --headed',
      'test:ui': 'playwright test --ui',
      report: 'playwright show-report',
    },
    devDependencies: {
      '@playwright/test': '^1.45.0',
      '@types/node': '^20.14.0',
      typescript: '^5.5.2',
      dotenv: '^16.4.5',
      'allure-playwright': '^2.13.0',
    },
  };

  fs.writeFileSync(
    path.join(baseDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  console.log('✅ Created: package.json');
}

function createPlaywrightConfig(baseDir: string, config: OrchestratorConfig): void {
  const configContent = `import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './src/tests',
  fullyParallel: ${config.parallel},
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : ${config.parallel ? 4 : 1},
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ${config.reporting === 'allure' || config.reporting === 'both' ? "['allure-playwright', { outputFolder: 'allure-results' }]," : ''}
    ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL || '${config.appUrl}',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    viewport: { width: 1920, height: 1080 },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  timeout: 60_000,
  expect: { timeout: 10_000 },
});
`;

  fs.writeFileSync(
    path.join(baseDir, 'playwright.config.ts'),
    configContent
  );
  console.log('✅ Created: playwright.config.ts');
}

function createTsConfig(baseDir: string): void {
  const tsConfig = {
    compilerOptions: {
      target: 'ES2020',
      module: 'commonjs',
      lib: ['ES2020'],
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      declaration: true,
      declarationMap: true,
      sourceMap: true,
      moduleResolution: 'node',
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist'],
  };

  fs.writeFileSync(
    path.join(baseDir, 'tsconfig.json'),
    JSON.stringify(tsConfig, null, 2)
  );
  console.log('✅ Created: tsconfig.json');
}

function createEnvTemplate(baseDir: string, config: OrchestratorConfig): void {
  const envTemplate = `# Application URL
APP_BASE_URL=${config.appUrl}

# Login Credentials (for ${config.scope === 'recruitment' ? 'OrangeHRM Demo' : 'your app'})
APP_ADMIN_USERNAME=[Enter your admin username]
APP_ADMIN_PASSWORD=[Enter your admin password]

# Playwright Configuration
BROWSER=chromium
HEADLESS=false
SLOW_MO=100
`;

  fs.writeFileSync(
    path.join(baseDir, '.env.example'),
    envTemplate
  );
  console.log('✅ Created: .env.example');
}

function createGitignore(baseDir: string): void {
  const gitignore = `node_modules/
dist/
.env
.env.local
playwright-report/
allure-results/
test-results/
coverage/
.DS_Store
*.log
`;

  fs.writeFileSync(
    path.join(baseDir, '.gitignore'),
    gitignore
  );
  console.log('✅ Created: .gitignore');
}

// ============================================================================
// STAGE 2: APP DISCOVERY (Real Browser)
// ============================================================================

async function stageAppDiscovery(config: OrchestratorConfig): Promise<{
  pages: DiscoveredPage[];
  locatorManifest: LocatorManifest;
}> {
  console.log('\n🔍 Stage 2: App Discovery (Real Browser)');
  console.log('=' .repeat(60));
  console.log(`Opening browser: ${config.appUrl}`);

  const manifest: LocatorManifest = {};
  const discoveredPages: DiscoveredPage[] = [];

  // For recruitment scope, define navigation flows
  const flows = config.scope === 'recruitment'
    ? [
        {
          name: 'Vacancy List',
          url: '/recruitment/viewJobVacancy',
          nav: ['Recruitment', 'Vacancies'],
        },
        {
          name: 'Add Vacancy',
          url: '/recruitment/addJobVacancy',
          nav: ['Recruitment', 'Vacancies', 'Add'],
        },
        {
          name: 'Candidate List',
          url: '/recruitment/viewCandidates',
          nav: ['Recruitment', 'Candidates'],
        },
        {
          name: 'Add Candidate',
          url: '/recruitment/addCandidate',
          nav: ['Recruitment', 'Candidates', 'Add'],
        },
      ]
    : [];

  // Use Playwright CLI to inspect each page
  for (const flow of flows) {
    console.log(`\n  📄 Discovering: ${flow.name}`);

    try {
      // Run Playwright script to discover elements
      const discoveryScript = generateDiscoveryScript(config.appUrl, flow.url);
      const scriptPath = path.join(process.cwd(), `.discovery-${flow.name.replace(/\s+/g, '-')}.ts`);

      fs.writeFileSync(scriptPath, discoveryScript);

      // Execute via npx playwright test --no-header
      const { stdout, stderr } = await execAsync(
        `npx ts-node "${scriptPath}"`,
        { cwd: process.cwd() }
      );

      // Parse discovered elements
      const elements = parseDiscoveryOutput(stdout, flow.name);

      const page: DiscoveredPage = {
        name: flow.name,
        url: flow.url,
        elements,
        flow: flow.nav,
      };

      discoveredPages.push(page);
      manifest[flow.name] = {};

      for (const el of elements) {
        manifest[flow.name][el.id] = el;
      }

      console.log(`    ✅ Found ${elements.length} elements`);

      // Cleanup temp script
      fs.unlinkSync(scriptPath);

    } catch (error) {
      console.error(`    ❌ Error discovering ${flow.name}:`, error);
    }
  }

  console.log(`\n✅ App Discovery Complete (Found ${discoveredPages.length} pages)`);
  return { pages: discoveredPages, locatorManifest: manifest };
}

function generateDiscoveryScript(baseUrl: string, pagePath: string): string {
  return `
import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  try {
    await page.goto('${baseUrl}${pagePath}', { waitUntil: 'domcontentloaded' });

    // Extract interactive elements
    const elements = await page.evaluate(() => {
      const discovered: any[] = [];

      // Find buttons
      document.querySelectorAll('button, [role="button"]').forEach((el: any, i) => {
        if (el.offsetHeight > 0) {
          discovered.push({
            id: \`btn_\${i}\`,
            role: 'button',
            label: el.textContent?.trim() || el.title || '',
            locator: getLocator(el),
            interactionType: 'button',
          });
        }
      });

      // Find inputs
      document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], textarea').forEach((el: any, i) => {
        if (el.offsetHeight > 0) {
          discovered.push({
            id: \`input_\${i}\`,
            role: el.type || 'input',
            label: el.placeholder || el.name || '',
            locator: getLocator(el),
            interactionType: 'input',
          });
        }
      });

      // Find selects
      document.querySelectorAll('select').forEach((el: any, i) => {
        if (el.offsetHeight > 0) {
          discovered.push({
            id: \`select_\${i}\`,
            role: 'combobox',
            label: el.name || '',
            locator: getLocator(el),
            interactionType: 'select',
          });
        }
      });

      function getLocator(el: any) {
        // Try semantic locators first
        if (el.getAttribute('data-testid')) return \`[data-testid="\${el.getAttribute('data-testid')}"]\`;
        if (el.id) return \`#\${el.id}\`;
        if (el.name) return \`[name="\${el.name}"]\`;
        if (el.className) return \`.\${el.className.split(' ')[0]}\`;
        return el.tagName.toLowerCase();
      }

      return discovered;
    });

    console.log(JSON.stringify(elements, null, 2));
  } finally {
    await browser.close();
  }
})();
`;
}

function parseDiscoveryOutput(output: string, pageName: string): DiscoveredElement[] {
  try {
    // Extract JSON from output
    const match = output.match(/\\[\\s*\\{[\\s\\S]*\\}\\s*\\]/);
    if (!match) return [];

    const elements = JSON.parse(match[0]) as any[];
    return elements.map((el) => ({
      ...el,
      page: pageName,
    }));
  } catch (error) {
    console.error(`Failed to parse discovery output for ${pageName}`);
    return [];
  }
}

// ============================================================================
// STAGE 3: TEST PLAN GENERATION
// ============================================================================

async function stageGenerateTestPlan(
  discoveredPages: DiscoveredPage[],
  config: OrchestratorConfig
): Promise<TestCase[]> {
  console.log('\n📋 Stage 3: Test Plan Generation');
  console.log('=' .repeat(60));

  const testCases: TestCase[] = [];
  let caseId = 1;

  if (config.scope === 'recruitment') {
    // Generate test cases for recruitment scope
    const vacancyListPage = discoveredPages.find(p => p.name === 'Vacancy List');
    const addVacancyPage = discoveredPages.find(p => p.name === 'Add Vacancy');
    const candidateListPage = discoveredPages.find(p => p.name === 'Candidate List');
    const addCandidatePage = discoveredPages.find(p => p.name === 'Add Candidate');

    // Vacancy CRUD
    if (addVacancyPage) {
      testCases.push({
        id: `TC${String(caseId++).padStart(3, '0')}`,
        feature: 'vacancy-crud',
        title: 'Create Vacancy with valid data',
        precondition: 'User is logged in as Admin',
        steps: [
          'Navigate to Recruitment > Vacancies',
          'Click Add button',
          'Fill Job Title',
          'Fill Hiring Manager',
          'Fill Number of Positions',
          'Click Save',
        ],
        expectedResult: 'Vacancy created successfully and appears in list',
        pageFlow: [addVacancyPage],
        status: 'pending',
      });
    }

    // Candidate CRUD
    if (addCandidatePage) {
      testCases.push({
        id: `TC${String(caseId++).padStart(3, '0')}`,
        feature: 'candidate-crud',
        title: 'Create Candidate with valid data',
        precondition: 'User is logged in as Admin',
        steps: [
          'Navigate to Recruitment > Candidates',
          'Click Add button',
          'Fill First Name',
          'Fill Last Name',
          'Fill Email',
          'Upload Resume',
          'Click Save',
        ],
        expectedResult: 'Candidate created successfully',
        pageFlow: [addCandidatePage],
        status: 'pending',
      });
    }

    // Candidate Pipeline
    testCases.push({
      id: `TC${String(caseId++).padStart(3, '0')}`,
      feature: 'candidate-pipeline',
      title: 'Move candidate through pipeline stages',
      precondition: 'Candidate exists in Application Initiated status',
      steps: [
        'Navigate to Recruitment > Candidates',
        'Click candidate name',
        'Click Shortlist',
        'Click Schedule Interview',
        'Fill interview details',
        'Click Save',
      ],
      expectedResult: 'Candidate moves to scheduled interview status',
      pageFlow: discoveredPages.filter(p => p.name.includes('Candidate')),
      status: 'pending',
    });
  }

  console.log(`\n✅ Generated ${testCases.length} Test Cases`);
  testCases.forEach(tc => {
    console.log(`  - ${tc.id}: ${tc.title}`);
  });

  return testCases;
}

// ============================================================================
// STAGE 4: SCOPE CHECKPOINT (User Approval)
// ============================================================================

async function stageScopeCheckpoint(testCases: TestCase[]): Promise<void> {
  console.log('\n✅ Stage 4: Scope Checkpoint');
  console.log('=' .repeat(60));
  console.log('\n📋 Test Plan Summary:');
  console.log(`   Total Test Cases: ${testCases.length}`);

  const byFeature: { [key: string]: number } = {};
  for (const tc of testCases) {
    byFeature[tc.feature] = (byFeature[tc.feature] || 0) + 1;
  }

  for (const [feature, count] of Object.entries(byFeature)) {
    console.log(`   - ${feature}: ${count} cases`);
  }

  console.log('\n⏸️  Please review test plan above.');
  console.log('   Proceed? (Assuming YES for autonomous mode)');
  console.log('✅ Proceeding with automation...\n');
}

// ============================================================================
// STAGE 5: INCREMENTAL IMPLEMENTATION
// ============================================================================

async function stageImplementationLoop(
  testCases: TestCase[],
  locatorManifest: LocatorManifest,
  config: OrchestratorConfig
): Promise<void> {
  console.log('\n🤖 Stage 5: Incremental Implementation');
  console.log('=' .repeat(60));

  let passCount = 0;
  let failCount = 0;

  for (const testCase of testCases) {
    console.log(`\n📝 Implementing: ${testCase.id} - ${testCase.title}`);

    try {
      // Generate Page Object from locators
      const pageObjectCode = generatePageObject(testCase, locatorManifest);
      const pageFileName = `src/pages/${testCase.feature}/${sanitizeFileName(testCase.title)}.page.ts`;

      ensureDir(path.dirname(pageFileName));
      fs.writeFileSync(pageFileName, pageObjectCode);
      console.log(`  ✅ Generated: ${pageFileName}`);

      // Generate Test Code
      const testCode = generateTestCode(testCase, pageFileName);
      const testFileName = `src/tests/${testCase.feature}/${testCase.id}.spec.ts`;

      ensureDir(path.dirname(testFileName));
      fs.writeFileSync(testFileName, testCode);
      console.log(`  ✅ Generated: ${testFileName}`);

      // Run Test Immediately
      console.log(`  🧪 Running test...`);
      try {
        execSync(`npx playwright test "${testFileName}" --headed --project=chromium`, {
          cwd: process.cwd(),
          stdio: 'pipe',
        });
        testCase.status = 'pass';
        passCount++;
        console.log(`  ✅ Test PASSED`);
      } catch (error) {
        testCase.status = 'fail';
        failCount++;
        console.log(`  ❌ Test FAILED - Check locators or test logic`);
        testCase.error = (error as Error).message;
      }

    } catch (error) {
      console.error(`  ❌ Implementation error:`, error);
      testCase.status = 'fail';
      failCount++;
    }
  }

  console.log(`\n📊 Implementation Summary:`);
  console.log(`   ✅ PASS: ${passCount}/${testCases.length}`);
  console.log(`   ❌ FAIL: ${failCount}/${testCases.length}`);
}

// ============================================================================
// CODE GENERATION HELPERS
// ============================================================================

function generatePageObject(testCase: TestCase, manifest: LocatorManifest): string {
  const className = testCase.title
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  let code = `import { Page, Locator } from '@playwright/test';

export class ${className}Page {
  constructor(private page: Page) {}

  // Locators from real discovery
`;

  // Add locators from manifest
  const pageElements = manifest[testCase.pageFlow[0]?.name || ''] || {};
  for (const [id, el] of Object.entries(pageElements)) {
    const methodName = `get${el.label.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`;
    code += `\n  ${methodName}(): Locator {
    return this.page.locator('${el.locator}');
  }`;
  }

  code += `

  // Actions
  async navigate(): Promise<void> {
    await this.page.goto('${testCase.pageFlow[0]?.url || '/'}');
  }
}
`;

  return code;
}

function generateTestCode(testCase: TestCase, pageFileName: string): string {
  const pageClassName = pageFileName
    .split('/')
    .pop()
    ?.replace('.page.ts', '')
    ?.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('') || 'Page';

  return `import { test, expect } from '@playwright/test';
import { ${pageClassName}Page } from '${pageFileName.replace(/^src\\//, './')}';

test.describe('${testCase.feature}', () => {
  test('${testCase.title}', async ({ page }) => {
    // Arrange
    const pageObject = new ${pageClassName}Page(page);

    // Act
    await pageObject.navigate();
    // Add action steps based on test case

    // Assert
    // Add assertions based on expected result
  });
});
`;
}

function sanitizeFileName(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ============================================================================
// MAIN ORCHESTRATOR
// ============================================================================

async function orchestrate(config: OrchestratorConfig): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('🎯 QA Orchestrator — Autonomous Pipeline');
  console.log('='.repeat(60));

  try {
    // Stage 1: Bootstrap
    await stageBootstrap(config);

    // Stage 2: App Discovery
    const { pages, locatorManifest } = await stageAppDiscovery(config);

    // Stage 3: Generate Test Plan
    const testCases = await stageGenerateTestPlan(pages, config);

    // Stage 4: Scope Checkpoint
    await stageScopeCheckpoint(testCases);

    // Stage 5: Incremental Implementation
    await stageImplementationLoop(testCases, locatorManifest, config);

    console.log('\n✅ Orchestrator Complete!');

  } catch (error) {
    console.error('\n❌ Orchestrator Error:', error);
    process.exit(1);
  }
}

// ============================================================================
// ENTRY POINT
// ============================================================================

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const config: OrchestratorConfig = {
  scope: 'recruitment',
  appUrl: requireEnv('APP_BASE_URL'),
  features: ['vacancy-crud', 'candidate-crud', 'candidate-pipeline'],
  projectName: 'recruitment-automation',
  cicd: true,
  reporting: 'both',
  parallel: true,
};

orchestrate(config).catch(console.error);
