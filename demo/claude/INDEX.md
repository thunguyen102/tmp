# .claude Project Configuration Directory

This directory contains all Claude Code project configuration, tools, documentation, and automation rules.

---

## 📁 Folder Structure

```
.claude/
├── INDEX.md                    ← This file
├── README.md                   ← Main overview
│
├── config/                     🔧 Configuration & Setup
│   ├── settings.json           ← Framework defaults (reusable, domain-agnostic)
│   ├── project-config.json     ← Project scope config TEMPLATE (edit for YOUR project)
│   ├── project-config.json.example ← Example of filled-in config (recruitment sample)
│   ├── project-preferences.md  ← User preferences & scope choices (auto-saved)
│   ├── pre-delivery-check.ps1  ← Validation script (Windows/PowerShell)
│   └── pre-delivery-check.sh   ← Validation script (Linux/Mac/Bash)
│
├── tools/                      🛠️ Utility Scripts & Automation
│   └── validate-test-plan.cjs  ← Test plan validator (Node.js)
│
├── docs/                       📚 Documentation & Guides
│   ├── guides/
│   │   ├── validation-guide.md ← How to use validation scripts
│   │   ├── domain-agnostic.md  ← Domain-agnostic utilities
│   │   └── orchestrator-guide.md (if exists)
│   │
│   └── references/
│       └── auto-recommendation-strategy.md ← Auto-recommendation patterns
│
├── rules/                      📋 Project Rules & Standards
│   ├── automation_rules.md     ← QA automation standards
│   ├── code_structure_rules.md ← Code organization & architecture
│   ├── delivery_checklist.md   ← Pre-delivery QA checklist
│   ├── locator_strategy.md     ← Locator selection strategy
│   └── playwright_rules.md     ← Playwright-specific rules
│
├── skills/                     🎯 Specialized Skills & Agents
│   ├── qa-full-pipeline/       ← QA pipeline orchestrator
│   ├── generate-automation-framework/
│   ├── generate-application-test-plan/
│   ├── generate-automation-from-testcases/
│   └── ... (other QA skills)
│
└── orchestrator/               🎪 Orchestrator Components
    ├── orchestrator.ts         ← Main orchestrator code
    ├── QUICK_START.md
    └── README.md
```

---

## 🎯 Quick Reference

### For QA/Test Automation
- **Rules**: `rules/automation_rules.md` + `rules/playwright_rules.md`
- **Locators**: `rules/locator_strategy.md`
- **Architecture**: `rules/code_structure_rules.md`
- **Delivery**: `rules/delivery_checklist.md`

### For Test Plan Validation
- **Usage**: `docs/guides/validation-guide.md`
- **Tool**: `tools/validate-test-plan.cjs`
- **Scripts**: `config/pre-delivery-check.ps1` (Windows) or `config/pre-delivery-check.sh` (Linux/Mac)

### For Project Preferences
- **Saved Choices**: `config/project-preferences.md`
- **Auto-Recommendations**: `docs/references/auto-recommendation-strategy.md`

### For QA Skills & Automation
- **Full Pipeline**: `skills/qa-full-pipeline/SKILL.md`
- **Framework Setup**: `skills/generate-automation-framework/SKILL.md`
- **Test Planning**: `skills/generate-application-test-plan/SKILL.md`

---

## 🚀 Common Commands

### Validate Test Plan (Before Delivery)

**Windows (PowerShell)**:
```powershell
powershell -ExecutionPolicy Bypass -File .claude/config/pre-delivery-check.ps1 -PlanFile "docs/planning/recruitment-test-plan.md"
```

**Linux/Mac (Bash)**:
```bash
bash .claude/config/pre-delivery-check.sh docs/planning/recruitment-test-plan.md
```

**Direct (Any OS)**:
```bash
node .claude/tools/validate-test-plan.cjs docs/planning/recruitment-test-plan.md
```

### View Guides
- Validation: `cat docs/guides/validation-guide.md`
- Automation Rules: `cat rules/automation_rules.md`
- Locator Strategy: `cat rules/locator_strategy.md`

---

## 📌 Key Files at a Glance

| File | Purpose | Last Updated |
|------|---------|---|
| `config/settings.json` | Framework defaults (generic, multi-project) | 2026-07-21 |
| `config/project-config.json` | Recruitment project specifics | 2026-07-21 |
| `config/project-preferences.md` | User scope choices & framework preferences | Auto-saved |
| `tools/validate-test-plan.cjs` | Test plan structural validation | 2026-07-21 |
| `rules/automation_rules.md` | QA automation standards & best practices | v1.0 |
| `docs/guides/validation-guide.md` | How to validate test plans | v1.0 |

---

## ✅ Organization Benefits

- 🗂️ **Clear separation** of concerns (config, tools, docs, rules, skills)
- 🔍 **Easy navigation** - each folder has a clear purpose
- 🚀 **Scalable** - new guides, tools, and rules go in appropriate folders
- 📚 **Professional** - follows project best practices
- 🎯 **Self-documenting** - folder names explain contents

---

## 🔄 File Movement Reference

| Old Location | New Location | Reason |
|---|---|---|
| `project-preferences.md` | `config/project-preferences.md` | Configuration data |
| `pre-delivery-check.ps1` | `config/pre-delivery-check.ps1` | Setup/config scripts |
| `pre-delivery-check.sh` | `config/pre-delivery-check.sh` | Setup/config scripts |
| `VALIDATION-GUIDE.md` | `docs/guides/validation-guide.md` | User documentation |
| `domain-agnostic.md` | `docs/guides/domain-agnostic.md` | Reference guide |
| `references/*` | `docs/references/` | Documentation references |

---

**Status**: ✅ Reorganized 2026-07-21  
**Structure**: Professional & Scalable  
**Ready for**: Production use
