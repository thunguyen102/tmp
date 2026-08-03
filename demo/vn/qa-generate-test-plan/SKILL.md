---
name: qa-generate-test-plan
description: Tạo test plan cho web application dựa trên tài liệu, URL, hoặc mô tả UI flow.
---

# Generate Application Test Plan

## Mục đích

Sinh test plan ngắn gọn nhưng đủ dùng cho feature web.

## Input

- tài liệu yêu cầu
- user story
- URL web app
- UI flow mô tả sẵn

## Output

- scope
- mục tiêu test
- rủi ro chính
- độ ưu tiên
- đề xuất automation/manual

## Chuẩn

- Mặc định theo Playwright + TypeScript
- Chỉ bám Playwright web-only

## Thực thi

- Nếu đã có `qa-automation/<feature-slug>/requirements-analysis.md` (từ `qa-gather-test-requirements`), dùng file đó làm input chính thay vì hỏi lại từ đầu.
- Chạy inline ngay trong lượt này, không phải job nền — không báo "đang generate/vui lòng đợi" rồi bỏ đó.
- Làm xong, ghi file, rồi báo ngay: đường dẫn file + tóm tắt scope/rủi ro/priority.

## Sau khi xong — gợi ý bước kế tiếp

Hỏi user: "Test plan đã xong. Bạn có muốn mình tiếp tục sinh test case luôn không?" Nếu có, gọi `qa-generate-testcases` và truyền file `test-plan.md` vừa tạo làm input.