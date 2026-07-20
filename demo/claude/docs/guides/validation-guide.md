# Test Plan Validation Guide

**Purpose**: Auto-validate test plan markdown files before delivery to end users.

Ensures all test plans meet structural, numerical, and consistency requirements.

---

## 📋 What Gets Validated

✅ **Traceability Matrix (## 5)**
- All TC-* IDs present and correctly formatted
- Module headings match between sections
- Priority keywords present (Critical, High, Medium, Low)

✅ **Module Map (## 2)**
- Module names match Traceability Matrix headings
- Claimed test case counts match actual rows
- Required columns present

✅ **Coverage Summary (## 6)**
- Priority counts match TC IDs listed
- No missing or extra test cases
- All priorities covered

✅ **Vertical Slices (## 7)**
- Slice names properly formatted `### Slice N (n cases)`
- **Cases:** line follows each slice heading
- All test cases assigned to exactly one slice
- Claimed counts match actual case lists

✅ **Grand Total Consistency**
- All mentions of total count match actual matrix size
- No stale figures left over from prior drafts

---

## 🚀 Quick Start

### Windows (PowerShell)

```powershell
powershell -ExecutionPolicy Bypass -File .claude/pre-delivery-check.ps1 -PlanFile "docs/planning/recruitment-test-plan.md"
```

### Linux/Mac (Bash)

```bash
bash .claude/pre-delivery-check.sh docs/planning/recruitment-test-plan.md
```

### Direct Node (All Platforms)

```bash
node .claude/tools/validate-test-plan.cjs docs/planning/recruitment-test-plan.md
```

---

## ✅ Success Output

```
✅ ALL CHECKS PASSED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Test plan is ready for delivery to end users!

✓ Module counts reconciled
✓ Priority distribution validated
✓ Slice coverage complete
✓ Total counts consistent

Exit code: 0 ✓
```

---

## ❌ Failure Output

```
❌ 2 VALIDATION ERROR(S):

1. Module Map row 'Candidate Management': Map claims 10, but matrix has 11 rows.

2. Coverage Summary 'Critical': Count says 24, but 27 IDs are listed.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  Fix errors and rerun validation before delivery.

Exit code: 1 ✗
```

---

## 🔧 Troubleshooting

### Error: "Found zero TC rows under ## 5"
**Cause**: Missing Traceability Matrix section  
**Fix**: Add `## 5. Traceability Matrix` with `### ModuleName` headings and TC-* rows

### Error: "Module Map row 'X' has no matching '### ...' heading"
**Cause**: Module name in section 2 doesn't match section 5 heading  
**Fix**: Use exact same module name in both places:
```
Section 2: | Candidate Management | ...
Section 5: ### Candidate Management
```

### Error: "Real case count is 41, but also restated as 29"
**Cause**: Stale number left over from prior draft  
**Fix**: Search for phrases like "29 test cases" and update to "41 test cases"

### Error: "Case(s) present in matrix but absent from EVERY slice"
**Cause**: Test case not assigned to any slice  
**Fix**: Add TC-ID to at least one Slice N **Cases:** line

---

## 📌 CI/CD Integration

### GitHub Actions

```yaml
name: Validate Test Plan

on:
  pull_request:
    paths:
      - 'docs/planning/*-test-plan.md'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: bash .claude/pre-delivery-check.sh docs/planning/recruitment-test-plan.md
```

### Local Pre-Commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

FILES=$(git diff --cached --name-only | grep 'test-plan.md$')
for FILE in $FILES; do
  bash .claude/pre-delivery-check.sh "$FILE" || exit 1
done
```

---

## 📚 Test Plan Format Reference

### Section 2: Module Map
```markdown
## 2. Module → Requirement Map

| Module | Description | Test Cases | Priority |
|--------|---|---|---|
| Candidate Management | ... | 10 | P1 |
| Vacancy Management | ... | 13 | P1 |
| Candidate Pipeline | ... | 18 | P1 |
| **TOTAL** | — | **41** | — |
```

### Section 5: Traceability Matrix
```markdown
## 5. Traceability Matrix

### Candidate Management

| TC ID | Title | Priority | Type |
|---|---|---|---|
| TC-C-001 | Add Candidate | Critical | Happy Path |
| TC-C-002 | Add without Email | Critical | Negative |
```

### Section 6: Coverage Summary
```markdown
## 6. Coverage Summary

| Priority | Count | Test Cases |
|---|---|---|
| 🔴 Critical | 27 | TC-C-001, TC-C-002, ... |
| 🟡 High | 12 | TC-C-007, ... |
| 🟢 Medium | 2 | TC-C-008, TC-V-013 |
| **TOTAL** | **41** | — |
```

### Section 7: Vertical Slices
```markdown
## 7. Vertical Slices

### Slice 1 - Core Pipeline (29 cases)
**Cases:** TC-C-001, TC-C-002, ..., TC-P-013

### Slice 2 - Extended Coverage (12 cases)
**Cases:** TC-C-008, TC-V-009, ...
```

---

## 🎯 Workflow for QA Engineers

1. **Create test plan** markdown following the format above
2. **Run validation** before sharing:
   ```bash
   node .claude/tools/validate-test-plan.cjs your-plan.md
   ```
3. **Fix any errors** reported by the script
4. **Rerun validation** until it passes
5. **Deliver** to stakeholders once ✅ PASSED

---

## 📞 Support

For validation issues or format questions:
- Check `VALIDATION-GUIDE.md` (this file)
- Review an example: `docs/planning/recruitment-test-plan.md`
- Examine the validation script: `.claude/tools/validate-test-plan.cjs`

---

**Last Updated**: 2026-07-21  
**Version**: 1.0  
**Status**: ✅ Production Ready
