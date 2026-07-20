# Auto-Recommendation Strategy — Skill Enhancement

**Date Updated:** 2026-07-20  
**Skills Updated:**
- `.claude/skills/generate-application-test-plan/SKILL.md`
- `.claude/skills/qa-full-pipeline/SKILL.md`

---

## 🎯 Problem Statement

**Before:** Skills asked non-technical users 5+ binary yes/no questions about scope, causing:
- ❌ Decision paralysis (too many choices)
- ❌ Users don't understand automation complexity
- ❌ Repetitive questions across iterations
- ❌ Delays in moving forward

**After:** Skills auto-recommend best option with simple 3-option approval:
- ✅ Clear path (analysis decides, user approves)
- ✅ Reduces cognitive load
- ✅ Saves preferences for reuse
- ✅ Faster workflow

---

## 🤖 How Auto-Recommendations Work

### Step 1: Analysis (Automated)
Skill analyzes project state to determine best scope:
```
Inputs:
├── Risk levels (HIGH/MEDIUM/LOW per module)
├── Incremental constraints (1 test/cycle = small scope)
├── Project maturity (bootstrap? existing?)
└── User profile (assume non-technical)

↓ Analysis Engine

Output: Recommended scope
├── Module selection (which 1-2 modules to automate first)
├── Scenario count (15-25 recommended)
├── Approach decisions (test data setup, permissions testing, etc.)
└── Rationale (why this recommendation)
```

### Step 2: Recommendation (Presented to User)

**OLD FORMAT (❌ Don't do this):**
```
1. Vertical Slice Selection: Vacancies only / Candidates only / Both / Full?
2. Public Apply Form: Yes or No?
3. Permissions Testing: Yes or No?
4. Test Data: Auto or Manual?
5. Confirm HTTP 500 defect awareness?
```
👎 5 separate decisions = decision fatigue

**NEW FORMAT (✅ Do this):**
```
## 🤖 RECOMMENDED SCOPE (Auto-Suggested)

Based on: Risk Analysis, Incremental Approach, Project Stage

### Recommended Vertical Slice: Vacancies + Candidates
- ✅ Vacancies: 8 scenarios — HIGH risk, foundational CRUD
- ✅ Candidates: 12 scenarios — HIGH risk, core lifecycle  
- ✅ Public Apply: Excluded (add in Slice 2) — Secondary entry point
- ✅ Test Data: Auto-fixture — Framework handles traceable data
- ✅ Permissions: Admin-only (Slice 4) — Security in separate slice

**Total: 20 scenarios, ~5-6 core tests per run**

---

### Quick Approval (Pick ONE):
- ✅ YES → Accept, proceed to Runtime Discovery
- ⚠️ CUSTOM → Tell me what to change
- ❓ QUESTIONS → Ask about specific decisions
```
👍 1 decision (approve recommendation?) = clear path

### Step 3: Confirmation & Storage

User picks one of 3 options:

| Option | What Happens | Follow-up |
|---|---|---|
| ✅ **YES** | Accept recommendation, proceed immediately | Move to next stage |
| ⚠️ **CUSTOM** | "Tell me what to change" (no re-explanation needed) | Pivot to user's choice |
| ❓ **QUESTIONS** | Answer specific questions, then approve | Clear confusion, then proceed |

After approval:
1. **Save to `.claude/project-preferences.md`** — Store decision
2. **Next iteration:** Check preferences, reuse (don't re-ask)
3. **Allow override:** "Use different scope this time?" (optional)

---

## 📋 Implementation Details

### Updated Skills

#### 1. `generate-application-test-plan/SKILL.md`

**Change:** Bước 2 (Step 2) now includes auto-recommendation logic

**Before:**
```markdown
- Hỏi user: "Bạn muốn tập trung vào modules nào?"
- Chờ user xác nhận scope
```

**After:**
```markdown
- 🤖 INTELLIGENT AUTO-RECOMMENDATION
  ├── Analyze context (maturity, constraints, risk)
  ├── Determine best scope (1-2 HIGH risk modules)
  ├── Provide clear rationale
  └── Present 3-option approval

- 💾 Save preference to .claude/project-preferences.md
- Reuse in future iterations (no re-asking)
```

**Key Update:** Section "Bước 2: Phân tích & Auto-Recommend Scope"

---

#### 2. `qa-full-pipeline/SKILL.md`

**Change:** Scope Checkpoint gate now uses auto-recommendations

**Before:**
```markdown
Always stop and let the user choose:
- proceed with all cases
- trim/exclude low-priority
- add missing scenarios
- decide how known defects should be treated
- define the vertical slice
```

**After:**
```markdown
🤖 Auto-Recommendation Strategy:
- Analyze risk levels, incremental constraints, project maturity
- Recommend 1-2 HIGH risk modules (15-25 scenarios)
- Present with clear rationale
- Simple 3-option approval (YES/CUSTOM/QUESTIONS)

💾 Save preference for reuse
```

**Key Update:** Section "Scope Checkpoint — Mandatory Gate #1"

---

### Supporting Files

#### `.claude/project-preferences.md`
Stores auto-approved configuration:
```
Vertical Slice: Vacancies + Candidates ✅
Scenarios: 20 (8+12)
Mode: PLAN
Test Data: Auto-fixture
Permissions: Admin-only (Slice 1)
Defect Handling: Documented in fixtures
```

**Purpose:** 
- Record which recommendations were approved
- Reuse in future iterations
- Allow override if business changes

---

## 🎯 Benefits

### For Non-Technical Users
- ✅ Clear recommendation (no overwhelming choices)
- ✅ Simple approval (1 question vs. 5)
- ✅ Faster workflow (no decision paralysis)
- ✅ Rationale provided (understand why recommended)

### For Skill Developers
- ✅ Reduces support burden (fewer "which should I choose?" questions)
- ✅ Better UX (users don't feel lost)
- ✅ Faster iterations (no re-asking decisions)
- ✅ Data-driven recommendations (based on analysis, not guessing)

### For QA Automation Projects
- ✅ Best practices encoded (risk-driven prioritization)
- ✅ Incremental-friendly (small scopes by default)
- ✅ Reusable patterns (preferences saved)
- ✅ Consistent approach (same logic across projects)

---

## 🔄 Example: Recruitment Module

### Auto-Recommendation Applied

**Analysis:**
```
Modules Identified:
- 🔴 Vacancies (HIGH risk) — 8 scenarios
- 🔴 Candidates (HIGH risk) — 12 scenarios
- 🔴 Pipeline (HIGH risk) — 16 scenarios
- 🟡 Public Apply (MEDIUM risk) — 6 scenarios
- 🟡 Permissions (MEDIUM risk) — 4 scenarios

Constraints:
- Incremental: 1 test/cycle → need small slice
- Bootstrap: Framework just created → start small
- User: Non-technical → minimize decisions
```

**Recommendation:**
```
Vertical Slice 1: Vacancies + Candidates (20 scenarios)

Why:
✅ Foundational CRUD (before complex pipeline)
✅ HIGH risk first (both core modules)
✅ Manageable size (20 scenarios = 5-6 core tests/run)
✅ Clear progression (Pipeline → Public → Security next)

Exclude from Slice 1:
- Public Apply (secondary entry point → Slice 2)
- Pipeline (complex, needs CRUD baseline → Slice 2)
- Permissions (security testing separate → Slice 4)

Setup:
- Test Data: Auto-fixture (framework handles)
- Defect: Documented (HTTP 500 with invalid Hiring Manager)
```

**User Approval:**
```
🤖 RECOMMENDED SCOPE (Auto-Suggested)
├── Vacancies: 8 scenarios
├── Candidates: 12 scenarios
├── Exclude Public Apply (Slice 2)
├── Test Data: Auto-fixture
└── Total: 20 scenarios

Pick ONE:
[✅ YES] [⚠️ CUSTOM] [❓ QUESTIONS]
```

**Result:** User clicks YES → Preference saved → Move to Runtime Discovery

---

## 🚀 Rolling Out Auto-Recommendations

### Deployment Checklist

- [x] Update `generate-application-test-plan/SKILL.md` (Bước 2)
- [x] Update `qa-full-pipeline/SKILL.md` (Scope Checkpoint)
- [x] Create `.claude/project-preferences.md` template
- [x] Document strategy in `docs/guides/auto-recommendation-strategy.md`
- [ ] Test with real non-technical user (next iteration)
- [ ] Gather feedback on clarity & usability
- [ ] Adjust recommendations if needed

### Future Enhancements

1. **Machine Learning Preferences:**
   - Track which recommendations users override
   - Adjust future recommendations based on patterns

2. **Context-Aware Recommendations:**
   - Different defaults for different project types
   - Adjust based on team size, experience level

3. **Automated Scope Validation:**
   - Check if recommended scope is feasible
   - Warn if scope might be too large/small

4. **Cross-Project Learning:**
   - Share lessons learned across projects
   - Common anti-patterns & best practices

---

## 📚 When to Use Auto-Recommendations

### ✅ ALWAYS Use Auto-Recommendations When

- User is non-technical or new to QA automation
- Project has clear risk analysis
- Multiple valid options but one is "best practice"
- Reducing decision fatigue would speed up workflow
- Similar decision made before (can reuse preference)

### ⚠️ ALLOW Override When

- User has specific business requirements
- Project is unique (doesn't fit standard patterns)
- User explicitly says "I want to do it differently"
- Previous recommendation didn't work (iterate)

### ❌ DON'T Force Auto-Recommendations When

- User is expert QA engineer (let them decide)
- Project has non-standard constraints
- Risk analysis is incomplete or unclear
- User keeps overriding (listen to feedback)

---

## 💡 Key Principle

> **Better to recommend well and allow override than to overwhelm users with choices.**

Non-technical users need **guidance**, not options. If they disagree with the recommendation, they can override. But by default, make the decision for them based on best practices.

---

## 📝 References

- `.claude/skills/generate-application-test-plan/SKILL.md` — Plan skill with auto-recommendations
- `.claude/skills/qa-full-pipeline/SKILL.md` — Orchestrator with auto-recommendation gates
- `.claude/project-preferences.md` — Example saved preferences
- `docs/planning/recruitment-test-plan.md` — Test plan with approved scope

---

**Strategy Status:** ✅ IMPLEMENTED IN SKILLS

Next: Deploy and gather user feedback on UX improvement.
