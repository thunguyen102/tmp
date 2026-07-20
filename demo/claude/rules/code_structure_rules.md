# Code Structure & Constants Management Rules

> **Tham khảo từ:** `C:\Users\ThinkPad\Downloads\doda\prefer\repo-test-skill-claude`
> 
> Mục đích: Định nghĩa cấu trúc code, quản lý constants, selectors, workflows, và fixtures một cách có tổ chức.
> **TUYỆT ĐỐI KHÔNG** hardcode business data, domain-specific values, hoặc credentials.

---

## 1. Cấu Trúc Thư Mục (Project Structure)

```
project-root/
├── constants/                    ← Fixed values (KHÔNG hardcode)
│   ├── index.ts                 ← Re-export all constants
│   ├── timeout.ts               ← Timeouts (PAGE_LOAD, ELEMENT_VISIBLE, etc.)
│   ├── url.ts                   ← URLs (read từ env, KHÔNG hardcode)
│   ├── credentials.ts           ← Login credentials (từ env)
│   ├── session.ts               ← Session values (cookies, tokens, etc.)
│   └── storage.ts               ← Local storage, session storage keys
│
├── selectors/                    ← Element locators (organize by feature/page)
│   ├── common.selectors.ts      ← Shared elements (header, footer, common widgets)
│   ├── feature-a/
│   │   ├── page1.selectors.ts
│   │   └── page2.selectors.ts
│   └── feature-b/
│       └── page3.selectors.ts
│
├── pages/                        ← Page Objects (organize by feature)
│   ├── base/
│   │   └── base.page.ts         ← Parent class (BasePage)
│   ├── common/
│   │   ├── header.page.ts
│   │   └── footer.page.ts
│   ├── feature-a/
│   │   ├── page1.page.ts
│   │   └── page2.page.ts
│   └── feature-b/
│       └── page3.page.ts
│
├── workflows/                    ← Multi-step business processes (organize by feature)
│   ├── auth.workflow.ts         ← Authentication workflows (login, logout, session)
│   ├── feature-a/
│   │   └── main.workflow.ts     ← Create, update, delete workflows
│   └── feature-b/
│       └── main.workflow.ts
│
├── utils/                        ← Helper functions
│   ├── dom-helper.ts            ← click, type, navigate, wait helpers
│   ├── data-generator.ts        ← Generate unique test data
│   ├── api-helper.ts            ← API calls (if needed)
│   └── logger.ts                ← Logging utilities
│
├── fixtures/                     ← Test fixtures
│   ├── user.fixture.ts          ← User role fixtures (admin, user, guest)
│   ├── auth.fixture.ts          ← Authentication fixture
│   ├── data.fixture.ts          ← Test data setup
│   └── state.fixture.ts         ← Pre-conditions setup
│
├── test-data/                    ← Test data factories
│   ├── factories/
│   │   ├── candidate-data.ts
│   │   └── user-data.ts
│   └── seeds/                    ← Pre-populated data for tests
│       └── sample-candidates.json
│
├── tests/                        ← Test files
│   ├── feature-a/
│   │   └── feature-a.spec.ts
│   └── feature-b/
│       └── feature-b.spec.ts
│
├── global-setup.ts              ← Global test setup (auth, data seed)
├── global-teardown.ts           ← Global cleanup
├── playwright.config.ts         ← Playwright configuration
├── .env.example                 ← Environment variables template
├── .env                         ← Environment variables (local, not committed)
└── tsconfig.json                ← TypeScript configuration
```

---

## 2. Constants Layer (KHÔNG Hardcode)

### Rule 2.1: Timeouts (`constants/timeout.ts`)

**Purpose:** Tập trung tất cả timeout values (KHÔNG inline trong code)

**Pattern:**
```typescript
export const TIMEOUT = {
  // Global / baseline timeouts
  PAGE_LOAD: 45_000,              // Page navigation wait
  DEFAULT_WAIT: 10_000,           // Default element wait
  SHORT_WAIT: 3_000,              // Quick UI updates
  ELEMENT_VISIBLE: 10_000,        // Element appears
  ELEMENT_INVISIBLE: 10_000,      // Element disappears
  QUICK_ACTION: 300,              // User quick action (click, focus)
  
  // Feature-specific timeouts
  LOGIN_FORM_APPEAR: 20_000,      // Login form loads
  LOGIN_SUBMIT_WAIT: 30_000,      // Login form submits
  
  // Async operations
  API_LONG_POLL: 30_000,          // Slow API calls
  FILE_TRANSFER: 60_000,          // File uploads/downloads
  EMAIL_TIMEOUT: 300_000,         // Email delivery wait
  FORM_SUBMIT_WAIT: 15_000,       // Form submit redirect
};
```

**Usage:**
```typescript
// ✅ CORRECT: Use constant
await safeClick(page, selector, TIMEOUT.ELEMENT_VISIBLE);

// ❌ WRONG: Hardcoded timeout
await safeClick(page, selector, 10_000);
```

---

### Rule 2.2: URLs (`constants/url.ts`)

**Pattern:**
```typescript
// NEVER hardcode URLs or domain names
// ALWAYS read base from environment

const BASE = process.env.APP_BASE_URL ?? "";

export const URLS = {
  APP_NAME: {
    LOGIN: `${BASE}/auth/login`,
    DASHBOARD: `${BASE}/dashboard/index`,
    PROFILE: `${BASE}/user/profile`,
  },
};
```

**Environment (`.env` or CI/CD secrets):**
```env
APP_BASE_URL=http://localhost:3000/web/index.php
```

**Usage:**
```typescript
// ✅ CORRECT: Use URL constant
await safeGoto(page, URLS.APP_NAME.LOGIN, loginInput, options);

// ❌ WRONG: Hardcoded URL
await page.goto('http://localhost:3000/web/index.php/auth/login');
```

---

### Rule 2.3: Credentials (`constants/credentials.ts`)

**Pattern:**
```typescript
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const CREDENTIALS = {
  APP_NAME: {
    USERNAME: requireEnv("APP_LOGIN_USERNAME"),
    PASSWORD: requireEnv("APP_LOGIN_PASSWORD"),
    ADMIN_USERNAME: requireEnv("APP_ADMIN_USERNAME"),
    ADMIN_PASSWORD: requireEnv("APP_ADMIN_PASSWORD"),
  },
};
```

**Usage:**
```typescript
// ✅ CORRECT: Use credentials constant
await loginPage.login(CREDENTIALS.APP_NAME.USERNAME, CREDENTIALS.APP_NAME.PASSWORD);

// ❌ WRONG: Hardcoded credentials
await loginPage.login('testuser@test.com', 'SecurePass@123');
```

---

## 3. Selectors Layer (Element Locators)

### Rule 3.1: Selector File Organization

**Structure:** `selectors/[feature]/[page].selectors.ts`

```typescript
// selectors/recruitment/login.selectors.ts
import { Page, Locator } from "@playwright/test";

export const LoginSelectors = {
  // Locators as functions (not strings!)
  getUsernameInput: (page: Page): Locator => 
    page.locator('input[name="username"]'),
  
  getPasswordInput: (page: Page): Locator => 
    page.locator('input[name="password"]'),
  
  getSubmitButton: (page: Page): Locator => 
    page.locator('button[type="submit"]'),
  
  getErrorMessage: (page: Page): Locator => 
    page.locator('[role="alert"]'),
};
```

**Pattern:**
- ✅ Named as `get[ElementName]()` function
- ✅ Returns `Locator` object
- ✅ Takes `page: Page` as parameter
- ✅ Semantic locators when possible
- ❌ NOT string literals
- ❌ NOT hardcoded in page objects or tests

---

## 4. Page Objects Layer (POM)

### Rule 4.1: Page Structure

```typescript
// pages/feature-a/login.page.ts
import { Page } from "@playwright/test";
import { BasePage } from "@/pages/base/base.page";
import { safeFill, safeClick, safeGoto } from "@/utils/dom-helper";
import { TIMEOUT, URLS } from "@/constants";
import { LoginSelectors as Sel } from "@/selectors/feature-a/login.selectors";

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // 1. Navigation method
  async goto(): Promise<void> {
    await safeGoto(
      this.page,
      URLS.APP_NAME.LOGIN,
      Sel.getUsernameInput(this.page),
      {
        navTimeout: TIMEOUT.PAGE_LOAD,
        visibleTimeout: TIMEOUT.LOGIN_FORM_APPEAR,
      }
    );
  }

  // 2. Individual action methods (smallest granularity)
  async enterUsername(username: string): Promise<void> {
    await safeFill(
      this.page,
      Sel.getUsernameInput(this.page),
      username,
      TIMEOUT.ELEMENT_VISIBLE
    );
  }

  async enterPassword(password: string): Promise<void> {
    await safeFill(
      this.page,
      Sel.getPasswordInput(this.page),
      password,
      TIMEOUT.ELEMENT_VISIBLE
    );
  }

  async clickSubmit(): Promise<void> {
    await safeClick(
      this.page,
      Sel.getSubmitButton(this.page),
      TIMEOUT.ELEMENT_VISIBLE
    );
  }

  // 3. Page-level workflow method
  async login(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickSubmit();
  }

  // 4. Verification methods (return state, not assertions)
  async isErrorDisplayed(): Promise<boolean> {
    return await Sel.getErrorMessage(this.page).isVisible();
  }

  async getErrorText(): Promise<string> {
    return await Sel.getErrorMessage(this.page).textContent() ?? '';
  }
}
```

**Rules:**
- ✅ Import constants, selectors, helpers
- ✅ Use selector functions (not inline strings)
- ✅ Use timeout constants
- ✅ Small granular methods (click, type, wait)
- ✅ Page-level workflows (login combines actions)
- ✅ Return state, not assertions
- ❌ No hardcoded values
- ❌ No test assertions
- ❌ No business logic

---

## 5. Workflows Layer (Multi-Step Business Processes)

### Rule 5.1: Workflow Structure

**Purpose:** Multi-step business processes that combine page objects and handle complex user journeys

**Location:** `workflows/[feature]/[name].workflow.ts`

```typescript
// workflows/auth.workflow.ts
import { Page } from "@playwright/test";
import { LoginPage } from "@/pages/feature-a/login.page";
import { DashboardPage } from "@/pages/feature-a/dashboard.page";
import { CREDENTIALS, TIMEOUT, URLS } from "@/constants";

class AuthWorkflow {
  /**
   * Multi-step workflow: Ensure page is in authenticated session
   * - Check if already authenticated
   * - If not, perform login
   * - Save session for reuse (optional)
   */
  async ensureAuthenticatedSession(
    page: Page,
    credentials: { USERNAME: string; PASSWORD: string }
  ): Promise<void> {
    // Step 1: Navigate to dashboard
    await page.goto(URLS.APP_NAME.DASHBOARD, {
      waitUntil: "domcontentloaded",
      timeout: TIMEOUT.PAGE_LOAD,
    });

    // Step 2: Check if already authenticated
    if (page.url().includes("/dashboard/index")) {
      // Already authenticated
      return;
    }

    // Step 3: Not authenticated, perform login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(credentials.USERNAME, credentials.PASSWORD);
    
    // Step 4: Wait for redirect to dashboard
    await page.waitForURL(/dashboard\/index/, { timeout: TIMEOUT.LOGIN_SUBMIT_WAIT });
  }

  /**
   * Simple login without session reuse
   * Use for: specific non-admin users, fresh accounts
   */
  async loginAs(
    page: Page,
    credentials: { username: string; password: string }
  ): Promise<void> {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(credentials.username, credentials.password);
    await page.waitForURL(/dashboard\/index/, { timeout: TIMEOUT.LOGIN_SUBMIT_WAIT });
  }

  /**
   * Logout workflow
   */
  async logout(page: Page): Promise<void> {
    // Navigate to logout URL or click logout button
    await page.goto(URLS.APP_NAME.LOGOUT, {
      waitUntil: "domcontentloaded",
      timeout: TIMEOUT.PAGE_LOAD,
    });
    // Verify redirected to login
    await page.waitForURL(/auth\/login/, { timeout: TIMEOUT.PAGE_LOAD });
  }
}

export default new AuthWorkflow();
```

### Rule 5.2: Feature Workflows

```typescript
// workflows/feature-a/candidate.workflow.ts
import { Page } from "@playwright/test";
import { CandidatePage } from "@/pages/feature-a/candidate.page";
import { CandidateConfig } from "@/test-data/factories/candidate-data";

export const CandidateWorkflow = {
  /**
   * Create candidate workflow
   * - Navigate to Add Candidate form
   * - Fill form with config data
   * - Submit form
   * - Extract created candidate ID from redirect
   * - Validate creation succeeded
   */
  async createCandidate(
    page: Page,
    config: CandidateConfig
  ): Promise<{ candidateId: string }> {
    const candidatePage = new CandidatePage(page);
    
    // Step 1: Navigate to form
    await candidatePage.gotoAdd();
    
    // Step 2: Fill form
    await candidatePage.form.enterFirstName(config.firstName);
    await candidatePage.form.enterLastName(config.lastName);
    await candidatePage.form.enterEmail(config.email);
    if (config.vacancyName) {
      await candidatePage.form.selectVacancy(config.vacancyName);
    }
    
    // Step 3: Submit form
    await candidatePage.form.save();
    
    // Step 4: Extract candidate ID from profile page
    const candidateId = candidatePage.currentProfileId();
    
    // Step 5: Validate
    if (!candidateId) {
      throw new Error(
        "Candidate save did not redirect — check for validation errors"
      );
    }
    
    return { candidateId };
  },

  /**
   * Delete candidate workflow
   */
  async deleteCandidate(page: Page, lastNameOrFullName: string): Promise<void> {
    const candidatePage = new CandidatePage(page);
    await candidatePage.goto();
    await candidatePage.list.deleteByName(lastNameOrFullName);
  },

  /**
   * Edit candidate workflow
   */
  async editCandidate(
    page: Page,
    candidateId: string,
    updates: Partial<CandidateConfig>
  ): Promise<void> {
    const candidatePage = new CandidatePage(page);
    await candidatePage.gotoProfile(candidateId);
    
    // Update fields that are provided
    if (updates.firstName) await candidatePage.form.enterFirstName(updates.firstName);
    if (updates.lastName) await candidatePage.form.enterLastName(updates.lastName);
    if (updates.email) await candidatePage.form.enterEmail(updates.email);
    
    await candidatePage.form.save();
  },
};
```

---

## 6. Test Data Management

### Rule 6.1: Traceable Test Data Generation

```typescript
// utils/data-generator.ts
export class DataGenerator {
  /**
   * Generate traceable email for automation tests
   * Format: auto_[featureName]_[timestamp]_[randomId]@test.com
   * Example: auto_login_1704067200_a3f2@test.com
   * 
   * Benefit: Can identify which test created this data in production DB logs
   */
  static generateTestEmail(featureName: string): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `auto_${featureName}_${timestamp}_${random}@test.com`;
  }

  /**
   * Generate unique username with traceability
   */
  static generateTestUsername(featureName: string): string {
    const timestamp = Math.floor(Date.now() / 1000);
    return `auto_${featureName}_${timestamp}`;
  }

  /**
   * Generate secure test password (meets common requirements)
   */
  static generateTestPassword(): string {
    return `AutoTest${Date.now()}@123`;
  }

  /**
   * Generate traceable phone number
   */
  static generateTestPhone(): string {
    return `555${String(Date.now()).slice(-7)}`;
  }

  /**
   * Generate random string
   */
  static generateRandomString(length: number = 8): string {
    return Math.random().toString(36).substring(2, length + 2);
  }
}
```

### Rule 6.2: Test Data Factories

```typescript
// test-data/factories/candidate-data.ts
import { DataGenerator } from "@/utils/data-generator";

export interface CandidateConfig {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  vacancyName?: string;
}

/**
 * Create candidate test data with traceable values
 */
export function createCandidateData(overrides?: Partial<CandidateConfig>): CandidateConfig {
  return {
    firstName: `AutoTest${Date.now()}`,
    lastName: `Candidate${Math.random().toString(36).substring(7)}`,
    email: DataGenerator.generateTestEmail('candidate'),
    phone: DataGenerator.generateTestPhone(),
    ...overrides, // Allow overrides
  };
}
```

**Usage:**
```typescript
// Test uses factory to create data
const candidateData = createCandidateData({
  firstName: "John", // Override if needed
});
await CandidateWorkflow.createCandidate(page, candidateData);
```

---

## 7. Helpers Utilities

### Rule 7.1: DOM Helpers

```typescript
// utils/dom-helper.ts
import { Page, Locator } from "@playwright/test";

export async function safeGoto(
  page: Page,
  url: string,
  readyIndicator: Locator,
  options?: { navTimeout?: number; visibleTimeout?: number }
): Promise<void> {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await readyIndicator.waitFor({ timeout: options?.visibleTimeout ?? 10_000 });
}

export async function safeClick(
  page: Page,
  element: Locator,
  timeout: number = 10_000
): Promise<void> {
  await element.waitFor({ timeout });
  await element.click();
}

export async function safeFill(
  page: Page,
  element: Locator,
  value: string,
  timeout: number = 10_000
): Promise<void> {
  await element.waitFor({ timeout });
  await element.clear();
  await element.fill(value);
}
```

---

## 8. Fixtures Layer (Test Setup)

### Rule 8.1: Authentication Fixture

```typescript
// fixtures/auth.fixture.ts
import { test as base } from '@playwright/test';
import { AuthWorkflow } from '@/workflows/auth.workflow';
import { CREDENTIALS } from '@/constants';

type AuthFixtures = {
  authenticatedPage: void;
  adminPage: void;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await AuthWorkflow.ensureAuthenticatedSession(page, CREDENTIALS.APP_NAME);
    await use();
  },

  adminPage: async ({ page }, use) => {
    await AuthWorkflow.ensureAuthenticatedSession(page, {
      USERNAME: CREDENTIALS.APP_NAME.ADMIN_USERNAME,
      PASSWORD: CREDENTIALS.APP_NAME.ADMIN_PASSWORD,
    });
    await use();
  },
});
```

**Usage:**
```typescript
import { test, expect } from '@/fixtures/auth.fixture';

test('Admin can manage users', async ({ adminPage, page }) => {
  // Page is already authenticated as admin
  // ... test logic
});
```

---

## 9. Test Structure

### Rule 9.1: Test Using All Layers

```typescript
// tests/feature-a/candidate.spec.ts
import { test, expect } from '@/fixtures/auth.fixture';
import { CandidateWorkflow } from '@/workflows/feature-a/candidate.workflow';
import { CandidatePage } from '@/pages/feature-a/candidate.page';
import { DataGenerator } from '@/utils/data-generator';
import { createCandidateData } from '@/test-data/factories/candidate-data';

test.describe('Candidate Management', () => {
  test('TC01: Create candidate with valid data', async ({ page }) => {
    // Arrange: Create test data using factory
    const candidateData = createCandidateData({
      firstName: 'John',
      lastName: 'Doe',
    });

    // Act: Use workflow for multi-step creation
    const { candidateId } = await CandidateWorkflow.createCandidate(
      page,
      candidateData
    );

    // Assert: Use page object to verify
    const candidatePage = new CandidatePage(page);
    expect(candidatePage.currentProfileId()).toBe(candidateId);
  });

  test('TC02: Delete candidate', async ({ page }) => {
    // Arrange: Create a candidate first
    const candidateData = createCandidateData();
    const { candidateId } = await CandidateWorkflow.createCandidate(
      page,
      candidateData
    );

    // Act: Delete using workflow
    await CandidateWorkflow.deleteCandidate(page, candidateData.lastName);

    // Assert: Verify deletion
    const candidatePage = new CandidatePage(page);
    await candidatePage.goto();
    expect(
      await candidatePage.list.findByName(candidateData.lastName)
    ).toBeNull();
  });
});
```

---

## 10. Environment Configuration

### Rule 10.1: `.env.example` Template

```env
# .env.example — Template (committed to git)
APP_BASE_URL=http://localhost:3000/web/index.php
APP_LOGIN_USERNAME=testuser@test.com
APP_LOGIN_PASSWORD=TestPass@123
APP_ADMIN_USERNAME=admin@test.com
APP_ADMIN_PASSWORD=AdminPass@123

BROWSER=chromium
HEADLESS=false
```

### Rule 10.2: `.env` Local

```env
# .env — Local (in .gitignore, never committed)
APP_BASE_URL=http://localhost:3000/web/index.php
APP_LOGIN_USERNAME=actual@company.com
APP_LOGIN_PASSWORD=ActualPassword@123
APP_ADMIN_USERNAME=admin@company.com
APP_ADMIN_PASSWORD=AdminPassword@123

BROWSER=chromium
HEADLESS=false
```

---

## 11. Anti-Patterns (TUYỆT ĐỐI KHÔNG)

| Anti-Pattern | ❌ WRONG | ✅ CORRECT |
|---|---|---|
| Hardcoded URL | `page.goto('http://localhost:3000/...')` | Use `URLS.APP_NAME.*` |
| Hardcoded timeout | `await element.waitFor({ timeout: 10000 })` | Use `TIMEOUT.*` |
| Hardcoded credentials | `login('user@test.com', 'pass')` | Use `CREDENTIALS.APP_NAME.*` |
| Inline selector | `page.locator('input[name="email"]')` | Create selector function |
| Hardcoded test data | `const email = 'test@test.com'` | Use `DataGenerator.*` or factory |
| DOM in test | `await page.click('button')` | Use page object method |
| Assertion in page | `expect(elem).toBeVisible()` | Return state, assert in test |
| Multi-step in page | Complex 10-step login in page object | Use workflow layer |

---

## 12. Layer Hierarchy (When to Use Each)

```
Test File (Arrange-Act-Assert)
    ↓
    Uses: Fixtures + Workflows
    ↓
Workflows Layer (Multi-step business processes)
    ↓
    Uses: Page Objects + Helpers
    ↓
Page Objects Layer (UI interaction)
    ↓
    Uses: Selectors + Helpers + Constants
    ↓
Selectors + Constants + Helpers
    ↓
    NO hardcoded values, NEVER
```

---

## 13. Code Generation Checklist

When implementation generates code:

- [ ] **Constants:** TIMEOUT, URLS, CREDENTIALS from constants/, not hardcoded
- [ ] **Selectors:** Separate selector files, functions returning Locator
- [ ] **Page Objects:** Use selectors, constants, helpers (no hardcoding)
- [ ] **Workflows:** Multi-step processes combining page objects
- [ ] **Helpers:** DOM operations (click, type, goto) with constants
- [ ] **Test Data:** Using DataGenerator or factories (traceable)
- [ ] **Tests:** Use fixtures, workflows, factories (no hardcoding)
- [ ] **Environment:** .env.example template, secrets from env vars
- [ ] **No hardcoded:** URLs, timeouts, credentials, test data, domain names

**Before delivery, verify: ZERO hardcoded business/domain values in any file** ✅
