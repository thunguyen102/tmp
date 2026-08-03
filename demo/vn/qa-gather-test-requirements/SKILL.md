---
name: qa-gather-test-requirements
description: Phân tích requirement (Jira ticket/.doc/user story) hoặc khảo sát trực tiếp một website/module để sinh tài liệu Yêu cầu (Requirements/Analysis) chuẩn cho QA automation. KHÔNG sinh test case ở skill này.
---

# QA Gather Test Requirements

## Khi nào dùng

- User cung cấp Jira ticket, file `.doc`/`.md`, user story và yêu cầu "phân tích yêu cầu"
- User đưa URL/module web và muốn có tài liệu Requirements từ UI thực tế (chưa có doc)
- User muốn hiểu rõ scope, acceptance criteria, dependencies **trước khi** viết test plan/test case
- User cần danh sách điểm mơ hồ (ambiguities) để clarify với PO/BA

**KHÔNG sinh test case ở đây.** Sau khi có tài liệu này, dùng `qa-generate-test-plan` rồi `qa-generate-testcases`.

## Chọn Mode

Hỏi user (nếu chưa rõ từ input): "Bạn có sẵn tài liệu/Jira ticket, hay muốn mình khảo sát trực tiếp trên website?"

| Mode | Input | Việc cần làm |
|---|---|---|
| **DOC** | File `.doc`/`.md`, Jira ticket đã export, user story, mockup/screenshot | Đọc và phân tích theo Bước 1–6 bên dưới |
| **WEBSITE** | URL hoặc mô tả module cần khảo sát, chưa có doc | Dùng browser tool/MCP để inspect DOM, form, luồng thao tác trực tiếp, rồi phân tích như DOC mode |
| **JIRA-FETCH** | Issue key / project key / JQL, muốn lấy trực tiếp từ Jira API | Chạy script fetch (xem `references/jira_integration.md`) để lấy raw data, sau đó chạy tiếp DOC mode trên nội dung lấy được |

Nếu user đưa cả doc và URL, ưu tiên DOC trước, dùng WEBSITE để đối chiếu/verify nếu cần.

## Các bước thực hiện (DOC / WEBSITE mode)

### Bước 1: Thu thập và đọc hiểu
1. Đọc requirement document / Jira ticket (parse HTML nếu ticket export dạng HTML) — xác định Ticket ID, Type, Priority, Status, Reporter, Assignee, Sprint.
   - **WEBSITE mode**: dùng browser tool để mở URL, inspect layout (header/sidebar/main/footer), form, input, button, thông báo lỗi. Không tự đoán field nếu chưa thấy trên giao diện thực tế.
2. Đọc mockup/screenshot nếu có — layout, components, fields.
3. Đọc related/dependent tickets nếu có, tóm tắt dependency.

### Bước 2: Trích xuất thông tin cốt lõi
- **Tổng quan (Overview)** — mục đích module/tính năng.
- **User Story** — "Là một [role], tôi muốn... để có thể..."
- **Phạm vi (Scope)** — module/page/component bị ảnh hưởng.
- **Acceptance Criteria** — phân rã từng AC thành nhóm logic, phân biệt mặc định vs tùy chọn.
- **Đặc tả trường dữ liệu (Field Specifications)** — bảng: Tên field, Loại UI, Validation (required/min/max/format), Ghi chú. Đây là phần quan trọng nhất cho automation.
- **Business Rules & Validation Messages** — liệt kê rule + thông báo lỗi mong đợi khi nhập sai.

### Bước 3: Phân tích Dependencies
Xác định ticket/feature liên quan, tóm tắt, đánh dấu rõ rule nào từ ticket chính vs ticket phụ thuộc.

### Bước 4: Phát hiện Ambiguities & Risks (giá trị cao nhất của skill này)

**Ambiguities** — mỗi điểm ghi rõ:
- Mã `AMB-XX`, câu hỏi cụ thể, nguy cơ nếu không giải quyết, mức độ 🔴 High / 🟡 Medium / 🟢 Low

Dấu hiệu cần soi: từ khóa mơ hồ ("where applicable", "similar to", "etc."), validation rule thiếu (min/max/format/required), hành vi edge case chưa nói (mạng lỗi, concurrent access, data rỗng), inconsistency giữa doc và mockup/UI thật, threshold/config chưa xác định, conflict giữa requirement cũ và mới.

**Testing Risks** — mỗi risk ghi: Mã `RISK-XX`, tên, mô tả, mitigation.

### Bước 5: Tổng hợp và xuất Artifact
- Ma trận trạng thái (nếu có state transitions)
- Checklist AC (checkbox, nhóm theo chức năng)
- Top khuyến nghị kiểm thử (KHÔNG phải test case)
- Xuất file `.md` theo cấu trúc output bên dưới

## Cấu trúc Output

Lưu vào `qa-automation/<feature-slug>/requirements-analysis.md`:

```markdown
# 📋 Phân Tích Yêu Cầu: [Ticket-ID hoặc tên module]

## 1. Tổng Quan
## 2. User Story
## 3. Phạm Vi Áp Dụng
## 4. Acceptance Criteria — Phân Tích Chi Tiết
## 5. Đặc Tả Trường Dữ Liệu (bảng field spec — dùng trực tiếp cho test data/automation)
## 6. Phụ Thuộc (Dependencies)
## 7. Điểm Mơ Hồ & Rủi Ro Kiểm Thử
## 8. Ma Trận Trạng Thái (nếu có)
## 9. Checklist Acceptance Criteria
## 10. Khuyến Nghị Cho Kiểm Thử
```

## Quy tắc bắt buộc

- ❌ KHÔNG sinh test case ở skill này
- ❌ KHÔNG tự đoán business logic khi document/UI không nói rõ → đưa vào mục Ambiguities
- ❌ KHÔNG bỏ qua comment trong Jira ticket — thường chứa thông tin bổ sung quan trọng
- ✅ PHẢI đọc related tickets nếu được reference trong AC
- ✅ Ở WEBSITE mode: PHẢI inspect UI thật, không suy diễn field/rule không quan sát được
- ✅ PHẢI ghi rõ inconsistency giữa document và UI/mockup thật
- ✅ PHẢI viết bằng Tiếng Việt, Markdown, xuất artifact

## Sau khi xong — gợi ý bước kế tiếp

Sau khi ghi xong `qa-automation/<feature-slug>/requirements-analysis.md`, hỏi user: "Đã phân tích xong yêu cầu. Bạn có muốn mình tiếp tục sinh test plan luôn không?" Nếu có, gọi `qa-generate-test-plan` và truyền file `requirements-analysis.md` vừa tạo làm input.

Nếu cần lấy dữ liệu thô từ Jira trước (mode JIRA-FETCH), xem `references/jira_integration.md`.
