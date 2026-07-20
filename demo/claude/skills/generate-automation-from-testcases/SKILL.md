---
name: generate-automation-from-testcases
description: Convert manual test cases into automation scripts autonomously using the 6-step AI-RBT Framework and Codex tools.
---

# Workflow: Sinh Automation Scripts từ Manual Test Cases

> **BẮT BUỘC (MANDATORY SKILLS):** Bạn PHẢI nạp và đọc kỹ nội dung các skills sau trước khi bắt đầu:
> - **`$qa-automation-engineer`** (`.agents/skills/qa-automation-engineer/SKILL.md`) — Quy tắc automation chung + workflow routing
> - **`$ui-debug-agent`** (`.agents/skills/ui-debug-agent/SKILL.md`) — Inspect DOM, thu thập locators
> - **`$smart-locator-agent`** (`.agents/skills/smart-locator-agent/SKILL.md`) — Sinh locator ổn định
> - **`$test-data-generator`** (`.agents/skills/test-data-generator/SKILL.md`) — Sinh test data unique, traceable

Workflow này giúp agent đọc file manual test cases do user cung cấp, tự mở browser inspect UI, thu thập locators thực tế, sinh automation scripts hoàn chỉnh (POM + Test), chạy test và tự sửa lỗi cho đến khi PASS.

## ⚠️ Nguyên tắc thực thi

- **Vai trò:** Agent đóng vai Senior Automation Engineer — tuân thủ Clean Code + POM
- **Tất cả output bằng Tiếng Việt**
- **TUYỆT ĐỐI KHÔNG ĐOÁN locator** — phải inspect DOM thực tế bằng MCP browser tools
- **Desktop viewport 1920×1080** cho tất cả UI debugging
- ⚠️ **Rule E3 (CRITICAL):** Khi test FAIL → tự đọc log → phân tích → sửa code → chạy lại. **CẤM hỏi user trong quá trình fix lỗi.** Chỉ hỏi khi gặp business rule mâu thuẫn hoặc hết 5 vòng auto-heal
- **Status tracking** — Append results vào `docs/planning/_pipeline-status.md` (consolidate, không tạo checkpoint files)

## 🚨 PREREQUISITE GATE (BẮT BUỘC)

**TRƯỚC khi bắt đầu skill này, xác nhận:**

```
Câu hỏi 1: Runtime Discovery đã hoàn tất chưa?
├─ Có bước "Inspect real UI, collect verified locators" không?
├─ Có verify từng locator hoạt động không?
└─ ❌ NẾU KHÔNG → DỪNG, quay lại Stage 4 (Runtime Discovery)

Câu hỏi 2: Chế độ incremental được kích hoạt chưa?
├─ Parameter: --incremental được truyền vào?
├─ Mục đích: Generate 1 test case tại một lần (KHÔNG batch)?
└─ ❌ NẾU KHÔNG → DỪNG, invoke lại với --incremental flag

Câu hỏi 3: Vertical slice scope rõ ràng chưa?
├─ Có list cụ thể test cases cần automate không?
├─ Số lượng cases: 3-5 cases cho slice (KHÔNG >5)?
└─ ❌ NẾU KHÔNG → DỪNG, xác định scope rõ ràng
```

**Nếu tất cả đều YES → Proceed to Bước 1**

---

## 📋 INCREMENTAL MODE & FEATURE-SCOPED PARAMETERS

**Invoke skill with incremental mode (single feature, 1 case at a time):**
```bash
# CORRECT (Incremental - 1 feature at a time):
/generate-automation-from-testcases \
  --file=test-cases.md \
  --incremental \
  --feature=Authentication \
  --current-case=TC01

# OR (Let skill auto-recommend first feature):
/generate-automation-from-testcases \
  --file=test-cases.md \
  --incremental

# WRONG (Batch - generates all cases at once):
/generate-automation-from-testcases \
  --file=test-cases.md
  └─ This will implement all cases → DON'T USE
```

**Expected behavior:**
- `--incremental` flag → Implement only 1 test case per invocation
- `--feature=[FeatureName]` → Scope to single feature (optional, auto-recommend if missing)
- `--current-case=TC##` → Specify exact case (optional, auto-ask if missing)
- If flag missing → Agent must ASK: "Incremental mode not specified. Implement 1 case or all cases?"
- If user says "all" → REFUSE and explain why incremental is required
- If file has >15 cases and no feature specified → Auto-recommend feature + ask approval

## Workflow này khác gì `$generate-automation-from-ui-flow`?

| | `from_testcases` (workflow này) | `from_ui_flow` |
|---|---|---|
| **Input** | File manual test cases có cấu trúc (MD/Excel/JSON) | Mô tả UI steps bằng lời hoặc chỉ URL |
| **Đã có TC** | ✅ Có sẵn — đọc và convert | ❌ Chưa có — agent tự khám phá |
| **Approach** | Đọc TC → inspect UI verify → sinh code | Chạy thật trên browser → thu thập → sinh code |

## Input cần thu thập

| Input | Cách lấy | Độ ưu tiên |
|---|---|---|
| **File test cases** (MD/Excel/JSON/URL) | User cung cấp path hoặc URL | ⭐ Bắt buộc |
| **URL ứng dụng** | User cung cấp hoặc trong TC | ⭐ Bắt buộc |
| **Credentials** (nếu cần login) | User cung cấp hoặc dùng fixture sẵn | Tùy chọn |
| **Tech stack** | User chỉ định hoặc detect từ project | Tùy chọn |

Nếu user chưa cung cấp đủ → hỏi trước khi bắt đầu.

## Các bước thực hiện

### Bước 1: Khởi tạo, Phân tích & Lên Kế Hoạch (Context & Analysis)

1. **Đọc file test cases** do user cung cấp:
   - File local → `view_file`
   - URL (Google Sheets, Confluence, etc.) → `read_url_content`
   - Xác định format: Markdown table, Excel, JSON, hoặc free-form text

2. **Parse test cases** và trích xuất (behind-the-scenes):
   - Danh sách TC (ID, Title, Steps, Expected Results, Test Data, Priority)
   - Các pages/screens mà TC đi qua
   - Pre-conditions (login, setup data, navigate...)
   - Dependencies giữa các TC (nếu có)

3. **🤖 SMART REQUIREMENT GROUPING (Detect Large Scope):**
   
   **IF total TC count > 15-20:**
   ```
   Detect: Quá nhiều test cases (X test cases tìm thấy)
   
   Action: KHÔNG dump toàn bộ ra
   ├─ Parse behind-the-scenes ✅
   ├─ Group TC by feature/module (extract từ Title hoặc Steps)
   ├─ Summarize: Phát hiện [N] features: [Feature 1] (M cases), [Feature 2] (M cases)...
   └─ Ask 3-option question (KHÔNG ask "TC nào?")
   ```
   
   **Example Output:**
   ```
   🔍 Phát hiện 50 test cases ÷ 5 features:
   
   ✅ Feature: Authentication (12 cases) — P1/P2, core flow
   ✅ Feature: User Profile (8 cases) — P1/P2, CRUD operations
   ✅ Feature: Notifications (6 cases) — P2, messaging
   ✅ Feature: Reporting (15 cases) — P2/P3, analytics
   ✅ Feature: Admin Panel (9 cases) — P2/P3, configuration
   
   ---
   
   🤖 RECOMMENDATION: Bắt đầu với Authentication (core, high-risk, 12 cases)
   
   **Bạn muốn implement feature nào trước?**
   - ✅ **YES** → Dùng Authentication, implement 12 cases incrementally
   - ⚠️ **CUSTOM** → Chọn feature khác
   - ❓ **INFO** → Muốn biết thêm chi tiết feature nào?
   ```
   
   **ELSE (total TC ≤ 15-20):**
   ```
   → Đủ nhỏ để fit incremental
   → Proceed to step 4 (choose single TC)
   ```

4. **⚠️ INCREMENTAL MODE - Chọn test case cụ thể:**
   
   Sau khi feature được lựa chọn, implement 1 TC tại một lần:
   ```
   Hỏi user: "Test case nào trước (từ feature [Feature Name])?"
   ├─ Nếu có --current-case=TCXX parameter → Dùng cái đó
   ├─ Nếu không có → Hiển thị danh sách TC trong feature đó, user chọn 1
   └─ Chỉ implement TC này, KHÔNG implement TCs khác
   ```
   
   Ví dụ:
   ```
   Feature: Authentication (12 cases total)
   
   Test Cases in this feature:
   - TC01: Login with valid credentials (P1)
   - TC02: Login with invalid password (P1)
   - TC03: Login with empty fields (P1)
   ... (9 more)
   
   Question: Implement which case first?
   Answer: TC01 ← Focus on this ONE case only
   ```

5. **Tech stack:** Playwright + TypeScript

6. **Update consolidated status file** (NO checkpoint artifacts):
   - Append to: `docs/planning/_pipeline-status.md`
   - Keep single history (append-only)
   - Example entry:
   ```markdown
   ### Stage 5: Implementation (TC01) — ✅ PASS
   - Date: 2026-07-20 12:00 PM
   - Feature: Authentication (12 cases total)
   - Test: TC01 - Login with valid credentials
   - Result: ✅ PASS (1/1 run, chromium)
   - Files: src/pages/login.page.ts, src/tests/login.spec.ts
   - Next: TC02 (implement next in same feature)
   ```

### Bước 2: Khảo sát UI tự động bằng MCP (Autonomous UI Recon)

1. **Mở browser** bằng MCP và navigate theo test case steps:
   ```
   browser_navigate → URL ứng dụng
   browser_resize → 1920 × 1080
   browser_wait_for → page load hoàn tất
   browser_snapshot → thu thập DOM
   ```

2. **Với mỗi page trong test cases**, thực hiện:
   - `browser_snapshot` → đọc accessibility tree
   - Xác định tất cả elements cần tương tác (inputs, buttons, links, dropdowns...)
   - Thu thập locator tốt nhất cho mỗi element (theo priority trong skill `$smart-locator-agent`)
   - Verify locator bằng cách thử tương tác (`browser_click`, `browser_type`)

3. **Ghi nhận vào bảng Locator Collection:**

   | Page | Element | Action | Primary Locator | Fallback Locator | Verified |
   |---|---|---|---|---|---|
   | LoginPage | Email input | Type | `getByLabel('Email')` | `#email` | ✅ |
   | LoginPage | Password input | Type | `getByLabel('Password')` | `#password` | ✅ |
   | LoginPage | Login button | Click | `getByRole('button', {name: 'Login'})` | `button[type=submit]` | ✅ |
   | DashboardPage | Welcome text | Assert | `getByRole('heading', {name: /Welcome/})` | `.welcome-header` | ✅ |

4. **Xử lý tình huống:**

   | Tình huống | Cách xử lý |
   |---|---|
   | URL bị chặn / cần VPN | Thông báo user |
   | Cần đăng nhập | Dùng fixture sẵn có hoặc hỏi user credentials |
   | Element không tìm thấy | Snapshot lại → thử locator khác → báo user nếu DOM thay đổi |
   | CAPTCHA / 2FA | Thông báo user — không thể automate |
   | Dynamic content / SPA | `browser_wait_for` text cụ thể trước khi snapshot |

5. **TUYỆT ĐỐI KHÔNG SUY ĐOÁN selector** — mọi locator phải verified trên DOM thực tế.

### Bước 3: Thiết kế POM (Page Object Model Architecture)

1. **Xác định danh sách Page classes** cần tạo:
   - Mỗi page/screen trong test flow → 1 Page class
   - Xem xét tạo `BasePage` nếu chưa có trong project

2. **Sinh Page Object classes** bằng `write_to_file`:

   **Cấu trúc mỗi Page class:**
   ```
   - Locators (khai báo ở đầu class — từ Bước 2)
   - Constructor (nhận page/driver instance)
   - Action methods (mô tả hành vi user, không mô tả DOM)
   - Verification methods (kiểm tra state/text sau action)
   ```

   **Nguyên tắc:**
   - Method name mô tả hành vi: `login()`, `fillRegistrationForm()`, không phải `clickButton()`
   - Không hardcode waits — chỉ smart waits
   - Locator lấy từ Bước 2 (đã verify) — KHÔNG ĐOÁN
   - Return `this` hoặc next page object cho method chaining (nếu phù hợp)

3. **Kiểm tra project structure hiện tại:**
   - Nếu project đã có pages/ → sinh file vào đúng thư mục
   - Nếu project mới → tạo structure theo skill `$framework-architect`
   - Không tạo duplicate — kiểm tra page đã tồn tại chưa trước khi tạo mới

### Bước 4: Chuẩn bị Dữ liệu (Test Data Strategy)

1. **Phân tích test data** từ test cases:
   - Data nào cần **unique per run** (email, username, ID) → sinh random + traceable
   - Data nào **cố định** (URL, config values) → đọc từ env/config
   - Data nào cần **nhiều bộ** (data-driven) → tạo file external (JSON/YAML)

2. **Sinh test data utilities** (dùng skill `$test-data-generator`):
   ```
   Format: <prefix>_<testName>_<timestamp>
   Ví dụ:
   - Email:    auto_login_1712049200@test.com
   - Username: auto_user_1712049200
   - Code:     TC_REG_1712049200
   ```

3. **Sensitive data** (credentials):
   - Đọc từ env variables hoặc config file
   - **KHÔNG hardcode** trong test code
   - **KHÔNG đọc .env trực tiếp** (quy tắc bảo mật)

### Bước 5: Sinh Automation Scripts (Test Classes)

1. **Tạo test file cho 1 test case (INCREMENTAL MODE):**
   
   ⚠️ **CRITICAL:** Generate code cho CHỈ 1 test case được chọn ở Bước 1, KHÔNG generate tất cả TCs
   
   ```
   Example:
   Input: 3 test cases (TC01, TC02, TC03)
   Current: TC01
   
   Output: 1 test file (login.spec.ts)
   ├─ Chỉ có 1 test function cho TC01
   ├─ Không có TC02, TC03
   └─ Sau khi TC01 PASS, invoke skill lại với --current-case=TC02
   ```

   **Cấu trúc mỗi test:**
   ```
   Setup (Arrange):
   - Khởi tạo page objects
   - Chuẩn bị test data
   - Navigate đến trang cần test
   - Login (nếu cần, qua fixture)

   Execution (Act):
   - Thực hiện các bước theo test case
   - Gọi methods từ Page Objects

   Verification (Assert):
   - Assert kết quả với expected results từ TC
   - Assertion message rõ ràng, dễ debug khi fail
   ```

2. **Assertions bắt buộc:**
   - Mỗi TC PHẢI có ít nhất 1 assertion
   - Assert message mô tả rõ: `"Expected dashboard to show after login"`
   - Dùng soft assertions khi cần check nhiều điểm
   - Timeout phù hợp (không để default quá ngắn)

3. **Nguyên tắc code:**
   - Không `waitForTimeout()` / `Thread.sleep()` — chỉ smart waits
   - Không inline locator trong test — locator trong Page class
   - Import gọn gàng — không unused imports
   - Test independent — không phụ thuộc thứ tự chạy
   - Cleanup/teardown nếu test tạo data

### Bước 6: Chạy Thử Nghiệm & Tự Sửa Lỗi (Execution & Auto-Heal — RULE E3)

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
   const platform = process.platform; // 'darwin' = Mac, 'win32' = Windows, 'linux' = Linux
   
   let executionCommand = '';
   
   if (platform === 'darwin') {
     // Mac - Prefer MCP if available, fallback to CLI
     console.log('🍎 Detected macOS - Attempting Playwright MCP...');
     
     if (hasPlaywrightMCP()) {
       // MCP available - use for visual inspection
       executionCommand = `
         browser_navigate("${appUrl}")
         browser_resize(1920, 1080)
         browser_snapshot()
         // Then run via CLI below
       `;
     } else {
       console.log('⚠️  Playwright MCP not available, falling back to CLI');
     }
   } else if (platform === 'win32') {
     console.log('🪟 Detected Windows - Using Playwright CLI');
   } else {
     console.log('🐧 Detected Linux - Using Playwright CLI');
   }
   
   // Always use CLI as fallback/primary
   executionCommand += 'npx playwright test <test_file> --headed --project=chromium --trace=on';
   
   console.log(`ℹ️  Executing: ${executionCommand}`);
   await run_command(executionCommand);
   ```

   **What Happens Automatically:**
   ```
   Mac:
   ├─ Tries Playwright MCP first
   ├─ If available → Visual inspection + browser
   └─ If not → Falls back to CLI headed mode
   
   Windows / Linux:
   └─ Uses CLI headed mode directly
   
   Result: Browser visible on ALL platforms ✅
   ```

   ⚠️ **GUARANTEED (Auto-enforced):**
   - ✅ Single browser: `--project=chromium` (auto-added)
   - ✅ Single run: NO `--repeat-each` (auto-prevented)
   - ✅ Headed mode: `--headed` (auto-added)
   - ✅ OS-adaptive: MCP on Mac, CLI everywhere
   - ✅ Trace: `--trace=on` (auto-added)
   - ✅ Browser visible: Always (auto-enforced)
   - ❌ NEVER multi-browser (auto-prevented)
   - ❌ NEVER headless (auto-prevented)

2. **Theo dõi kết quả** qua `command_status`:

   **Nếu PASS:**
   - ✅ Test PASS on first run → SUCCESS
   - Cập nhật `task.md`: TC status → ✅ PASS (1/1 run)
   - Cleanup debug logs, commented code
   - ⚠️ DO NOT re-run to "verify stability" (1 run is enough for incremental approach)

   **Nếu FAIL → Vào vòng lặp Auto-Heal (Exploit available skills):**

   ```
   WHILE test FAIL (tối đa 5 vòng):
     1. Đọc error log / stack trace → xác định step fail
     
     2. Phân loại lỗi & USE AVAILABLE SKILLS:

        | Lỗi | Hành động | Skill |
        |---|---|---|
        | Element not found | Mở MCP → snapshot → verify locator | ui-debug-agent |
        | Locator unstable | Re-inspect DOM, generate new locator | smart-locator-agent |
        | Click intercepted | Chờ overlay, verify clickability | ui-debug-agent |
        | Timeout | Tăng timeout hoặc thêm wait condition | (code fix) |
        | Assertion fail | Kiểm tra expected vs actual | ui-debug-agent |
        | Navigation error | Kiểm tra URL, redirect, page load | ui-debug-agent |
        | Test data conflict | Sinh data unique mới | data-generator |
        | Import/compile error | Sửa import, check class name | (code fix) |

     3. **USE SKILLS (don't assume flaky):**
        ├─ Element not found → Invoke: ui-debug-agent
        │  └─ Re-inspect actual DOM, find real element
        │
        ├─ Locator broken → Invoke: smart-locator-agent
        │  └─ Generate new stable locator from actual DOM
        │
        ├─ Locator fixed, test still fail → Invoke: locator-healer-agent
        │  └─ Auto-fix locators in test code
        │
        └─ Root cause unclear → Invoke: ui-debug-agent
           └─ Get visual evidence, understand failure
     
     4. Sửa code dựa trên skill output
     5. Chạy lại test (chromium only, single run)
     6. Ghi log vào task.md: "Vòng 2: [Skill] Fixed XYZ → PASS"
   
   ❌ NEVER → Assume flaky / Route to flaky-test-analyzer (wrong stage!)
   ✅ ALWAYS → Exploit skills to find root cause
   ```

3. **⚠️ IMPORTANT: Khi Nào Dùng flaky-test-analyzer:**
   ```
   ❌ WRONG:
   - Test fail trong Bước 6 (implementation)
   - → Route to flaky-test-analyzer
   - This is too early! Use locator/ui skills instead
   
   ✅ CORRECT:
   - Implementation pass hết (all test cases PASS)
   - Full regression test (all cases together)
   - THEN → Fail → Route to flaky-test-analyzer
   - This is final stage, after all implementation verified
   ```

3. **⚠️ Rule E3 — CẤM HỎI USER khi fix lỗi.** Chỉ được hỏi khi:
   - Business logic mâu thuẫn (TC nói A nhưng app hiển thị B)
   - Server/app không accessible
   - Đã hết 5 vòng auto-heal mà vẫn fail

4. **✅ PASS Criteria (Incremental Mode):**
   - Test chạy 1 lần trên chromium
   - Test PASS
   - Done! → Move to next test case
   - ❌ NO: "Verify stability" by running again
   - ❌ NO: Multi-browser verification for incremental approach

5. **INCREMENTAL GATE - Proceed to Next Test Case:**
   
   ✅ **Nếu ALL test cases trong current feature PASS (2 lần liên tiếp):**
   ```
   Status: ✅ PASS (stable)
   Next action: Update _pipeline-status.md, báo cáo kết quả
   
   Message cho user:
   "TC01 completed and stable (2/2 runs passed).
   Ready to implement next test case?"
   
   Options:
   ├─ Next TC in same feature → Invoke với --current-case=TC02
   ├─ Completed all TCs in feature → Ask: "Move to next feature?"
   │  └─ If YES → Show remaining features, user picks next
   │  └─ If NO → Mark feature done, wait for user input
   └─ Full slice regression → Run all cases in feature together
   ```
   
   **Example (Feature Complete):**
   ```
   ✅ Authentication feature: 12/12 cases PASS ✅
   
   Remaining features:
   ├─ User Profile (8 cases)
   ├─ Notifications (6 cases)
   ├─ Reporting (15 cases)
   └─ Admin Panel (9 cases)
   
   Ready to start next feature?
   - ✅ **YES** → Which feature next?
   - ⚠️ **PAUSE** → Mark Authentication done, wait
   - ❓ **SUMMARY** → Show progress
   
   Next invocation (if user picks "User Profile"):
   /generate-automation-from-testcases \
     --file=test-cases.md \
     --incremental \
     --feature=User\ Profile \
     --current-case=TC13
   ```
   
   ❌ **Nếu test FAIL (sau 5 vòng auto-heal):**
   ```
   Status: ❌ FAIL (blocked)
   Next action: STOP, báo cáo blocker
   
   Message cho user:
   "TC01 failed after 5 retry attempts. Root cause: [error]
   Actions:
   - Check if runtime discovery is accurate
   - Verify locators on real browser
   - Option 1: Fix app issue
   - Option 2: Mark as blocked, skip to next case
   └─ Decision needed from user"
   
   Do NOT proceed to next case automatically
   ```

### Bước 7: Cleanup & Delivery

⚠️ **DELIVERY GATE (BẮT BUỘC):** Output PHẢI là PASS code, KHÔNG deliver FAIL

1. **MUST PASS Before Delivery:**
   ```
   ✅ Criteria to deliver:
   ├─ Test runs on chromium (single browser, single run)
   ├─ Test PASS ✅
   ├─ Code is clean (no debug logs, no hardcode)
   └─ Ready for next test case
   
   ❌ CANNOT deliver if:
   ├─ Test FAIL (even after 5 retries) → STOP, escalate to user
   ├─ Test flaky (intermittent PASS/FAIL) → STOP, investigate
   ├─ Code has hardcoded values → STOP, fix before delivery
   └─ Output shows red/FAIL status → STOP, never deliver
   ```

2. **Code cleanup** (bắt buộc trước khi delivery):
   - [ ] Xóa `console.log()` / `print()` / debug log tạm
   - [ ] Xóa locator không còn sử dụng
   - [ ] Xóa commented-out code
   - [ ] Không còn `waitForTimeout()` / `Thread.sleep()`
   - [ ] Không còn hardcoded test data (email, password)
   - [ ] Import gọn gàng — không unused imports
   - [ ] **Test chạy 1 lần, PASS ✅ trước khi delivery**

3. **Update consolidated status file** (chỉ khi PASS):
   - Append to: `docs/planning/_pipeline-status.md`
   - NO `task.md` artifact (single status file only)
   - Example:
   ```markdown
   ### Stage 5: Implementation (TC01-TC12) — ✅ ALL PASS
   - Date: 2026-07-20 02:00 PM
   - Feature: Authentication (12 cases completed)
   - Result: ✅ ALL PASS (1/1 run each, chromium)
   - Files: src/pages/login.page.ts, src/pages/dashboard.page.ts, src/tests/authentication.spec.ts
   - Delivery Status: ✅ CLEAN, verified, ready
   - Next: Feature regression test
   ```

4. **Báo cáo cuối** (chỉ khi ALL PASS):
   - ✅ Tổng: X TC PASS (KHÔNG báo FAIL)
   - ✅ Danh sách files đã tạo
   - ✅ Ready for: Next test case / End of slice
   - ❌ NEVER báo: Y TC FAIL (STOP, escalate instead)
   - ❌ NEVER báo: Z TC SKIP (STOP, mark as blocker)

## Output

**Primary Deliverables:**
- ✅ **Page Object classes** — 1 file per page, locators verified từ DOM
- ✅ **Test classes** — automation scripts hoàn chỉnh, đã PASS stable
- ✅ **Test data utilities** — generators cho data unique + traceable
- ✅ **Locator Collection** — (shared with runtime discovery)

**Status Tracking (No Checkpoint Clutter):**
- ❌ **DO NOT create:** `task.md`, stage-specific checkpoint files
- ✅ **DO append to:** `docs/planning/_pipeline-status.md`
  ```markdown
  ### Stage 5: Implementation (TC01) — ✅ PASS
  - Date: 2026-07-20 12:00 PM
  - Feature: Authentication
  - Test: TC01 - Login with valid credentials
  - Result: PASS (1/1 run, chromium)
  - Files: src/pages/login.page.ts, src/tests/login.spec.ts
  - Next: TC02 in Authentication feature
  ```

**Result Reporting:**
- ✅ Text summary to user (PASS/FAIL per case)
- ✅ Updated status file (automated append)
- ❌ NO scattered checkpoint files
