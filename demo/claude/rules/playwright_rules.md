# Quy Tắc Dành Riêng Cho Playwright

> Áp dụng khi thiết lập và chạy automation với Playwright (TypeScript hoặc Java).

## 1. Thiết Lập Browser (BẮT BUỘC)

- **Viewport debug:** Mọi quá trình debug UI bắt buộc chạy với viewport desktop: **`1920x1080`**.
- **Playwright MCP — Resize bắt buộc:** Khi sử dụng Playwright MCP để debug UI, **LUÔN LUÔN** gọi `browser_resize(width=1920, height=1080)` **ngay sau khi mở browser** (sau lệnh `browser_navigate` đầu tiên). Đây là bước bắt buộc, không được bỏ qua.
  ```
  Thứ tự bắt buộc:
  1. browser_navigate(url) → mở trang
  2. browser_resize(width=1920, height=1080) → set viewport
  3. browser_snapshot() hoặc browser_take_screenshot() → bắt đầu inspect
  ```
- **Headed mode:** Bắt buộc mở browser có hiển thị (headed) trong quá trình thiết lập và debug test.
- **Headless mode:** Chỉ được phép sử dụng khi:
  - Test đã debug PASS 100% trên headed mode
  - Hoặc trong CI/CD pipeline mặc định

## 1.5 Single Browser Single Run (Cross-Platform: Mac + Windows)

**Mac (Preferred - Has Playwright MCP):**
```bash
# ✅ BEST: Use Playwright MCP for live inspection
# MCP provides interactive browser + DOM inspection tools
browser_navigate("http://app:3000/login")
browser_resize(1920, 1080)
browser_snapshot()  # See actual DOM in real-time
# Then run test via CLI

# ✅ Also OK: Headed CLI on Mac
npx playwright test <test_file> --headed --project=chromium --trace=on
# --headed: See browser live
# --trace=on: Record execution for later inspection
```

**Windows (CLI-only - No Playwright MCP):**
```bash
# ✅ CORRECT: Single browser, single run, headed mode
npx playwright test <test_file> --headed --project=chromium --trace=on

# ✅ Alternative: With trace for post-execution inspection
npx playwright test <test_file> --headed --project=chromium --trace=on
# Then inspect trace in Playwright Inspector
```

**Cross-Platform Mandatory:**
```bash
# ✅ CORRECT on ANY platform
npx playwright test <test_file> --headed --project=chromium

# ❌ WRONG: Multiple browsers (3x execution)
npx playwright test <test_file> --headed
# Runs chromium, firefox, webkit = 3 × execution time

# ❌ WRONG: Repeat for stability (2x execution)
npx playwright test <test_file> --repeat-each=2
# Runs each test twice = 2 × execution time

# ❌ WRONG: Combined (6x execution!)
npx playwright test <test_file> --repeat-each=2
# Runs 3 browsers × 2 repeats = 6 × execution time

# ❌ ABSOLUTE WRONG: Headless during development
npx playwright test <test_file> --project=chromium
# Cannot see what's breaking! Always use --headed
```

**Why single browser, single run:**
- Incremental approach: run once, immediately
- PASS ✅ → Move to next case (no re-run needed)
- FAIL ❌ → Debug and fix, re-run same case
- Focus: Fast feedback, not multi-browser validation
- Headed mode: Always see browser (debug visually)

**playwright.config.ts for incremental:**
```typescript
export default defineConfig({
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // ⚠️ Remove or comment out for incremental:
    // { name: 'firefox', ... }
    // { name: 'webkit', ... }
  ],
});
```

**Development Machine Differences:**
```
Mac:
├─ Can use Playwright MCP (visual + interactive)
├─ Can use CLI with --headed
└─ Recommended: MCP for real-time inspection

Windows:
├─ CLI only (no MCP)
├─ Must use --headed (to see browser)
└─ Use --trace=on for post-run inspection
```

## 2. Workflow Phát Triển & Tìm Element

- Ưu tiên sử dụng **Playwright MCP** để mở browser và tương tác với trang đích.
- **Inspect DOM thực tế:** Verify và capture selector trực tiếp từ browser DOM.
- **TUYỆT ĐỐI KHÔNG:**
  - Suy đoán locator
  - Copy locator mù quáng từ code cũ mà không verify
  - Dựa trên URL / tài liệu mà không xác nhận sự tồn tại trên UI thật

## 3. Thứ Tự Ưu Tiên Locator Playwright

Playwright cung cấp bộ locator semantic hướng người dùng. Ưu tiên sử dụng thay vì CSS/XPath:

1. `getByRole()` — Tốt nhất cho semantic elements (button, link, heading...)
2. `getByLabel()` — Tốt nhất cho form fields có label
3. `getByPlaceholder()` — Tốt nhất cho inputs có placeholder text
4. `getByText()` — Tốt nhất cho text content
5. `getByTestId()` — Tốt nhất khi element có `data-testid`
6. `locator("css")` — Fallback khi không có lựa chọn tốt hơn

Ví dụ:
```typescript
// Đúng — Semantic locator
page.getByRole('button', { name: 'Đăng nhập' })
page.getByLabel('Email')
page.getByPlaceholder('Nhập mật khẩu')

// Sai — XPath/CSS thô khi có semantic thay thế
page.locator('//button[@class="btn-login"]')
page.locator('.form-input:nth-child(2)')
```

## 4. Chiến Lược Chờ Đợi (Wait Strategy)

**NGHIÊM CẤM:**
- `page.waitForTimeout()` — hard sleep
- `await new Promise(r => setTimeout(r, N))` — tự tạo delay
- Bất kỳ cách nào cố định thời gian chờ

**SỬ DỤNG:**
- Tận dụng auto-waiting mặc định của Playwright
- Web-First Assertions:
  ```typescript
  await expect(locator).toBeVisible();
  await expect(locator).toBeEnabled();
  await expect(locator).toHaveText('Thành công');
  await expect(page).toHaveURL(/dashboard/);
  ```
- Chỉ dùng `waitForSelector()` khi `expect()` không đáp ứng được yêu cầu đặc biệt

## 5. Cấu Trúc Test

```typescript
test.describe('Tên Module', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: navigate, login...
  });

  test('mô tả hành vi cần test', async ({ page }) => {
    // Arrange: khởi tạo page objects, data
    // Act: thực hiện hành động
    // Assert: kiểm tra kết quả
  });
});
```

- Mỗi test block phải có **assertion rõ ràng**
- Sử dụng `test.describe` để nhóm test theo module
- Sử dụng `beforeEach` / `afterEach` để setup / teardown
