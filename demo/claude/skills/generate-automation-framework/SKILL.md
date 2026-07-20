---
name: generate-automation-framework
description: Thiết kế và scaffold automation framework Playwright hoàn chỉnh với POM, base classes, và CI/CD templates.
---

# Workflow: Thiết Kế Automation Framework

Scaffold Playwright + TypeScript automation framework cho Web automation. Framework này tuân thủ POM pattern, best practices từ rules, và sẵn sàng chạy.

## ⚠️ Nguyên tắc thực thi

- **Tất cả output bằng Tiếng Việt**
- **Stack cố định**: Playwright + TypeScript cho Web (KHÔNG hỏi framework/language/test-type)
- **PHẢI tạo artifact `task.md`** để theo dõi tiến độ
- Mỗi file sinh ra phải **biên dịch/chạy được ngay** — không để placeholder `// TODO`
- Framework phải tuân thủ `.claude/rules/automation_rules.md`, `.claude/rules/code_structure_rules.md`, `.claude/rules/playwright_rules.md`
- **Output Files Organization (BẮT BUỘC):**
  - Documentation files → `docs/guides/` (lowercase naming: `orchestrator-guide.md`)
  - Test plans → `docs/planning/` (lowercase naming: `recruitment-test-plan.md`)
  - Implementation summaries → `docs/planning/` (lowercase naming: `implementation-summary.md`)
  - Code files → `src/`, `.claude/` theo cấu trúc project
  - Không tạo file UPPERCASE (e.g., ❌ `ORCHESTRATOR_GUIDE.MD`)

## Stack

| Platform | Stack | Ngôn ngữ | Runner | Report |
|---|---|---|---|---|
| 🌐 Web | Playwright | TypeScript | Playwright Test | HTML Report, Allure |

## Các bước thực hiện

### Bước 1: Thu thập yêu cầu (Requirements Gathering — ⏸️ CHECKPOINT)

**CHỈ hỏi 4 câu hỏi sau** (stack đã fixed: Playwright + TypeScript):

| # | Câu hỏi | Mục đích | Mặc định |
|---|---|---|---|
| 1 | Project name? | Đặt tên thư mục | `automation-framework` |
| 2 | Có cần CI/CD pipeline không? | Sinh GitHub Actions workflow | Có |
| 3 | Reporting tool? | HTML Report hoặc Allure | HTML Report + Allure |
| 4 | Parallel execution? | Config number of workers | Không (sequential) |

**Sau khi nhận answers:**

Xác nhận lại configuration trước khi scaffold:
```
📋 Playwright + TypeScript Framework:
✅ Stack: Playwright + TypeScript + Playwright Test
✅ Platform: Web Automation
✅ Project name: [user-input]
✅ CI/CD: [Yes/No]
✅ Reporting: [user-choice]
✅ Parallel: [user-choice]

Bạn xác nhận để tôi bắt đầu scaffold không?
```

**Chờ user xác nhận** rồi mới sang Bước 2

### Bước 2: Scaffold Project Structure (Foundation)

1. **Tạo artifact `task.md`** để theo dõi checklist:
   ```markdown
   # Framework Setup Progress
   - [x] Bước 1: Thu thập yêu cầu
   - [ ] Bước 2: Scaffold project structure
   - [ ] Bước 3: Sinh base classes
   - [ ] Bước 4: Sinh example tests
   - [ ] Bước 5: Cấu hình reporting & CI/CD
   - [ ] Bước 6: Verify & Deliver
   ```

2. **Tạo thư mục project** theo template Playwright + TypeScript:
   ```
   src/
   ├── pages/base/base.page.ts
   ├── pages/[feature]/[name].page.ts
   ├── tests/[feature]/[name].spec.ts
   ├── utils/
   ├── fixtures/
   ├── test-data/
   └── config/
   ```

3. **Sinh file cấu hình build:**

   - `package.json` — dependencies: `@playwright/test`, devDependencies phù hợp
   - `playwright.config.ts` — baseURL, viewport (1920x1080), timeout, retries, reporter
   - `tsconfig.json` — paths, strict mode
   - `.env.example` — template environment variables

4. **Tạo file .gitignore** phù hợp (node_modules, target, __pycache__, .env, reports...)
5. **Tạo README.md** với hướng dẫn:
   - Prerequisites (Node.js >= 18.x)
   - Installation steps (npm install, npx playwright install)
   - Cách chạy test (npm test, npm run test:headed)
   - Project structure overview
   - Best practices & conventions

### Bước 3: Sinh Core Classes (Base Layer)

1. **Configuration Management:**
   - `src/utils/env.config.ts` — Đọc `.env`, export typed config object

2. **Browser Management:**
   - `playwright.config.ts` + fixtures — Browser config trong config, auth trong fixtures

3. **Base Page class:**
   - Common methods: `navigate()`, `click()`, `type()`, `getText()`, `isVisible()`
   - Built-in smart waits (KHÔNG có hard sleep)
   - Screenshot on failure
   - Logging mỗi action

4. **Base Test class:**
   - Setup: khởi tạo browser, navigate to baseURL
   - Teardown: đóng browser, capture screenshot nếu fail
   - Test lifecycle hooks (beforeAll, afterAll, beforeEach, afterEach)

5. **Utilities:**
   - `DataGenerator` — sinh email, username, phone unique + traceable
   - `Logger` — structured logging (console hoặc winston)
   - `ScreenshotUtil` — capture on failure
   - `env.config.ts` — load environment variables from .env

### Bước 4: Sinh Example Tests (Validation Layer)

1. **Tạo example Page Object:**
   - `src/pages/login.page.ts` — LoginPage với locators + methods
   - Sử dụng Playwright semantic locators (getByRole, getByLabel, getByPlaceholder)
   - Comment: `// REPLACE: Update after inspecting actual DOM`

2. **Tạo example Test:**
   - `src/tests/login.spec.ts` — ít nhất 2-3 test cases
   - Arrange → Act → Assert pattern
   - Assertions có message rõ ràng
   - Dùng DataGenerator cho unique test data

### Bước 5: Cấu hình Reporting & CI/CD (Integration Layer)

1. **Reporting setup:**
   - HTML + Allure report (cấu hình trong `playwright.config.ts`)
   - Screenshot auto-attach on failure
   - Test step logging trong report

2. **CI/CD Pipeline** (nếu user yêu cầu Yes ở Bước 1):

   Sinh file `.github/workflows/playwright.yml`:
   - Install Node.js + dependencies
   - Install Playwright browsers
   - Run tests in headless mode
   - Upload HTML report as artifact
   - Parallel workers config (nếu user yêu cầu)

### Bước 6: Verify & Deliver (Quality Gate)

1. **Kiểm tra framework build được:**
   ```bash
   npm install && npx playwright install && npx playwright test --list
   ```

2. **Chạy example test** để verify framework hoạt động:
   - Nếu PASS → framework sẵn sàng
   - Nếu FAIL do thiếu app/URL → acceptable (ghi note trong README)
   - Nếu FAIL do lỗi code framework → sửa ngay

3. **Review checklist** trước khi bàn giao:
   - [ ] ✅ `npm install` thành công
   - [ ] ✅ `npx playwright install` thành công
   - [ ] ✅ `npx playwright test --list` hiển thị test cases
   - [ ] ✅ BasePage có common methods (click, fill, getText, isVisible, etc.)
   - [ ] ✅ Example LoginPage + LoginTest có sẵn
   - [ ] ✅ DataGenerator + Logger + env.config.ts hoạt động
   - [ ] ✅ playwright.config.ts cấu hình đúng (viewport 1920x1080, reporters, parallel)
   - [ ] ✅ POM pattern được tuân thủ
   - [ ] ✅ KHÔNG có hard sleep (`waitForTimeout()`)
   - [ ] ✅ README.md hướng dẫn đầy đủ
   - [ ] ✅ .gitignore cover node_modules, .env, reports
   - [ ] ✅ KHÔNG có console.log, commented code, TODO placeholder
   - [ ] ✅ CI/CD pipeline tạo sẵn (nếu user yêu cầu)

4. **Cập nhật `task.md`** với trạng thái hoàn thành

## Xử lý tình huống đặc biệt

| Tình huống | Cách xử lý |
|---|---|
| **User muốn parallel execution** | Config `workers: 4` trong playwright.config.ts (already included if user chose Yes) |
| **User muốn CI/CD pipeline** | Sinh `.github/workflows/playwright.yml` (already included if user chose Yes) |
| **Example test fail do app không có** | Acceptable — ghi note trong README: "Update BASE_URL trong .env để test" |

## Output File Organization

**PHẢI organize files vào đúng folders + lowercase naming:**

```
docs/                          ← TẠO NẾU CHƯA CÓ
├── guides/                    ← Documentation & guides
│   ├── orchestrator-guide.md
│   ├── framework-setup.md
│   └── best-practices.md
└── planning/                  ← Project planning & analysis
    ├── implementation-summary.md
    ├── recruitment-test-plan.md
    └── scope-checklist.md

src/                           ← Code structure (như bình thường)
├── pages/
├── tests/
├── utils/
└── config/

.claude/orchestrator/          ← Orchestrator code (nếu deploy)
├── orchestrator.ts
├── README.md
└── QUICK_START.md

Code config files (root):      ← Cấu hình project
├── package.json
├── playwright.config.ts
├── tsconfig.json
├── .env.example
└── .gitignore
```

**Naming Convention (BẮT BUỘC):**
- ✅ `orchestrator-guide.md` (lowercase, hyphen)
- ✅ `implementation-summary.md`
- ✅ `recruitment-test-plan.md`
- ❌ `ORCHESTRATOR_GUIDE.MD` (UPPERCASE)
- ❌ `Implementation_Summary.md` (mixed case)
- ❌ `recruitment_test_plan.md` (underscore)

## Output

### Code Files
- **Project structure** đầy đủ (tất cả thư mục + files)
- **Build config** (package.json)
- **Framework config** (playwright.config.ts)
- **Base classes** (BasePage, BaseTest)
- **Utilities** (TestDataGenerator, WaitHelper, ScreenshotUtil, Logger)
- **Reporting integration** (Allure + HTML Report)
- **CI/CD pipeline** (GitHub Actions template)
- **README.md** (setup guide + project overview)

### Documentation Files
- `docs/guides/orchestrator-guide.md` — Complete guide (if generated)
- `docs/planning/implementation-summary.md` — What was delivered
- `docs/planning/recruitment-test-plan.md` — Test plan (if generated)

### Progress Tracking
- **Artifact `task.md`** (checklist tiến độ)