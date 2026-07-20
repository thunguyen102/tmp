# Domain-Agnostic Design — `.claude/` is Reusable Across All Projects

**Date Updated:** 2026-07-20

The `.claude/` folder is **completely domain-agnostic**. It works for:
- ✅ OrangeHRM Recruitment
- ✅ E-commerce platforms
- ✅ SaaS applications
- ✅ Social networks
- ✅ Banking systems
- ✅ Any web application

---

## 🎯 What's Domain-Agnostic?

### ✅ REUSABLE (Domain-Agnostic)

| Component | Reusable? | Usage |
|---|---|---|
| `.claude/skills/` (20+ skills) | ✅ Yes | Works with ANY application |
| `.claude/rules/` | ✅ Yes | Best practices apply to all domains |
| `.claude/orchestrator/` | ✅ Yes | 13-stage pipeline for all projects |
| `.claude/project-preferences.md` | ✅ Yes | Template, regenerated per project |
| `.claude/references/auto-recommendation-strategy.md` | ✅ Yes | Strategy, not domain-specific |

### 📝 EXAMPLE FILES (For Reference Only)

| File | Purpose | Domain |
|---|---|---|
| `.claude/references/recruitment-test-plan.md` | Example test plan format | OrangeHRM (example only) |
| `.claude/references/framework-setup-progress.md` | Example progress tracker | Generic example |
| `.claude/references/implementation-summary.md` | Example delivery summary | Generic example |

---

## 🔄 How to Use for Your Project

### Step 1: Copy `.claude/` folder
```bash
cp -r .claude/ /new-project/.claude/
```

### Step 2: Run `/qa-full-pipeline`
Skills will:
1. **Ignore example files** (they're just references)
2. **Generate fresh files for YOUR project:**
   - `.claude/project-preferences.md` — YOUR project's scope
   - `docs/planning/[YOUR-APP]-test-plan.md` — YOUR project's test plan
   - Framework files in `src/` — YOUR app's automation

### Step 3: Follow the workflow
Generic 13-stage pipeline works the same way:
1. Bootstrap framework
2. Generate test plan (from YOUR app)
3. Scope checkpoint (YOUR modules)
4. Runtime discovery (YOUR app)
5-13. Incremental implementation...

---

## 📋 Template Files (Replace with Your Values)

`.claude/project-preferences.md` is a **template**, not a fixed config:

```markdown
---
project: [YOUR PROJECT NAME]          ← Replace
framework: [Your framework choice]    ← Replace
---

## 🤖 Scope Recommendation

### Recommended Vertical Slice: [Module A] + [Module B]
├─ [YOUR MODULES] (X scenarios)
├─ Exclude: [YOUR FEATURES] (add later)
└─ Test Data: [YOUR STRATEGY]
```

**When you run `/qa-full-pipeline`:**
1. Skills analyze YOUR app
2. Generate recommendations for YOUR modules
3. Save to `.claude/project-preferences.md` (auto-generated)
4. Reuse in future iterations (no re-asking)

---

## 🎓 Example vs. Template

### ❌ Example (OrangeHRM Recruitment)
- Vacancies module
- Candidates module
- Candidate Pipeline
- Public Apply Form
- HTTP 500 defect in this specific app

**This is just an EXAMPLE.** Your project will have different modules.

### ✅ Template (Domain-Agnostic)
```
Modules: [YOUR MODULES]
Scenarios: [YOUR COUNT]
Risk Level: [YOUR ASSESSMENT]
Test Data: [YOUR STRATEGY]
Known Issues: [YOUR DEFECTS]
```

**Your project fills in the `[YOUR X]` placeholders.**

---

## 🚀 Multi-Project Usage

```
Desktop/
├── project-orangehrm/
│   ├── .claude/                    ← Shared skills & rules
│   ├── src/                        ← OrangeHRM framework code
│   └── project-preferences.md      ← OrangeHRM scope
│
├── project-shopify-store/
│   ├── .claude/                    ← Same skills & rules
│   ├── src/                        ← Shopify framework code
│   └── project-preferences.md      ← Shopify scope
│
└── project-banking-app/
    ├── .claude/                    ← Same skills & rules
    ├── src/                        ← Banking framework code
    └── project-preferences.md      ← Banking scope
```

**Each project has:**
- ✅ Same `.claude/` foundation
- ✅ Different `project-preferences.md` (project-specific)
- ✅ Different `src/` code (different apps)

---

## 🎯 What Skills Do

### Example: `generate-application-test-plan`

**For OrangeHRM Recruitment:**
```
Input: URL = https://orangehrm-demo.com
Output: 5 modules identified
        46 test scenarios
        Auto-recommendation: Vacancies + Candidates
```

**For YOUR E-commerce App:**
```
Input: URL = https://your-ecommerce.com
Output: [YOUR modules] identified
        [YOUR scenario count] test scenarios
        Auto-recommendation: [YOUR modules]
```

**Same skill, different output based on what it discovers.**

---

## 💾 Rules (Truly Domain-Agnostic)

`.claude/rules/` applies to **all** projects:

| Rule | Applies To |
|---|---|
| `automation_rules.md` | All Playwright + TypeScript projects |
| `code_structure_rules.md` | All POM-based automation |
| `playwright_rules.md` | All Playwright projects |
| `locator_strategy.md` | All web automation |

**These rules don't change per project. They're universal best practices.**

---

## 🔄 Workflow is Domain-Agnostic

13-stage pipeline works the same for all projects:

```
Stage 1: Bootstrap
├─ Scaffolds Playwright framework (same for all apps)
│
Stage 2: Plan
├─ Discovers YOUR app (different per project)
├─ Generates YOUR test scenarios
│
Stage 3: Scope Checkpoint
├─ Auto-recommends YOUR modules (different per project)
├─ User approves YOUR scope
│
Stage 4-13: Implementation
├─ Incremental testing (same approach for all)
├─ Uses YOUR modules (different per project)
└─ Generates YOUR reports (different content)
```

**Workflow structure is fixed. Content changes per project.**

---

## ✅ Checklist: Is `.claude/` Domain-Agnostic?

- [x] Skills work with any application? **YES**
- [x] Rules apply universally? **YES**
- [x] Orchestrator is generic? **YES**
- [x] Example files clearly marked? **YES**
- [x] Templates have [YOUR X] placeholders? **YES**
- [x] Project preferences auto-generated per project? **YES**
- [x] No hardcoded domain values? **YES**
- [x] Reusable across multiple projects? **YES**

---

## 🎯 Summary

**`.claude/` contains:**
1. ✅ **Generic skills** (work with any app)
2. ✅ **Universal rules** (best practices for all)
3. ✅ **Domain-agnostic orchestrator** (13-stage pipeline)
4. ✅ **Templates** (not fixed configs)
5. ✅ **Examples** (for reference, marked clearly)

**When you use it:**
1. Copy `.claude/` to your project
2. Run `/qa-full-pipeline`
3. Skills analyze YOUR app
4. Generates YOUR test plan
5. Recommends YOUR scope
6. Auto-saves YOUR preferences

**Result:** Same framework, different projects. Truly reusable. ✅

---

**`.claude/` is NOT locked to OrangeHRM Recruitment.**

**It's a complete, reusable, domain-agnostic QA automation ecosystem.**

Take it anywhere. Use it on any application. ✨
