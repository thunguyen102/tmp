# Field-Level Validation Checklist

> Dùng cho `qa-generate-testcases`. Khi form/UI có input field, liệt kê từng field và áp dụng đúng hàng tương ứng — không dùng chung 1 bộ validation cho tất cả field, không gộp nhiều field vào 1 TC.

| Loại Field | Validation cần test |
|---|---|
| **Text (Name, Address...)** | Required/Optional · Min length · Max length · Chỉ khoảng trắng (whitespace-only) · Ký tự đặc biệt (`<>&"'`) · XSS injection (`<script>alert(1)</script>`) · SQL injection (`' OR 1=1--`) · Unicode/Emoji · Leading/trailing spaces |
| **Email** | Format hợp lệ (`user@domain.com`) · Thiếu `@` · Thiếu domain · Domain không hợp lệ · Nhiều `@` · Ký tự đặc biệt trước `@` · Max length · Case sensitivity · Email đã tồn tại (nếu unique) |
| **Phone** | Chỉ chấp nhận số · Prefix hợp lệ (ví dụ: `+84`, `0`) · Min/Max length · Chữ cái xen lẫn · Dấu `-`, `.`, khoảng trắng · Mã vùng không hợp lệ |
| **Date / DateTime** | Format đúng (dd/MM/yyyy, ISO...) · Ngày không tồn tại (`31/02`, `30/02`) · Năm nhuận (`29/02/2024`) · Ngày quá khứ/tương lai (tùy business rule) · Giá trị min/max date · Timezone (nếu áp dụng) |
| **Number / Currency** | Min/Max value · Số âm · Số 0 · Số thập phân · Ký tự không phải số · Overflow (số cực lớn) · Leading zeros · Định dạng currency (dấu phẩy, dấu chấm) |
| **Dropdown / Select** | Giá trị mặc định · Tất cả options hợp lệ · Option bị disabled · Thay đổi selection · Required validation (chưa chọn) |
| **Checkbox / Radio** | Trạng thái mặc định · Check/Uncheck · Required validation · Nhóm radio (chỉ chọn 1) |
| **File Upload** | File type hợp lệ/không hợp lệ · Max size · File rỗng (0 KB) · Tên file có ký tự đặc biệt · Multiple files (nếu cho phép) · Kéo thả vs nút chọn |
| **Password** | Min/Max length · Yêu cầu ký tự đặc biệt · Yêu cầu chữ hoa/thường · Yêu cầu số · Copy-paste bị chặn? · Hiện/ẩn password · Confirm password khớp/không khớp |
| **Textarea** | Max length · Line breaks · HTML tags · Resize (nếu UI cho phép) · Character counter (nếu có) |

**Nguyên tắc:** Mỗi trường có đặc tính riêng → validation riêng. Phân tích từng field trước khi sinh TC, không dùng chung 1 bộ validation cho tất cả field.
