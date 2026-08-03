# JIRA-FETCH mode — Lấy Requirements trực tiếp từ Jira

Dùng khi user muốn lấy issue/user story từ Jira thay vì paste tay. Kết quả lấy về sẽ được đưa tiếp vào Bước 1–5 của `qa-gather-test-requirements` (DOC mode) để phân tích.

## Prerequisites

- File `.env` đã tồn tại và cấu hình đúng (copy từ `.env.example` nếu chưa có)
- Dependencies đã cài: `cd scripts/integrations && npm install`

## Xác định input cần lấy

| Input user cung cấp | Flag dùng |
|---|---|
| Issue key cụ thể (VD: `PROJ-123`) | `--issue` |
| Project key + Issue type (VD: `PROJ`, `Story`) | `--project --type` |
| JQL query tùy chỉnh | `--jql` |
| Epic key (lấy toàn bộ children) | `--epic` |

Xác định format output: `json` (mặc định) hoặc `md` (markdown requirement, dùng trực tiếp cho DOC mode).

## Lệnh

```bash
# Lấy 1 issue cụ thể
node scripts/integrations/jira/jira_fetcher.js --issue <ISSUE_KEY>

# Lấy issues theo project
node scripts/integrations/jira/jira_fetcher.js --project <PROJECT_KEY> --type <TYPE> --max <N>

# Tìm theo JQL
node scripts/integrations/jira/jira_fetcher.js --jql "<JQL_QUERY>"

# Xuất Markdown (khuyến nghị — dùng thẳng cho DOC mode)
node scripts/integrations/jira/jira_fetcher.js --issue <KEY> --format md --output ./qa-automation/<feature-slug>
```

## Xử lý kết quả

- Kiểm tra output file trong thư mục `--output` chỉ định.
- Format `json`: đọc và tóm tắt issue cho user trước khi phân tích tiếp.
- Format `md`: đưa thẳng nội dung vào Bước 1 của DOC mode.

## Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách xử lý |
|---|---|---|
| HTTP 401 | Token sai | Kiểm tra `JIRA_API_TOKEN` hoặc `JIRA_PAT` trong `.env` |
| HTTP 404 | Issue không tồn tại hoặc `JIRA_BASE_URL` sai | Kiểm tra lại key và base URL |
| `.env not found` | Chưa copy file mẫu | `cp .env.example .env` rồi điền token |
| `Module not found` | Chưa cài dependency | `npm install` trong `scripts/integrations/` |

Sau khi lấy xong, tiếp tục Bước 2 trở đi của `qa-gather-test-requirements` (DOC mode) để phân tích ambiguities/risks — script này chỉ lấy raw data, không thay thế bước phân tích.
