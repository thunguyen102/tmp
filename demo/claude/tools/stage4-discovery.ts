import { chromium, Browser, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const BASE_URL = requireEnv('APP_BASE_URL');
const ADMIN_USERNAME = requireEnv('APP_ADMIN_USERNAME');
const ADMIN_PASSWORD = requireEnv('APP_ADMIN_PASSWORD');

interface LocatorInfo {
  name: string;
  selector: string;
  type: string;
  verified: boolean;
}

interface DiscoveryResult {
  appAccessible: boolean;
  loginSuccessful: boolean;
  timestamp: string;
  vacancy: {
    formLocators: LocatorInfo[];
  };
  candidate: {
    formLocators: LocatorInfo[];
  };
  pipeline: {
    actionLocators: LocatorInfo[];
  };
  manualWorkflow: {
    vacancyCreated: boolean;
    candidateCreated: boolean;
    shortlistAction: boolean;
  };
  issues: string[];
  notes: string[];
}

async function runDiscovery() {
  let browser: Browser | null = null;
  const results: DiscoveryResult = {
    appAccessible: false,
    loginSuccessful: false,
    timestamp: new Date().toISOString(),
    vacancy: { formLocators: [] },
    candidate: { formLocators: [] },
    pipeline: { actionLocators: [] },
    manualWorkflow: {
      vacancyCreated: false,
      candidateCreated: false,
      shortlistAction: false,
    },
    issues: [],
    notes: [],
  };

  try {
    console.log('🚀 Starting Stage 4: Runtime Discovery...\n');

    browser = await chromium.launch({ headless: false });
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

    // Step 1: Access app
    console.log('📍 Step 1: Accessing OrangeHRM demo...');
    try {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
      results.appAccessible = true;
      console.log('✅ App accessible\n');
    } catch (error) {
      results.issues.push(`Cannot access ${BASE_URL}: ${error}`);
      console.log('❌ Cannot access app\n');
      throw error;
    }

    // Step 2: Login
    console.log('📍 Step 2: Logging in...');
    try {
      const usernameInput = page.locator('input[name="username"]');
      const passwordInput = page.locator('input[name="password"]');
      const submitBtn = page.locator('button[type="submit"]');

      await usernameInput.fill(ADMIN_USERNAME);
      await passwordInput.fill(ADMIN_PASSWORD);
      await submitBtn.click();

      // Wait for dashboard
      await page.waitForNavigation({ timeout: 30000 });
      results.loginSuccessful = true;
      console.log('✅ Login successful\n');
    } catch (error) {
      results.issues.push(`Login failed: ${error}`);
      console.log('❌ Login failed\n');
      throw error;
    }

    // Step 3: Navigate to Recruitment > Vacancies
    console.log('📍 Step 3: Navigating to Recruitment > Vacancies...');
    try {
      const recruitmentMenu = page.locator('span:has-text("Recruitment")').first();
      await recruitmentMenu.click();
      await page.waitForTimeout(1000);

      const vacanciesOption = page.locator('a:has-text("Vacancies")').first();
      await vacanciesOption.click();
      await page.waitForNavigation({ timeout: 15000 });
      console.log('✅ Navigated to Vacancies\n');
    } catch (error) {
      results.issues.push(`Cannot navigate to Vacancies: ${error}`);
      console.log('⚠️  Issue navigating to Vacancies\n');
    }

    // Step 4: Collect Add Vacancy form locators
    console.log('📍 Step 4: Collecting Add Vacancy form locators...');
    try {
      const addBtn = page.locator('button:has-text("Add")').first();
      await addBtn.click();
      await page.waitForTimeout(1500);

      // Inspect form
      const vacancyNameInput = page.locator('input[name="vacancyName"]');
      const jobTitleInput = page.locator('input[placeholder="Type for hints..."]').first();
      const hiringManagerInput = page.locator('input[placeholder="Type for hints..."]').nth(1);
      const positionsInput = page.locator('input[name="numOfPositions"]');
      const descriptionArea = page.locator('textarea[name="description"]');
      const publishCheckbox = page.locator('input[type="checkbox"]').first();
      const saveBtn = page.locator('button:has-text("Save")').first();

      results.vacancy.formLocators = [
        { name: 'Vacancy Name', selector: 'input[name="vacancyName"]', type: 'input', verified: await vacancyNameInput.isVisible().catch(() => false) },
        { name: 'Job Title', selector: 'input[placeholder="Type for hints..."]', type: 'autocomplete', verified: await jobTitleInput.isVisible().catch(() => false) },
        { name: 'Hiring Manager', selector: 'input[placeholder="Type for hints..."]', type: 'autocomplete', verified: await hiringManagerInput.isVisible().catch(() => false) },
        { name: 'Positions', selector: 'input[name="numOfPositions"]', type: 'input', verified: await positionsInput.isVisible().catch(() => false) },
        { name: 'Description', selector: 'textarea[name="description"]', type: 'textarea', verified: await descriptionArea.isVisible().catch(() => false) },
        { name: 'Publish to Web', selector: 'input[type="checkbox"]', type: 'checkbox', verified: await publishCheckbox.isVisible().catch(() => false) },
        { name: 'Save Button', selector: 'button:has-text("Save")', type: 'button', verified: await saveBtn.isVisible().catch(() => false) },
      ];

      console.log(`✅ Collected ${results.vacancy.formLocators.length} locators from Add Vacancy form\n`);
      results.vacancy.formLocators.forEach((loc) => {
        console.log(`   ${loc.verified ? '✅' : '⚠️'} ${loc.name}: ${loc.selector}`);
      });
      console.log('');
    } catch (error) {
      results.issues.push(`Error collecting Vacancy locators: ${error}`);
      console.log('⚠️  Issue collecting Vacancy locators\n');
    }

    // Step 5: Navigate to Candidates
    console.log('📍 Step 5: Navigating to Recruitment > Candidates...');
    try {
      const recruitmentMenu = page.locator('span:has-text("Recruitment")').first();
      await recruitmentMenu.click();
      await page.waitForTimeout(1000);

      const candidatesOption = page.locator('a:has-text("Candidates")').first();
      await candidatesOption.click();
      await page.waitForNavigation({ timeout: 15000 });
      console.log('✅ Navigated to Candidates\n');
    } catch (error) {
      results.issues.push(`Cannot navigate to Candidates: ${error}`);
      console.log('⚠️  Issue navigating to Candidates\n');
    }

    // Step 6: Collect Add Candidate form locators
    console.log('📍 Step 6: Collecting Add Candidate form locators...');
    try {
      const addBtn = page.locator('button:has-text("Add")').first();
      await addBtn.click();
      await page.waitForTimeout(1500);

      // Inspect form
      const firstNameInput = page.locator('input[name="firstName"]');
      const lastNameInput = page.locator('input[name="lastName"]');
      const emailInput = page.locator('input[name="email"]');
      const vacancyInput = page.locator('input[placeholder="Type for hints..."]').first();
      const phoneInput = page.locator('input[name="contactNumber"]');
      const resumeInput = page.locator('input[type="file"]');
      const saveBtn = page.locator('button:has-text("Save")').first();

      results.candidate.formLocators = [
        { name: 'First Name', selector: 'input[name="firstName"]', type: 'input', verified: await firstNameInput.isVisible().catch(() => false) },
        { name: 'Last Name', selector: 'input[name="lastName"]', type: 'input', verified: await lastNameInput.isVisible().catch(() => false) },
        { name: 'Email', selector: 'input[name="email"]', type: 'input', verified: await emailInput.isVisible().catch(() => false) },
        { name: 'Vacancy', selector: 'input[placeholder="Type for hints..."]', type: 'autocomplete', verified: await vacancyInput.isVisible().catch(() => false) },
        { name: 'Contact Number', selector: 'input[name="contactNumber"]', type: 'input', verified: await phoneInput.isVisible().catch(() => false) },
        { name: 'Resume', selector: 'input[type="file"]', type: 'file', verified: await resumeInput.isVisible().catch(() => false) },
        { name: 'Save Button', selector: 'button:has-text("Save")', type: 'button', verified: await saveBtn.isVisible().catch(() => false) },
      ];

      console.log(`✅ Collected ${results.candidate.formLocators.length} locators from Add Candidate form\n`);
      results.candidate.formLocators.forEach((loc) => {
        console.log(`   ${loc.verified ? '✅' : '⚠️'} ${loc.name}: ${loc.selector}`);
      });
      console.log('');
    } catch (error) {
      results.issues.push(`Error collecting Candidate locators: ${error}`);
      console.log('⚠️  Issue collecting Candidate locators\n');
    }

    // Step 7: Find pipeline actions
    console.log('📍 Step 7: Locating pipeline action buttons...');
    try {
      const actionButtons = page.locator('[role="button"][class*="action"]');
      const shortlistBtn = page.locator('button:has-text("Shortlist")').first();
      const rejectBtn = page.locator('button:has-text("Reject")').first();

      results.pipeline.actionLocators = [
        { name: 'Shortlist Action', selector: 'button:has-text("Shortlist")', type: 'button', verified: await shortlistBtn.isVisible().catch(() => false) },
        { name: 'Reject Action', selector: 'button:has-text("Reject")', type: 'button', verified: await rejectBtn.isVisible().catch(() => false) },
      ];

      console.log(`✅ Collected ${results.pipeline.actionLocators.length} pipeline action locators\n`);
      results.pipeline.actionLocators.forEach((loc) => {
        console.log(`   ${loc.verified ? '✅' : '⚠️'} ${loc.name}: ${loc.selector}`);
      });
      console.log('');
    } catch (error) {
      results.issues.push(`Error collecting Pipeline locators: ${error}`);
      console.log('⚠️  Issue collecting Pipeline locators\n');
    }

    results.notes.push('✅ Runtime discovery completed successfully');
    results.notes.push(`Total locators collected: ${results.vacancy.formLocators.length + results.candidate.formLocators.length + results.pipeline.actionLocators.length}`);

    console.log('📊 Discovery Results:\n');
    console.log(`✅ App Accessible: ${results.appAccessible}`);
    console.log(`✅ Login Successful: ${results.loginSuccessful}`);
    console.log(`✅ Vacancy Form Locators: ${results.vacancy.formLocators.length}`);
    console.log(`✅ Candidate Form Locators: ${results.candidate.formLocators.length}`);
    console.log(`✅ Pipeline Action Locators: ${results.pipeline.actionLocators.length}`);
    console.log(`\n🔴 Issues Found: ${results.issues.length}`);
    if (results.issues.length > 0) {
      results.issues.forEach((issue) => console.log(`   - ${issue}`));
    }
    console.log('\n✅ Stage 4 Discovery Complete!\n');

    // Save results
    const outputPath = path.join(process.cwd(), 'docs', 'planning', 'stage4-locators.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`📁 Results saved to: ${outputPath}\n`);

    await browser.close();
  } catch (error) {
    console.error('❌ Discovery failed:', error);
    if (browser) await browser.close();
    process.exit(1);
  }
}

runDiscovery();
