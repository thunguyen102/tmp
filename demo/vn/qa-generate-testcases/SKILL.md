---
name: qa-generate-testcases
description: Sinh test cases nhanh từ requirements để dùng trực tiếp cho Playwright automation.
---

# Workflow: Sinh Manual Test Cases Nhanh từ Requirements

Workflow này đọc requirements hoặc test plan đã có, phân tích các trường hợp cần test, rồi xuất test cases đủ chi tiết để bước automation chuyển thành Playwright script.

## Nguyên Tắc

- Mode mặc định: QUICK, một lượt, không checkpoint dài.
- Tất cả output bằng Tiếng Việt.
- Mục tiêu là sinh test case rõ ràng, cụ thể, có thể code automation ngay ở bước kế tiếp.
- Không tự chuyển sang FULL RBT. Nếu scope quá mơ hồ hoặc quá lớn, ghi câu hỏi/giả định cần làm rõ.

## Các Bước Thực Hiện

1. Đọc và hiểu requirements/test plan được cung cấp — nếu đã có `qa-automation/<feature-slug>/test-plan.md` (từ `qa-generate-test-plan`) hoặc `requirements-analysis.md` (từ `qa-gather-test-requirements`), dùng trực tiếp các file đó làm input thay vì hỏi lại từ đầu.
2. Xác định các luồng chính: Happy Path, Negative Path, Boundary Cases, Edge Cases.
3. Áp dụng kỹ thuật thiết kế test case phù hợp:
   - Equivalence Partitioning (EP)
   - Boundary Value Analysis (BVA)
   - Decision Table nếu có nhiều rule
   - State Transition nếu có workflow/trạng thái
4. Với form/UI có input fields, sinh validation test case riêng cho từng trường theo checklist tại [`references/field_validation_checklist.md`](./references/field_validation_checklist.md) — không gộp nhiều field vào 1 TC, không dùng chung 1 bộ validation cho mọi loại field.
5. Sinh test cases đầy đủ thông tin:
- TC ID
- Module
- Test Scenario / Test Case Title
- Pre-conditions
- Test Steps
- Test Data cụ thể
- Expected Results
- Priority
6. Xuất ra bảng Markdown chuẩn.

## Bảng Output

```text
| TC ID | Module | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority |
```

## Quy Tắc Quan Trọng

- Test Data phải cụ thể, ví dụ `test_login_01@domain.com`, không ghi chung chung như "email hợp lệ".
- Phải bao gồm Positive, Negative, Boundary, và Edge cases phù hợp với scope.
- Không gộp nhiều field validation độc lập vào một TC nếu điều đó làm expected result mơ hồ.
- TC ID theo format user quy ước hoặc mặc định `[DỰ_ÁN]_[MODULE]_TC_[SỐ]`.
- Test Steps và Expected Result phải đủ rõ để bước automation sau này (ngoài phạm vi skill hiện tại) chuyển thẳng thành code mà không cần chọn lại scope.
- Nếu một case không thể automation do thiếu requirement/test data/môi trường, ghi rõ lý do trong phần `Assumptions / Open Questions`; không tự skip âm thầm.
- Nếu quá nhiều TCS, chia thành Part 1, Part 2 và bảo rõ phạm vi từng phần.

### ⚠️ Phân biệt bắt buộc: Input Data (được sinh mới) vs Entity Có Sẵn (Pre-condition)

Đây là nguyên nhân gây fail hàng loạt khi automation: nhầm lẫn giữa "dữ liệu tự sinh cho hành động test" và "thực thể được giả định đã tồn tại sẵn trên hệ thống".

- **Input data** (giá trị nhập vào form khi thực hiện hành động — email, password, tên field...) → được phép sinh cụ thể/động (timestamp, unique), vì test tự tạo ra nó trong lúc chạy.
- **Pre-condition entity** (một bản ghi được giả định **đã tồn tại sẵn** trên hệ thống trước khi test chạy — ví dụ "Order #ORD-001 ở trạng thái Shipped", "User X đã được gán Role Y") → **KHÔNG được đặt tên cụ thể như thể nó có thật** nếu chưa verify entity đó tồn tại trên môi trường target. Đây chỉ là **placeholder chờ automation tự tạo**, không phải dữ liệu đã xác nhận.
- Với mọi TC cần một entity ở trạng thái không phải trạng thái khởi tạo mặc định (ví dụ: đã qua 1 bước xử lý/chuyển trạng thái trung gian), **Pre-Condition phải ghi rõ đây là bước setup cần tự tạo trong automation** (ví dụ: "Setup: tạo entity mới qua UI, đưa về đúng trạng thái cần test bằng các action UI thật — không dùng lại tên có sẵn trên demo/shared env"), trừ khi user xác nhận entity đó chắc chắn có sẵn (ví dụ do đã tự tạo ở TC trước trong cùng chuỗi, hoặc đã verify trực tiếp trên UI thật).
- Không tự đặt tên riêng cụ thể (người, công ty, mã nhân viên...) cho entity giả định có sẵn — dùng ký hiệu rõ ràng là placeholder, ví dụ `<entity-tạo-ở-setup>`, thay vì tên riêng khiến automation hiểu nhầm là dữ liệu thật đã tồn tại.

## Sau khi xong

Đây là bước cuối trong chuỗi hiện tại (`qa-gather-test-requirements` → `qa-generate-test-plan` → `qa-generate-testcases`). Ghi `test-cases.md`, báo tóm tắt số TC/priority, và bàn giao cho team — bước automation script sẽ là skill riêng ở phase sau.