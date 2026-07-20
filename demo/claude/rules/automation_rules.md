# Quy Tắc Chung cho QA Automation (Playwright + TypeScript)

> Áp dụng cho mọi tác vụ automation testing với Playwright TypeScript (web automation).

## 1. Kiến Trúc & Framework

- Bắt buộc sử dụng mô hình **Page Object Model (POM)**.
- Phân tách rõ ràng:
  - **Page classes:** Khai báo locators + methods tương tác UI
  - **Test classes:** Chứa logic kiểm thử + assertions
  - **Test data:** Tách riêng khỏi code chức năng (JSON, DataProvider, Utils)
- Assertions chỉ đặt trong Test classes, KHÔNG đặt trong Page classes.

## 1.5 Incremental Test Implementation (BẮT BUỘC)

**Implement automation phải tuần tự, 1 test case tại một lần. KHÔNG batch implementation.**

### Nguyên tắc Incremental:

| Quy tắc | Chi tiết | Hậu quả nếu vi phạm |
|---|---|---|
| **1 case/invocation** | Generate code cho 1 TC tại một lần | Batch generation → 70% fail rate |
| **Run immediately** | Chạy test ngay sau code gen | Delay → Không catch lỗi sớm |
| **PASS gates next** | TC phải PASS (stable 2/2) mới proceed | FAIL skipped → Scope gap, chất lượng xấu |
| **Max 5 retry** | Nếu fail sau 5 lần → escalate | Retry vô hạn → vô vọng loop |
| **Root cause, not flaky** | Debug real issue, KHÔNG assume flaky | Misclassification → flaky-fix loop vô tận |

### Workflow Incremental:
```
TC01 → Generate code
         ↓
       Run (headed mode)
         ├─ PASS (2/2 stable) ✅
         │  └─ Mark PASS, proceed
         │
         └─ FAIL ❌
            ├─ Reopen browser → inspect DOM
            ├─ Verify expected locators exist
            ├─ Regenerate locators if needed
            ├─ Fix code (root cause)
            ├─ Re-run (max 5 times)
            └─ If still FAIL → Escalate to user

TC02 → (Only if TC01 PASS) → Repeat
TC03 → (Only if TC02 PASS) → Repeat
...
```

### Implementation Guidance:

**Before code generation:**
- ✅ Runtime discovery completed (DOM inspected, locators verified)
- ✅ Test case scope defined (3-5 cases per slice max)
- ✅ Single test case selected (not all at once)

**During code generation:**
- ✅ Generate for 1 case only
- ✅ No batch file generation
- ✅ Structure: POM + 1 test function

**After first run:**
- ✅ PASS → Verify stability (2 runs) → Proceed to next case
- ✅ FAIL → Immediate root cause analysis (not "flaky")
  - Reopen browser, check DOM against expectations
  - Fix locators/logic based on actual findings
  - Re-run until PASS (max 5 attempts)
- ❌ FAIL after 5 retries → STOP, escalate (don't continue)

## 2. Sinh Dữ Liệu Test (Test Data)

- Tất cả trường yêu cầu unique (Email, Username, Mã KH...) **phải sinh động**, không hardcode.
- Sử dụng UUID, Timestamp hoặc thư viện Faker.
- Dữ liệu phải **traceable** — nhìn vào DB biết ngay test nào tạo ra:
  ```
  Format: [prefix]_[testName]_[timestamp]_[random]
  Ví dụ:  auto_createCustomer_20260402_A3F2@test.com
  ```
- Hỗ trợ chạy parallel: mỗi test method có data riêng biệt, không conflict.

## 3. Chất Lượng Code

- Không logic trùng lặp — tạo helper methods cho các hành động lặp đi lặp lại.
- Code phải đơn giản, dễ đọc, dễ bảo trì.
- Trước khi deliver code:
  - Xóa toàn bộ `console.log`, `print()` sinh ra khi debug
  - Xóa code bị comment (`//`, `/* */`)
  - Xóa locator / biến không sử dụng (unused code)

## 4. Quản Lý File & Thư Mục

- KHÔNG tự động xóa file source khi chưa xác nhận với user.
- Kiểm tra cấu trúc thư mục hiện có trước khi tạo file mới — tránh duplicate.
- Đặt file đúng thư mục theo kiến trúc project (xem `plan/automation/0_project_architecture`).

## 5. Quy Tắc Đặt Tên (TypeScript)

| Thành phần | Quy tắc | Ví dụ |
|---|---|---|
| Page class | PascalCase + hậu tố `Page` | `LoginPage.ts`, `CartPage.ts` |
| Test file | kebab-case + `.spec.ts` | `login.spec.ts`, `cart.spec.ts` |
| Test block | `test('mô tả hành vi')` | `test('đăng nhập thành công')` |
| Locator biến | lowerCamelCase + readonly | `readonly loginButton` |
| Utils | PascalCase hoặc kebab-case | `DataGenerator.ts`, `data-generator.ts` |

## 6. Assertions (Kiểm Tra Kết Quả)

- Mỗi test case **BẮT BUỘC** có ít nhất 1 assertion ở cuối.
- Nên có assertion xen kẽ ở các bước quan trọng.
- Assert phải mô tả rõ expected behavior:
  ```typescript
  // Playwright
  await expect(page.getByText('Đăng nhập thành công')).toBeVisible();
  ```

## 7. Tính Độc Lập Của Test (Test Independence)

- Mỗi test case phải **độc lập** — không phụ thuộc kết quả test khác.
- Setup/teardown rõ ràng (`beforeEach/afterEach`).
- Không chia sẻ state giữa các test cases.

## 8. Documentation & Cleanup (Tài Liệu & Dọn Dẹp)

### Documentation Management
- **Keep only essential docs**: Test plan, locators, implementation guide, final status
- **Remove intermediate checkpoints**: Stage completions, intermediate reports → consolidate vào final status
- **Create README.md**: Navigation & index cho docs folder
- **Auto-cleanup**: Chạy `npm run cleanup:docs` trước khi deliver

### Cleanup Workflow
```
Implementation → Test PASS → Document → Cleanup → Deliver
                                           ↓
                              npm run cleanup:docs
                              (removes: STAGE*-COMPLETE.md, POC-STATUS.md, *-TEMP.md)
```

### Files to Remove (Mẫu)
- ❌ `STAGE4-COMPLETE.md` (intermediate checkpoint)
- ❌ `STAGES-4-6-COMPLETE.md` (intermediate checkpoint)
- ❌ `POC-STATUS.md` (superseded by POC-FINAL-STATUS.md)
- ❌ `implementation-summary.md` (consolidate vào IMPLEMENTATION-READY.md)

### Files to Keep (Mẫu)
- ✅ `README.md` (index & navigation)
- ✅ `POC-FINAL-STATUS.md` (main status report)
- ✅ `recruitment-test-plan.md` (test scenarios)
- ✅ `stage4-locators.md` (locators reference)
- ✅ `IMPLEMENTATION-READY.md` (templates & guide)

### npm Scripts for Cleanup
```bash
npm run cleanup:docs    # Remove intermediate files
npm run pre-delivery    # Run tests + cleanup (before final delivery)
```