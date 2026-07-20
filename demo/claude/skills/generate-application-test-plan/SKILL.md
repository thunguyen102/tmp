---
name: generate-application-test-plan
description: Khám phá ứng dụng web, sinh test plan và test scenarios. Hỗ trợ 2 mode — PLAN (chỉ test plan) và FULL (test plan + automation skeleton).
---

# Workflow: Khám Phá Ứng Dụng & Sinh Test Plan

> **BẮT BUỘC (MANDATORY SKILL):** Bạn PHẢI nạp và đọc kỹ nội dung của skill **`$qa-automation-engineer`** (tại `.agents/skills/qa-automation-engineer/SKILL.md`) trước khi bắt đầu. Ngoài ra, tham khảo thêm skill **`$requirements-analyzer`** và **`$ui-debug-agent`** để hỗ trợ phân tích UI.

Workflow này giúp agent tự động khám phá một ứng dụng web, phân tích cấu trúc, xác định các modules/user flows quan trọng, và sinh ra Test Plan hoàn chỉnh.

## ⚠️ Nguyên tắc thực thi

- **Tất cả output bằng Tiếng Việt**
- **KHÔNG đoán** cấu trúc app — phải inspect DOM thực tế qua MCP/browser tools
- **Phải chờ user xác nhận** scope tại Bước 2 trước khi sinh chi tiết
- Nếu user chưa cung cấp URL → hỏi trước khi bắt đầu
- **Output Files Organization (BẮT BUỘC):**
  - Test plan → `docs/planning/recruitment-test-plan.md` (lowercase, hyphen)
  - Implementation summary → `docs/planning/implementation-summary.md`
  - Scope checkpoint → `docs/planning/scope-checklist.md`
  - Không tạo file UPPERCASE (e.g., ❌ `TEST_PLAN.MD`)

## 2 Chế độ (Mode)

| Mode | Khi nào sử dụng | Output |
|---|---|---|
| **PLAN** (mặc định) | User cần khám phá app, lập test plan, xác định scenarios | Modules, User Flows, Test Scenarios, Priority |
| **FULL** | User yêu cầu thêm automation skeleton hoặc nói "full automation suite" | Như PLAN + Manual Test Cases + Automation Skeleton (POM + Test classes) |

> Nếu user nói "generate full automation suite", "bootstrap automation", hoặc yêu cầu code → tự động chuyển sang **Mode FULL**.

## Các bước thực hiện

### Bước 1: Tiếp nhận & Khám phá ứng dụng (Recon)

1. Nhận URL ứng dụng từ user
2. Sử dụng **MCP browser tools** (Playwright MCP) để mở ứng dụng:
   - `browser_navigate` → URL
   - `browser_resize(1920, 1080)` → desktop viewport
   - `browser_snapshot` → thu thập cấu trúc DOM
3. Khám phá **navigation menus**, sidebar, header để xác định các modules chính
4. Lần lượt truy cập từng module chính, dùng `browser_snapshot` để ghi nhận:
   - Tên module / trang
   - Các thành phần UI chính (forms, tables, buttons, modals)
   - Các action có thể thực hiện (CRUD, search, filter, export...)
5. Nếu app yêu cầu đăng nhập → hỏi user cung cấp credentials hoặc dùng fixture sẵn có

### Bước 2: Phân tích & Auto-Recommend Scope (Analysis — CHECKPOINT)

1. Tổng hợp kết quả khám phá thành danh sách:
   - **Modules đã phát hiện** (tên, mô tả ngắn, số lượng features)
   - **User Flows chính** (Happy Path cho mỗi module)
   - **Dependencies** giữa các modules (nếu có)

2. Đánh giá **Risk Level** cho mỗi module:
   - 🔴 **High Risk** — Module core, ảnh hưởng nhiều user, logic phức tạp
   - 🟡 **Medium Risk** — Module phụ trợ, sử dụng thường xuyên
   - 🟢 **Low Risk** — Module ít sử dụng, ít thay đổi

3. **🤖 INTELLIGENT AUTO-RECOMMENDATION** (thay vì hỏi user):
   
   Phân tích context:
   - Project maturity (bootstrap stage? existing? mature?)
   - Incremental constraints (1 test case/cycle = scope nhỏ)
   - User profile (assume non-technical, giảm decision fatigue)
   - Risk prioritization (🔴 HIGH risk modules first)

   **Auto-recommend best scope:**
   - Chọn 1-2 modules có 🔴 HIGH risk (15-25 scenarios)
   - Exclude secondary modules (add in later slices)
   - Recommend PLAN mode (fast validation) trước FULL mode
   - Provide clear rationale (vì sao recommendation này?)

4. **⏸️ DỪNG LẠI — Trình bày cho user approval (SIMPLE!):**

   ```markdown
   ## 🤖 RECOMMENDED SCOPE (Auto-Suggested)
   
   Dựa trên: [Risk analysis], [Incremental approach], [Project maturity]
   
   ### Đề xuất (Best Practice Path)
   - ✅ [Module 1]: [Số scenarios] scenarios — [Lý do ngắn]
   - ✅ [Module 2]: [Số scenarios] scenarios — [Lý do ngắn]
   - ✅ [Decision 1]: [Cách làm] — [Lý do]
   - ✅ [Decision 2]: [Cách làm] — [Lý do]
   
   ### Tổng: [Total] scenarios, [Vertical Slice Name]
   
   ---
   
   **Bạn chấp nhận recommendation này không?**
   
   - ✅ **YES** → Dùng recommendation, sang Bước 3
   - ⚠️ **CUSTOM** → Bảo tôi thay đổi cái gì
   - ❓ **QUESTIONS** → Hỏi about specific decisions
   
   **Default (nếu không response):** Dùng recommendation tự động
   ```

5. **⏸️ Chờ user approval** (simple 3-option, không 5 yes/no questions):
   - YES → Proceed
   - CUSTOM → Pivot theo yêu cầu (không re-explain)
   - QUESTIONS → Answer cụ thể rồi approve

6. **💾 Lưu preference** vào `.claude/project-preferences.md`:
   - Scope choice (modules, scenarios count)
   - User profile (technical level)
   - Reuse in next iterations (giảm repetitive decisions)

### Bước 3: Sinh Test Scenarios & Priority

1. Với mỗi module/flow đã được user xác nhận, sinh test scenarios:
   - **Happy Path** — luồng chính thành công
   - **Negative Path** — nhập sai, thiếu dữ liệu, lỗi validation
   - **Edge Cases** — boundary values, concurrent access, empty states
2. Gán **Priority** cho mỗi scenario dựa trên Risk Level:
   - **P1 (Critical)** — Core flows, regression blockers, dữ liệu nhạy cảm
   - **P2 (High)** — Main features, tính năng sử dụng thường xuyên
   - **P3 (Medium)** — Secondary features, UI/UX checks
   - **P4 (Low)** — Nice-to-have, cosmetic checks

### Bước 4: Đóng gói Test Plan (Output — Mode PLAN)

1. Tạo **artifact** `test_plan.md` với cấu trúc:
   - **Tổng quan ứng dụng** — mục đích, tech stack (nếu xác định được), URL
   - **Danh sách Modules** — bảng gồm: Module, Mô tả, Risk Level, Số scenarios
   - **User Flows** — mô tả từng flow chính (steps)
   - **Test Scenarios** — bảng: `| ID | Module | Scenario | Priority | Loại (Happy/Negative/Edge) |`
   - **Automation Candidates** — đánh dấu scenarios nào nên tự động hóa và lý do
2. Nếu user chọn **Mode PLAN** → **KẾT THÚC** tại đây

### Bước 5: Sinh Manual Test Cases (Mode FULL)

> Chỉ thực hiện khi ở **Mode FULL**

1. Chuyển test scenarios (Bước 3) thành **manual test cases đầy đủ**:
   - TC ID, Module, Test Title, Pre-conditions, Test Steps, Expected Results, Test Data, Priority
2. Test Data phải **cụ thể** (không placeholder chung chung)
3. Xuất dưới dạng bảng Markdown trong artifact

### Bước 6: Sinh Automation Skeleton (Mode FULL)

> Chỉ thực hiện khi ở **Mode FULL**

1. Xác định **tech stack** automation (hỏi user nếu chưa rõ):
   - Mặc định: Playwright + TypeScript (hoặc Selenium + Java theo preference)
2. Sinh **Page Object classes** cho mỗi module:
   - Locator thu thập từ DOM thực tế (Bước 1), KHÔNG đoán
   - Methods tương tác rõ nghĩa
3. Sinh **Test class skeleton** cho top-priority scenarios (P1, P2)
4. Đảm bảo tuân thủ **POM pattern** và **locator strategy** theo rules

## 💾 Preferences & Reuse

### Auto-Save User Preferences

Sau khi user approve scope, lưu preference vào:
```
.claude/project-preferences.md
```

Format:
```markdown
---
project: [project-name]
test-plan-version: [version]
---

## Scope Preference (Auto-Saved)

| Aspect | Choice | Date Saved |
|---|---|---|
| Vertical Slice | [modules] | [date] |
| Scenarios Count | [number] | [date] |
| Mode | PLAN / FULL | [date] |
| Test Data Setup | Auto / Manual | [date] |

## Auto-Recommendations Used
- [Recommendation 1] ✅
- [Recommendation 2] ✅
```

### Reuse in Future Iterations

Khi user chạy skill lần 2+:
1. **Check** `.claude/project-preferences.md` có tồn tại?
2. **If YES** → Sử dụng saved preferences làm default (KHÔNG hỏi lại)
3. **If NO** → Auto-recommend như lần đầu
4. **Allow override** — User có thể bảo "dùng scope khác lần này"

**Lợi ích:** Non-technical users KHÔNG phải đưa ra lại decisions, workflow tự động

---

## Output

### Mode PLAN
- **File:** `docs/planning/recruitment-test-plan.md` (or similar)
- **Content:** App overview, Modules, User Flows, Test Scenarios (có Priority), Automation Candidates
- **Scope:** Auto-recommended, user-approved
- **Preferences:** Saved in `.claude/project-preferences.md`

### Mode FULL
- Tất cả output của Mode PLAN, cộng thêm:
- Manual Test Cases (bảng Markdown)
- Page Object classes  
- Test class skeletons
- Assertions validating expected behavior

---

## Best Practices for Auto-Recommendations

### ✅ DO
- Auto-recommend based on risk analysis (🔴 HIGH first)
- Recommend small scope (15-25 scenarios) for incremental approach
- Provide clear rationale (vì sao recommendation?)
- Use 3-option approval (YES/CUSTOM/QUESTIONS), not 5 binary choices
- Save preferences for reuse
- Assume user is non-technical (minimize decision burden)

### ❌ DON'T
- Ask "what modules do you want?" (let analysis decide)
- Present 5+ yes/no questions (decision fatigue)
- Force large scope (violates incremental principle)
- Make recommendations without reasoning
- Forget to save preferences for next iteration
- Re-ask decisions user already made in this project