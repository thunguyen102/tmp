---
name: generate-automation-from-ui-flow
description: Thực thi UI flow trực tiếp trên browser, thu thập locators từ DOM thực tế, và sinh automation scripts. Hỗ trợ Playwright, Selenium, Appium.
---

# Workflow: Sinh Automation từ UI Flow

> **BẮT BUỘC (MANDATORY SKILL):** Bạn PHẢI nạp và đọc kỹ nội dung của skill **`$ui-debug-agent`** (tại `.agents/skills/ui-debug-agent/SKILL.md`) trước khi bắt đầu. Ngoài ra tham khảo thêm skill **`$smart-locator-agent`** để sinh locator ổn định và **`$qa-automation-engineer`** cho quy tắc automation chung.

Workflow này giúp agent **thực thi trực tiếp** một chuỗi thao tác UI trên browser thật, thu thập locators từ DOM thực tế, và sinh automation scripts hoàn chỉnh — tất cả trong một luồng tự động, không cần manual test case có sẵn.

## ⚠️ Nguyên tắc thực thi

- **Tất cả output bằng Tiếng Việt**
- **TUYỆT ĐỐI KHÔNG ĐOÁN locator** — phải lấy từ DOM thực tế bằng MCP browser tools
- **Phải chạy từng bước UI trên browser thật** trước khi sinh code
- **Desktop viewport 1920×1080** cho tất cả UI debugging
- ⚠️ **Rule E3:** Khi test FAIL → tự đọc log → phân tích → sửa → chạy lại. KHÔNG hỏi user

## Workflow này khác gì `$generate-automation-from-testcases`?

| | `from_testcases` | `from_ui_flow` (workflow này) |
|---|---|---|
| **Input** | File manual test cases có sẵn | Mô tả UI steps bằng lời hoặc URL + hành động |
| **Approach** | Đọc TC → inspect UI → sinh code | **Chạy thật trên browser** → thu thập locator → sinh code |
| **Khi nào dùng** | Đã có test case document | Chưa có TC, chỉ biết "vào trang này, click cái kia" |

## Input cần thu thập

Agent cần ít nhất **1 trong các input** sau từ user:

| Input | Ví dụ | Độ ưu tiên |
|---|---|---|
| **URL + UI steps mô tả** | "Vào https://example.com, login, tạo user mới" | ⭐ Phổ biến nhất |
| **URL + recording/video** | User cung cấp video thao tác | Tùy chọn |
| **URL + screenshots** | User cung cấp ảnh chụp từng bước | Tùy chọn |
| **Chỉ URL** | "Automate login flow của trang này" | Agent tự khám phá |

Nếu user chưa cung cấp đủ → hỏi:
- URL ứng dụng?
- Mô tả flow cần automate (từng bước)?
- Credentials nếu cần đăng nhập?
- Framework mong muốn? (mặc định: Playwright + TypeScript)

## Các bước thực hiện

### Bước 1: Tiếp nhận & Chuẩn bị (Setup)

1. **Parse UI steps** từ user input:
   - Chuyển mô tả bằng lời thành danh sách steps có cấu trúc:
     ```
     Step 1: Navigate to https://example.com/login
     Step 2: Enter username "admin@test.com"
     Step 3: Enter password "***"
     Step 4: Click Login button
     Step 5: Verify dashboard is displayed
     ```

2. **Xác nhận tech stack** với user (nếu chưa rõ):

   | Framework | Ngôn ngữ | Khi nào dùng |
   |---|---|---|
   | **Playwright** | TypeScript | Mặc định cho web automation |
   | **Playwright** | Python | Khi user dùng Python stack |
   | **Selenium** | Java | Khi user yêu cầu Java/Selenium |
   | **Appium** | Java | Mobile app automation |

3. **Tạo artifact `task.md`** để theo dõi tiến độ:
   ```markdown
   # UI Flow Automation Progress
   - [ ] Bước 1: Chuẩn bị — parse UI steps
   - [ ] Bước 2: Chạy UI flow trên browser — thu thập locators
   - [ ] Bước 3: Sinh Page Objects + Test scripts
   - [ ] Bước 4: Chạy test + Auto-heal
   ```

### Bước 2: Chạy UI Flow trên Browser & Thu thập Locators (Live Recon)

> ⚡ Đây là bước **quan trọng nhất** — phân biệt workflow này với các workflow khác.

1. **Mở browser bằng MCP** và navigate đến URL:
   ```
   browser_navigate → URL
   browser_resize → 1920 × 1080
   browser_wait_for → page load hoàn tất
   browser_snapshot → thu thập DOM ban đầu
   ```

2. **Thực thi từng step** theo danh sách, với mỗi step:

   ```
   a. browser_snapshot → đọc DOM, xác định element cần tương tác
   b. Xác định locator tốt nhất (theo locator priority)
   c. Thực thi action (click / type / select / hover)
   d. browser_snapshot → xác nhận kết quả action
   e. Ghi nhận vào bảng locator collection
   ```

3. **Bảng Locator Collection** (ghi nhận sau mỗi step):

   | Step | Action | Element | Primary Locator | Fallback Locator | Verified |
   |---|---|---|---|---|---|
   | 1 | Navigate | — | — | — | ✅ |
   | 2 | Type | Username input | `getByLabel('Email')` | `#email` | ✅ |
   | 3 | Type | Password input | `getByLabel('Password')` | `#password` | ✅ |
   | 4 | Click | Login button | `getByRole('button', {name: 'Login'})` | `button[type=submit]` | ✅ |
   | 5 | Assert | Dashboard title | `getByRole('heading', {name: 'Dashboard'})` | `.dashboard-title` | ✅ |

4. **Locator Priority** (tuân thủ `.agents/rules/locator_strategy.md`):

   **Playwright:**
   `getByRole()` → `getByLabel()` → `getByPlaceholder()` → `getByText()` → `getByTestId()` → CSS → XPath

   **Selenium:**
   `id` → `data-testid` → `name` → CSS selector → XPath

   **Appium:**
   `accessibility-id` → `id` → `name` → `xpath` (relative)

5. **Xử lý tình huống khi chạy UI:**

   | Tình huống | Cách xử lý |
   |---|---|
   | Element không tìm thấy | `browser_snapshot` lại → kiểm tra DOM → thử locator khác |
   | Page chưa load xong | `browser_wait_for` text/element → retry |
   | Modal/popup xuất hiện | Xử lý popup trước → tiếp tục flow |
   | Redirect/navigation | `browser_snapshot` lại ở page mới |
   | Cần scroll | `browser_evaluate` → scrollIntoView |
   | Cần đăng nhập | Hỏi user credentials hoặc dùng fixture sẵn có |
   | CAPTCHA / 2FA | Thông báo user — không thể automate |

6. **Screenshot evidence** — chụp lại ở các milestone quan trọng:
   - Sau khi login thành công
   - Sau khi hoàn thành flow chính
   - Khi gặp lỗi/unexpected state

### Bước 3: Sinh Automation Scripts (Code Generation)

1. **Sinh Page Object classes** từ locator collection:

   **Playwright TypeScript:**
   ```typescript
   // src/pages/login.page.ts
   import { Page, Locator } from '@playwright/test';

   export class LoginPage {
     readonly page: Page;
     readonly emailInput: Locator;
     readonly passwordInput: Locator;
     readonly loginButton: Locator;

     constructor(page: Page) {
       this.page = page;
       this.emailInput = page.getByLabel('Email');
       this.passwordInput = page.getByLabel('Password');
       this.loginButton = page.getByRole('button', { name: 'Login' });
     }

     async login(email: string, password: string) {
       await this.emailInput.fill(email);
       await this.passwordInput.fill(password);
       await this.loginButton.click();
     }
   }
   ```

   **Selenium Java:**
   ```java
   // src/main/java/.../pages/LoginPage.java
   public class LoginPage extends BasePage {
     @FindBy(id = "email")
     private WebElement emailInput;

     @FindBy(id = "password")
     private WebElement passwordInput;

     @FindBy(css = "button[type='submit']")
     private WebElement loginButton;

     public void login(String email, String password) {
       waitAndType(emailInput, email);
       waitAndType(passwordInput, password);
       waitAndClick(loginButton);
     }
   }
   ```

2. **Sinh Test class:**
   - Import Page Objects
   - Structure: **Arrange → Act → Assert**
   - Assertions rõ ràng với message mô tả
   - Test data unique + traceable (dùng timestamp/random)

3. **Nguyên tắc sinh code:**
   - Locator PHẢI lấy từ Bước 2 (đã verify trên DOM) — KHÔNG ĐOÁN
   - Không hardcode test data (credentials đọc từ env/config)
   - Không dùng `waitForTimeout()` / `Thread.sleep()` — chỉ smart waits
   - Method names mô tả hành vi user, không mô tả thao tác DOM
   - Mỗi page → 1 file, mỗi test → 1 file

### Bước 4: Chạy Test & Tự sửa lỗi (Execution & Auto-Heal)

1. **Chạy test** bằng `run_command` (Auto-detect OS & adapt):

   ⚠️ **AUTO-DETECTION STRATEGY (Skill automatically detects & adapts):**
   ```
   Skill detects OS → Tự động chọn execution method:
   
   IF OS == "Darwin" (Mac):
     ├─ Check: Playwright MCP available?
     │  ├─ YES → Use MCP (browser_navigate → browser_snapshot)
     │  └─ NO → Fallback to CLI
     └─ Final command: 
        npx playwright test <file> --headed --project=chromium --trace=on
   
   ELSE IF OS == "Windows" OR "Linux":
     └─ Final command:
        npx playwright test <file> --headed --project=chromium --trace=on
   
   ENDIF
   
   Result: Browser always visible (--headed), command auto-adapted to OS
   ```

   **Pseudo-code (Skill Implementation):**
   ```typescript
   const platform = process.platform; // 'darwin' = Mac, 'win32' = Windows
   
   console.log(`🔍 Auto-detecting platform: ${platform}`);
   
   if (platform === 'darwin') {
     // Mac - Try MCP first for interactive inspection
     console.log('🍎 Detected macOS - Attempting Playwright MCP...');
     
     if (hasPlaywrightMCP()) {
       console.log('✅ Playwright MCP available - Using for live inspection');
       // Use MCP: browser_navigate → browser_resize → browser_snapshot
     } else {
       console.log('⚠️  MCP not available - Falling back to CLI');
     }
   } else {
     console.log(`💻 Detected ${platform === 'win32' ? 'Windows' : 'Linux'} - Using CLI`);
   }
   
   // Execute test with auto-enforced settings
   const cmd = 'npx playwright test <file> --headed --project=chromium --trace=on';
   console.log(`📋 Executing: ${cmd}`);
   await run_command(cmd);
   ```

   **What Happens Automatically:**
   ```
   Mac:
   ├─ Detects Darwin platform
   ├─ Tries MCP first (interactive + visual)
   ├─ Falls back to CLI if MCP unavailable
   └─ Browser visible in both cases ✅
   
   Windows / Linux:
   ├─ Detects Windows/Linux platform
   ├─ Uses CLI directly
   └─ Browser visible with trace ✅
   
   Result: Correct tool for each OS, user doesn't think about it
   ```

   ⚠️ **GUARANTEED (Auto-enforced by Skill):**
   - ✅ Single browser: `--project=chromium` (auto-added)
   - ✅ Single run: NO `--repeat-each` (auto-prevented)
   - ✅ Headed mode: `--headed` (auto-added, always)
   - ✅ OS-adaptive: Best tool for platform (auto-selected)
   - ✅ Trace: `--trace=on` (auto-added)
   - ✅ Browser visible: Guaranteed (auto-enforced)
   - ❌ NEVER multi-browser (auto-prevented)
   - ❌ NEVER headless (auto-prevented)

2. **Theo dõi kết quả** qua `command_status`:
   - Nếu **PASS** → SUCCESS (1/1 run)
   - Nếu **FAIL** → vào vòng lặp Auto-Heal:

   ```
   WHILE test FAIL (tối đa 5 vòng):
     1. Đọc error log → xác định step fail
     2. Phân loại lỗi:
        - Locator sai → mở browser MCP, inspect lại DOM, thay locator
        - Timing issue → thêm smart wait hoặc adjust assertion timeout
        - Page state sai → kiểm tra flow, thêm wait cho navigation
        - Test data conflict → sinh data mới (unique)
     3. Sửa code bằng replace_file_content / multi_replace_file_content
     4. Chạy lại test (chromium only, single run)
   ```

3. **✅ PASS Criteria (Incremental Mode):**
   - Test chạy 1 lần trên chromium
   - Test PASS
   - Done! → Next test case
   - ❌ NO: "Verify stability" by running again
   - ❌ NO: Multi-browser verification for incremental approach

4. **⚠️ Rule E3:** KHÔNG hỏi user trong quá trình fix lỗi. Chỉ hỏi khi:
   - URL bị chặn / cần captcha
   - Business logic mâu thuẫn (không rõ expected behavior)
   - Đã hết 5 vòng auto-heal mà vẫn fail

### Bước 5: Cleanup & Delivery

⚠️ **DELIVERY GATE (BẮT BUỘC):** Output PHẢI là PASS code, KHÔNG deliver FAIL

1. **MUST PASS Before Delivery:**
   ```
   ✅ Criteria to deliver:
   ├─ Test runs on chromium (single browser, single run)
   ├─ Test PASS ✅
   ├─ Code is clean (no debug logs, no hardcode)
   └─ Ready to integrate
   
   ❌ CANNOT deliver if:
   ├─ Test FAIL (even after 5 retries) → STOP, escalate to user
   ├─ Test flaky (intermittent PASS/FAIL) → STOP, investigate
   ├─ Code has hardcoded values → STOP, fix before delivery
   └─ Output shows red/FAIL status → STOP, never deliver
   ```

2. **Code cleanup** (bắt buộc trước khi delivery):
   - [ ] Xóa `console.log()` / `print()` / debug log
   - [ ] Xóa locator không dùng
   - [ ] Xóa commented-out code
   - [ ] Không còn `waitForTimeout()` / `Thread.sleep()`
   - [ ] Import không thừa
   - [ ] **Test chạy 1 lần, PASS ✅ trước khi delivery**

3. **Cập nhật artifact `task.md`** (chỉ khi PASS):
   ```markdown
   ## Kết quả
   - ✅ Pages created: LoginPage, DashboardPage
   - ✅ Tests created: login.spec.ts
   - ✅ Test status: 1/1 PASS (chromium single run)
   - 📊 Locators collected: 8 elements, all verified
   
   ## Delivery Status
   ✅ TEST PASS — Ready to deliver
   ❌ Output is CLEAN — No debug logs, no hardcoding
   ❌ Output is VERIFIED — Ran on chromium, 1 execution
   ```

4. **Báo cáo cuối** (chỉ khi PASS):
   - ✅ Danh sách files đã tạo
   - ✅ Test PASS on chromium
   - ✅ Bảng locator collection (reference)
   - ✅ Ready for: next flow / end of slice
   - ❌ NEVER báo: FAIL status (STOP, escalate instead)

## Output

- **Artifact `task.md`** — checklist tiến độ + kết quả
- **Page Object classes** — 1 file per page/screen, locators verified từ DOM
- **Test classes** — script automation hoàn chỉnh, đã test PASS
- **Bảng Locator Collection** — tất cả elements đã thu thập + primary/fallback locators
- **Evidence screenshots** — chụp tại các milestone quan trọng