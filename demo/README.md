# Automation Framework - Playwright + TypeScript

## 📋 Giới Thiệu

Framework automation web sử dụng **Playwright + TypeScript** với mô hình **Page Object Model (POM)**.

Framework tuân thủ các best practices:
- 🏗️ **POM Pattern**: Tách biệt UI locators từ test logic
- ✅ **Type-Safe**: Full TypeScript support
- 🎯 **Semantic Locators**: Sử dụng `getByRole()`, `getByLabel()` thay vì CSS/XPath
- 📊 **HTML Reports**: Auto-generate test reports
- 🔄 **Smart Waits**: Web-first assertions, không hard sleep
- 🎬 **Screenshots on Failure**: Tự động chụp screenshot khi test fail

## 🚀 Cài Đặt

### Prerequisites
- **Node.js >= 18.x**
- **npm >= 9.x**

### Bước 1: Clone hoặc Setup Project
```bash
cd automation-framework
```

### Bước 2: Cài Đặt Dependencies
```bash
npm install
npx playwright install
```

### Bước 3: Cấu Hình Environment
```bash
# Copy .env.example → .env
cp .env.example .env

# Chỉnh sửa .env với app URL và credentials
# APP_BASE_URL=http://your-app-url.com
# APP_LOGIN_USERNAME=your-email@example.com
# APP_LOGIN_PASSWORD=your-password
```

## 🧪 Chạy Tests

### Headed Mode (Hiển Thị Browser)
```bash
npm run test:headed
```

### Headless Mode (Chạy Nền)
```bash
npm test
```

### Debug Mode (Inspect & Step Through)
```bash
npm run test:debug
```

### UI Mode (Interactive Test Explorer)
```bash
npm run test:ui
```

### Chạy Test Cụ Thể
```bash
# Chạy 1 file test
npx playwright test src/tests/login.spec.ts

# Chạy test theo pattern
npx playwright test --grep "login"

# Chạy test từ line cụ thể
npx playwright test src/tests/login.spec.ts:10
```

### Xem Test Report
```bash
npm run report
```

## 📁 Cấu Trúc Project

```
automation-framework/
├── src/
│   ├── pages/                          # Page Objects (UI abstraction)
│   │   ├── base/
│   │   │   └── base.page.ts           # Base class với common methods
│   │   ├── login.page.ts              # Example: LoginPage
│   │   └── [feature]/
│   │       └── [page-name].page.ts
│   │
│   ├── tests/                         # Test Files
│   │   ├── example.login.spec.ts      # Example test
│   │   └── [feature]/
│   │       └── [name].spec.ts
│   │
│   ├── utils/                         # Helper Utilities
│   │   ├── logger.ts                  # Logging
│   │   ├── data-generator.ts          # Generate unique test data
│   │   └── env.config.ts              # Load environment config
│   │
│   ├── fixtures/                      # Test Fixtures (optional)
│   │   └── auth.fixture.ts
│   │
│   ├── constants/                     # Hardcoded Constants
│   │   └── timeout.ts                 # Timeout values
│   │
│   └── test-data/                     # Test Data Factories (optional)
│       └── [entity].factory.ts
│
├── test-results/                      # Test execution reports
│   ├── [test-name]/
│   │   ├── results.json
│   │   └── screenshots/
│   └── playwright-report.html
│
├── playwright.config.ts               # Playwright configuration
├── tsconfig.json                      # TypeScript configuration
├── package.json                       # Dependencies & scripts
├── .env.example                       # Environment template
├── .env                              # Local config (not committed)
└── README.md                         # This file
```

## 📝 Quy Tắc Phát Triển

### Page Object Model Pattern

**Tạo Page Object:**
```typescript
// src/pages/login.page.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from '@/pages/base/base.page';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByPlaceholder('Email');
    this.submitButton = page.getByRole('button', { name: 'Login' });
  }

  async login(username: string, password: string): Promise<void> {
    await this.fill(this.usernameInput, username);
    await this.fill(this.passwordInput, password);
    await this.click(this.submitButton);
  }
}
```

**Sử Dụng trong Test:**
```typescript
// src/tests/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '@/pages/login.page';

test('Login with valid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password123');
  
  expect(page.url()).toContain('/dashboard');
});
```

### Locator Priority (Thứ Tự Ưu Tiên)

1. **Semantic (Best)** — `getByRole()`, `getByLabel()`, `getByPlaceholder()`
```typescript
page.getByRole('button', { name: 'Submit' })
page.getByLabel('Email')
page.getByPlaceholder('Enter password')
```

2. **Test ID** — `getByTestId()`
```typescript
page.getByTestId('login-button')
```

3. **Text** — `getByText()`
```typescript
page.getByText('Welcome')
```

4. **CSS/XPath** (Last Resort)
```typescript
page.locator('input[name="email"]')
```

### Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { YourPage } from '@/pages/your.page';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Navigate, login, etc.
  });

  test('TC01: Clear test description', async ({ page }) => {
    // Arrange
    const page = new YourPage(page);
    
    // Act
    await page.performAction();
    
    // Assert
    expect(page.getResult()).toBeTruthy();
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: Delete data, logout, etc.
  });
});
```

### DO's & DON'Ts

✅ **DO:**
- Use `await expect(locator).toBeVisible()` instead of `await locator.waitForSelector()`
- Create reusable methods in Page Objects
- Use `DataGenerator.generateTestEmail()` for unique test data
- Keep tests independent (no shared state)
- Capture screenshots on failure (auto-enabled)

❌ **DON'T:**
- Hardcode URLs, timeouts, credentials in tests
- Use `page.waitForTimeout()` for delays
- Put assertions in Page Objects
- Use complex XPath or nth-child selectors
- Leave `console.log()` or commented code

## 📊 Test Reports

### HTML Report
```bash
npm run report
```

Opens `playwright-report/index.html` with:
- Test results summary
- Screenshots on failure
- Video recordings (if enabled)
- Detailed error messages

### Console Output
```
✓ [chromium] › example.login.spec.ts › Login Page › Example TC01 (2.5s)
✗ [chromium] › example.login.spec.ts › Login Page › Example TC02 (5.1s)
```

## 🐛 Debugging

### 1. Debug Mode
```bash
npm run test:debug
```
Opens Playwright Inspector with step-through capabilities.

### 2. Headed + Trace
```bash
npx playwright test --headed --trace=on
```

Then inspect trace:
```bash
npx playwright show-trace trace.zip
```

### 3. Screenshot Inspection
Failed tests auto-capture screenshots in `test-results/`

## 🔧 Configuration

### playwright.config.ts
- **baseURL**: `http://localhost:3000` (from `.env`)
- **viewport**: `1920x1080` (desktop viewport)
- **timeout**: `45s` (page load), `10s` (element wait)
- **retries**: `0` (local), `2` (CI)
- **workers**: `1` (sequential execution)
- **reporter**: `html` (test report)

### Custom Configuration
Edit `playwright.config.ts` to change:
- Browser types
- Parallel workers
- Timeouts
- Screenshot/video capture

## 📦 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@playwright/test` | ^1.48.2 | Test framework |
| `typescript` | ^5.7.3 | TypeScript support |
| `@types/node` | ^22.10.2 | Node.js types |

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Write tests following POM pattern
3. Run tests: `npm test`
4. Commit: `git commit -m "Add test for feature X"`
5. Push: `git push origin feature/my-feature`

## ❓ FAQ

**Q: Làm sao để test chạy song song?**
A: Thay `workers: 1` → `workers: 4` trong `playwright.config.ts`

**Q: Cách xóa test report cũ?**
A: `rm -rf test-results playwright-report`

**Q: Làm sao để skip test?**
A: `test.skip('Test name', ...)`

**Q: Làm sao để chạy 1 test file?**
A: `npx playwright test src/tests/login.spec.ts`

## 📞 Support

- **Documentation**: https://playwright.dev
- **GitHub Issues**: [Create issue](https://github.com/your-repo/issues)
- **Rules & Best Practices**: `.claude/rules/`

---

**Happy Testing! 🎉**
