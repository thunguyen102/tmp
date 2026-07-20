# .claude/ — AI-Assisted QA Automation Ecosystem

This directory contains a **reusable, domain-agnostic** automation framework and 20+ AI skills.

## 🎯 Core Concept

**One framework, infinite domains:**
- ✅ Rules, patterns, and skills = **domain-agnostic** (reusable across projects)
- ✅ Project config (`project-config.json`) = **customizable per project**
- ✅ Test plans, page objects, test data = **generated per project**

Use for ANY application, ANY domain — just customize `config/project-config.json` for your scope.

## 📂 Directory Structure

```
.claude/
├── README.md                      ← You are here
├── project-preferences.md         ← Stores project-specific preferences (generated per project)
├── orchestrator/                  ← Orchestrator code & documentation
├── skills/                        ← 20+ Specialized AI skills (domain-agnostic)
├── references/                    ← Example documents & templates
├── rules/                         ← Best practices (applies to all domains)
└── agents/                        ← Agent configurations (if available)
```

---

## 🎯 Key Files

### Project Preferences (Generated Per Project)
- **`project-preferences.md`** — Auto-generated per project, stores:
  - Scope decisions (which modules to test first)
  - User profile (technical level)
  - Approved recommendations
  - Reused in future iterations (no re-asking)
  - **Template:** Created fresh for each project

### Orchestrator
- **`orchestrator/QUICK_START.md`** — Quick start guide
- **`orchestrator/README.md`** — Orchestrator documentation
- **`orchestrator/orchestrator.ts`** — Orchestrator implementation

### Skills (AI Automation Tools)
- **`skills/generate-automation-framework/`** — Bootstrap Playwright framework
- **`skills/generate-application-test-plan/`** — Discover app, create test plan
- **`skills/generate-automation-from-testcases/`** — Implement test cases incrementally
- **`skills/flaky-test-analyzer/`** — Analyze and fix flaky tests
- **`skills/locator-healer-agent/`** — Auto-repair broken locators
- **`skills/smart-locator-agent/`** — Generate robust locators
- **`skills/ui-debug-agent/`** — Inspect and debug UI
- And 10+ more specialized skills...

### Rules (Project Guidelines)
- **`rules/automation_rules.md`** — General QA automation rules (Playwright + TypeScript)
- **`rules/code_structure_rules.md`** — Code organization, constants, POM pattern
- **`rules/playwright_rules.md`** — Playwright-specific rules & best practices
- **`rules/selenium_rules.md`** — Selenium-specific rules (if applicable)
- **`rules/appium_rules.md`** — Mobile automation rules (if applicable)
- **`rules/locator_strategy.md`** — Locator selection strategy & stability
- **`rules/delivery_checklist.md`** — Pre-delivery verification checklist

### References (Documentation & Strategies)
- **`references/auto-recommendation-strategy.md`** — How auto-recommendations work (essential reading)

---

## 🚀 Quick Start

### 1. Run Full QA Pipeline
```bash
/qa-full-pipeline
```
This orchestrator detects project state and invokes the right skill:
- **No framework?** → Bootstrap framework
- **Framework exists?** → Generate test plan
- **Plan exists?** → Runtime discovery + incremental implementation

### 2. Individual Skills

**Generate Framework:**
```bash
/generate-automation-framework
```

**Generate Test Plan:**
```bash
/generate-application-test-plan
```

**Auto-fix Broken Locators:**
```bash
/locator-healer-agent
```

**Analyze Flaky Tests:**
```bash
/flaky-test-analyzer
```

---

## 💡 Key Concepts

### Auto-Recommendation Strategy
Instead of asking users 5 yes/no questions, skills now:
1. **Analyze** project state (risk levels, constraints, user profile)
2. **Recommend** best option with clear reasoning
3. **Simple approval** — YES / CUSTOM / QUESTIONS (3 options, not 5)
4. **Save preferences** — Reuse in future iterations

**Result:** Faster workflow, less decision fatigue for non-technical users

### Incremental Approach
All automation follows **1 test case at a time** pattern:
1. Generate code for 1 test case
2. Run immediately (headed mode)
3. PASS → Move to next case
4. FAIL → Fix root cause, re-run (max 5 attempts)
5. Only proceed if current case PASS

**Prevents infinite loop:** No batch failures misclassified as "flaky"

### POM Pattern
All page objects follow **Page Object Model**:
- Locators centralized in page classes
- Assertions only in test files
- Common methods in BasePage
- Semantic Playwright locators (getByRole, getByLabel, etc.)

### Smart Waits
No hardcoded `sleep()` calls:
- Playwright auto-waits
- Explicit waits when needed (`waitFor()`)
- Framework timeouts from constants

---

## 📊 QA Automation Pipeline (13-Stage Workflow)

**Generic workflow applies to ANY application/domain:**

### ✅ Completed Stages (Example: OrangeHRM Recruitment)
1. **Stage 1: Bootstrap** ✅ — Playwright framework scaffolded
2. **Stage 2: Plan** ✅ — Test plan generated (46 scenarios, 5 modules)
3. **Stage 3: Scope Checkpoint** ✅ — Auto-recommendation approved

### ⏳ Next Stages (Same for All Projects)
4. **Stage 4: Runtime Discovery** → Inspect real DOM, collect locators
5. **Stage 5-10: Incremental Implementation** → 1 test case per run
6. **Stage 11-13: Full Regression & Report** → All slices green, final metrics

**This workflow is reusable for:**
- ✅ E-commerce platforms
- ✅ SaaS applications
- ✅ Mobile apps (via Appium)
- ✅ APIs (via REST testing)
- ✅ Any web application

---

## 🎯 How Scope Works (Domain-Agnostic)

**Example (OrangeHRM Recruitment):**
```
Auto-Recommended Scope:
├─ Slice 1: Vacancies + Candidates (20 scenarios)
├─ Slice 2: Candidate Pipeline (16 scenarios)
├─ Slice 3: Public Apply Form (6 scenarios)
└─ Slice 4: Access Control (4 scenarios)
```

**Your Project:** Replace with your own modules/features
```
Auto-Recommended Scope (YOUR APP):
├─ Slice 1: [Module A] + [Module B] (X scenarios)
├─ Slice 2: [Module C] (Y scenarios)
└─ Slice 3: [Module D] (Z scenarios)
```

**Each project gets fresh `project-preferences.md` with its own scope.**

---

## 📚 References

### How to Navigate
- **Need framework rules?** → `rules/automation_rules.md`
- **Need skill documentation?** → `skills/[skill-name]/SKILL.md`
- **Need project preferences?** → `project-preferences.md`
- **Need test plan?** → `references/recruitment-test-plan.md`
- **Need strategy explanation?** → `references/auto-recommendation-strategy.md`

### Important Files (Outside `.claude/`)
- **`package.json`** — NPM dependencies
- **`playwright.config.ts`** — Playwright configuration
- **`src/`** — Framework code (pages, tests, utils)
- **`README.md`** — Setup guide for automation framework

---

## 🔄 Workflow Summary

```
1. Bootstrap (DONE) ✅
   └─ Playwright framework with POM pattern

2. Plan (DONE) ✅
   └─ 46 test scenarios identified (5 modules)

3. Scope Approval (DONE) ✅
   └─ Auto-recommended: Vacancies + Candidates (20 scenarios)
   └─ Saved in project-preferences.md

4. Runtime Discovery (READY) ⏳
   └─ Inspect real DOM
   └─ Collect locators
   └─ Verify app accessibility

5-10. Incremental Implementation (READY) ⏳
      └─ 1 test case per run
      └─ PASS gates next case
      └─ Run immediately, debug immediately

11-13. Full Regression & Completion (READY) ⏳
       └─ All slice tests green
       └─ Generate final report
       └─ Metrics: pass/fail/skip breakdown
```

---

## 🛠️ Tools Available

This setup includes 20+ specialized AI skills:

| Skill | Purpose |
|---|---|
| `qa-full-pipeline` | Orchestrator — routes work through stages |
| `generate-automation-framework` | Bootstrap Playwright framework |
| `generate-application-test-plan` | Discover app, create test scenarios |
| `generate-automation-from-testcases` | Convert test cases → automation (incremental) |
| `generate-automation-from-ui-flow` | Record UI interactions → test code |
| `flaky-test-analyzer` | Analyze & fix flaky/unstable tests |
| `locator-healer-agent` | Auto-repair broken locators |
| `smart-locator-agent` | Generate robust, semantic locators |
| `ui-debug-agent` | Inspect DOM, take screenshots, debug |
| `test-data-generator` | Create unique traceable test data |
| And 10+ more... | See `skills/` directory |

---

## 💾 Taking `.claude/` with You

This directory is **completely self-contained**. You can:
1. Copy entire `.claude/` folder to another project
2. Rules, skills, and preferences will all work
3. No external dependencies (except Node.js for running tests)

**What's inside:**
- ✅ Skill definitions (20+ skills)
- ✅ Project rules & guidelines
- ✅ Preferences & decisions
- ✅ Reference documents
- ✅ Orchestrator code

**What's NOT inside (stays in project root):**
- `package.json` — Move if needed
- `playwright.config.ts` — Move if needed
- `src/` — Framework code (regenerate with skill if needed)
- Test results & artifacts

---

## 📋 Essential Files Only (Cleaned Up)

`.claude/` now contains **only essential files** — no examples, no redundant docs:

- ✅ `README.md` — Main overview
- ✅ `domain-agnostic.md` — How to reuse for any project
- ✅ `project-preferences.md` — Template (auto-filled per project)
- ✅ `rules/` — 7 universal best practice guides
- ✅ `skills/` — 20+ AI automation skills
- ✅ `orchestrator/` — 13-stage pipeline orchestrator
- ✅ `references/auto-recommendation-strategy.md` — Strategy documentation

**Removed (redundant/example-only):**
- ❌ Recruitment-specific test plans
- ❌ Framework progress examples
- ❌ Implementation summary examples
- ❌ Output organization guide (info in skills)

---

## 📝 Pipeline Status

| Date | Stage | Status | Notes |
|---|---|---|---|
| 2026-07-20 | 1: Bootstrap | ✅ DONE | Framework scaffolded |
| 2026-07-20 | 2: Plan | ✅ DONE | Test plan generated |
| 2026-07-20 | 3: Scope | ✅ DONE | Auto-recommendation approved |
| 2026-07-20 | 4+: Ready | ⏳ NEXT | Use `/qa-full-pipeline` to continue |

---

## 🤝 Support

**Questions?** Check these in order:
1. `README.md` (this file)
2. `project-preferences.md` (approved configuration)
3. `references/recruitment-test-plan.md` (test scenarios)
4. `rules/automation_rules.md` (project guidelines)
5. Individual skill docs in `skills/[skill-name]/SKILL.md`

---

**Everything needed is in `.claude/` — Copy this folder and you're ready to go! ✅**
