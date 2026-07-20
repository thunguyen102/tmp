# Project Preferences - Recruitment Module Automation

**Project**: OrangeHRM Recruitment Module (OS 5.9)
**Date Saved**: 2026-07-21
**Version**: 1.0

---

## Scope Preference (Auto-Saved)

| Aspect | Choice | Rationale | Date Approved |
|--------|--------|-----------|---------------|
| **Vertical Slice** | Candidate Recruitment Pipeline | Focus on core P1/P2 scenarios: CRUD candidate, vacancy setup, 8 pipeline actions | 2026-07-21 |
| **Scenarios Count** | 22-24 automated cases | Manageable for incremental approach (1 case/cycle = 5-6 work days) | 2026-07-21 |
| **Included Modules** | Candidate Management, Vacancy Setup, Pipeline Actions | High-risk modules, end-to-end recruitment flow | 2026-07-21 |
| **Excluded Modules** | Public Apply Form, Permissions | Deferred to Slice 2 (separate guest/security testing) | 2026-07-21 |
| **Automation Mode** | PLAN (Test scenarios, ready for implementation) | Framework exists, test plan comprehensive, ready to code | 2026-07-21 |
| **Framework** | Playwright + TypeScript (POM pattern) | Decided in Stage 1 Bootstrap | 2026-07-21 |
| **Test Data Setup** | Traceable auto-generated (auto_recruitment_timestamp_random) | Unique, identifiable in DB logs | 2026-07-21 |
| **Scope Checkpoint** | ✅ APPROVED | User confirmed recommendation via YES | 2026-07-21 |

---

## Auto-Recommendations Used ✅

| Recommendation | Status | Notes |
|---|---|---|
| Start with Candidate + Pipeline (HIGH risk) instead of Public Form | ✅ Approved | Covers core business logic end-to-end |
| Scope 22-26 scenarios for first slice | ✅ Approved | Incremental-friendly, manageable daily velocity |
| Defer Permissions & Public Form to Slice 2 | ✅ Approved | Separate concern (security + guest access) |
| Use Playwright + TypeScript (from Stage 1) | ✅ Approved | Framework already bootstrapped |

---

## Reuse for Future Invocations

**When running Stage 2+ (next iteration)**:
1. ✅ Use saved "Candidate Recruitment Pipeline" scope (don't re-ask)
2. ✅ Use same framework settings (Playwright + TypeScript + POM)
3. ✅ Use same test data format (auto_recruitment_*)
4. ⚠️ Allow override: "Use different scope this time?" (yes/no)

---

**Status**: ✅ Preferences Saved
**Ready for**: Stage 3 Scope Checkpoint or Stage 4 Runtime Discovery
