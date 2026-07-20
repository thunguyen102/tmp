---
name: qa-full-pipeline
description: >
  Orchestrate the complete AI-assisted QA automation lifecycle from repository
  inspection and scope planning through runtime discovery, incremental code
  generation, failure triage, workflow promotion, and regression.
---

# QA Full Pipeline

## Role

This is a thin orchestrator that routes work through specialized skills and project AI-OS.

**It does NOT duplicate detailed planning, selector, implementation, or debugging rules** — instead, it:
- Detects project state (framework exists? tests exist? tests passing?)
- Invokes the correct skill for the current stage
- Enforces checkpoints and quality gates
- Tracks artifacts and execution results
- Routes triage findings to remediation skills

## Quick Start Guide

| Your Situation | Action |
|---|---|
| "I have no automation framework yet" | `/qa-full-pipeline` → Detects → Invokes `generate-automation-framework` |
| "Framework exists, but no test plans" | `/qa-full-pipeline` → Detects → Invokes `generate-application-test-plan` (FULL discovery, not skeleton) |
| "I have test plans, ready to automate" | `/qa-full-pipeline` → Detects → Invokes `generate-automation-from-ui-flow` or `generate-automation-from-testcases` with `--incremental` (1 case at a time) |
| "Tests are failing — help triage" | `/qa-full-pipeline` → Detects → Invokes `flaky-test-analyzer` if during final regression; otherwise routes to `ui-debug-agent` + `smart-locator-agent` for root cause |
| "Locators are broken, fix them" | `/qa-full-pipeline` → Stage 7 Triage → Auto-invokes `locator-healer-agent` OR direct `/locator-healer-agent` |

## Startup

1. Inspect the target repository.
2. Read `.claude/rules/` and project configuration when present.
3. Detect the correct starting stage based on current state.
4. State the starting stage and reason in simple language.
5. Immediately invoke the matching skill from Starting-Stage Detection in this same turn. Do not stop after step 4 to wait for the user to ask again or to type the next command manually — announcing the stage and invoking the skill happen together, in one continuous action.

The only points where this pipeline pauses for the user are the ones explicitly listed under "Stop Conditions", the "Scope Checkpoint — Mandatory Human Gate" below, and the single location question defined in `generate-automation-framework` step 0 (a new path, or explicit confirmation to bootstrap in place — only asked when the current directory is the skill's own release package, not a target project). Naming a skill under Starting-Stage Detection is a direct instruction to run it now, not a suggestion to relay back to the user.

## Stages (13-Stage Incremental Workflow)

```text
1. Bootstrap              — Scaffold framework foundation
2. Plan                   — Discover app, create full test plan
3. Scope Checkpoint       — User approves scope (GATE)
4. Runtime Discovery      — Inspect real DOM, verify app, collect locators (GATE)
5. Select Vertical Slice  — Pick 1-3 features to automate first
6. Implement First Case   — Code 1 test case (not all), run immediately
7. Run & Verify           — MUST PASS before expanding
8. Expand Slice           — Add next case (only if previous PASS)
9. Promote Workflow       — Reusable components, page objects
10. Slice Regression      — Full regression on completed slice
11. Next Slice            — Repeat stages 5-10 for next feature
12. Full Regression       — All slices green
13. Completion Report     — Final artifacts, test metrics
```

⚠️ **CRITICAL: Stage 6 Must Be Incremental** — NOT batch implementation of all cases

## Starting-Stage Detection

### Bootstrap

Start here when the repository lacks a usable automation framework foundation or AI-OS.

Invoke now, in this same turn:

```text
generate-automation-framework
```

This scaffolds a complete Playwright framework with POM structure, base classes, configurations, and CI/CD templates.

### Plan

Start here when the framework exists but confirmed test plans do not.

Invoke now, in this same turn:

```text
generate-application-test-plan
```

This discovers the application, maps features, and generates **COMPLETE test plan** with all scenarios in professional checkpoint format.

⚠️ **REQUIRED:** Plan must include all test cases for the chosen vertical slice, not just P1/P2 skeleton.

### Runtime Discovery

Start here after scope is approved and BEFORE implementation begins.

**Mandatory gate:** The application and all UI flows must be verified on real browser before any test code generation.

Process:
1. Open real browser to target URL (use `ui-debug-agent` if needed)
2. Navigate through all major user flows in the vertical slice
3. Collect actual DOM locators for every interactive element
4. Verify each locator works (click, type, assert) with `smart-locator-agent`
5. Document any blocking issues (CAPTCHA, VPN-required, 2FA)
6. Capture baseline screenshots

**Only proceed to Stage 5 (Implement) after this is complete.**

### Implement (Incremental, Single Case at a Time — Feature-Scoped)

Start here when scope is confirmed, runtime discovery complete, and you are ready to automate.

**CRITICAL RULE:** Implement ONE test case at a time (within ONE feature), run immediately, verify PASS before moving to next case.

**Prerequisite Checks (MUST ALL BE YES):**
- ✅ Runtime discovery completed? (UI inspected, locators verified, app accessible)
- ✅ Test case list provided? (Markdown/Excel/JSON with structured format)
- ✅ Vertical slice scoped? (1-2 features, ~15-25 scenarios total max)

**Use this skill with incremental + feature-scoped mode:**

```bash
# If file has >15 cases, skill auto-recommends feature, asks approval
/generate-automation-from-testcases \
  --file=test-cases.md \
  --incremental

# OR manually specify feature + case
/generate-automation-from-testcases \
  --file=test-cases.md \
  --incremental \
  --feature=Authentication \
  --current-case=TC01
```

**Smart Behavior (Auto):**
- Detects if file has >15 test cases
- Groups by feature/module automatically
- Recommends HIGH-risk feature first (3-option approval)
- Loads only cases for chosen feature (avoid requirement overload)
- Implements 1 case at a time within feature
- After feature completes → Asks: "Next feature?"

**Incremental Enforcement (Feature-Scoped):**
- ✅ ONLY 1 feature per cycle
- ✅ ONLY 1 test case per invocation (within feature)
- ✅ Test runs immediately after code generation
- ✅ PASS (1 run enough for incremental) → Move to next case
- ✅ FAIL (after 5 retries) → STOP, investigate, do NOT skip automatically
- ✅ Each case PASS gates the next case
- ✅ Feature complete → Ask: "Next feature?"

**Expected Flow (Multi-Feature Incremental):**
```
FEATURE 1: Authentication (12 cases)
├─ TC01 → Generate → Run → PASS
├─ TC02 → Generate → Run → PASS
├─ TC03 → Generate → Run → PASS
└─ ... TC12 → PASS
   ↓
[Feature 1 Regression: All 12 cases together] → All PASS ✅
   ↓
Ask user: "Feature 2: User Profile (8 cases) next?"
   ↓

FEATURE 2: User Profile (8 cases)
├─ TC13 → Generate → Run → PASS
├─ TC14 → Generate → Run → PASS
└─ ... TC20 → PASS
   ↓
[Feature 2 Regression: All 8 cases together] → All PASS ✅
   ↓
[FULL REGRESSION: All 20 cases together] → All PASS ✅
```

**If incremental flag missing:**
- Skill will ask: "Implement 1 case (incremental) or all cases (batch)?"
- ALWAYS choose: 1 case at a time
- If user requests "all" → Skill must refuse and explain why

**Alternative (Single Flow per Invocation):**

```bash
/generate-automation-from-ui-flow
```

Use when you need to record live UI interactions. **Note:** One flow per invocation. Repeat for each flow in vertical slice.

### Triage

Start here when the request concerns an existing unstable test.

Invoke now, in this same turn:

```text
flaky-test-analyzer
```

This analyzes test failures, identifies root causes (locator issues, timing, data state, etc.), and routes to remediation.

### Locator Repair

Start here (as a hop from an in-progress Triage) when `flaky-test-analyzer`'s
classification identifies the root cause as a locator problem.

Invoke now, in this same turn:

```text
locator-healer-agent
```

This inspects the current DOM, verifies/repairs broken locators, and updates test code automatically.

## Supporting Skills (Auto-Used During Pipeline)

These skills are automatically invoked by the pipeline for specialized support:

| Skill | Purpose | When Auto-Used |
|---|---|---|
| `smart-locator-agent` | Generate robust, semantic locators from DOM inspection | During runtime discovery & locator repair |
| `ui-debug-agent` | Inspect live DOM, screenshot, analyze element structure | During runtime discovery & failure diagnosis |
| `qa-automation-engineer` | General automation engineering guidance & best practices | For architecture/design questions during implementation |
| `test-data-generator` | Create unique, traceable test data (emails, usernames, etc.) | Integrated into test generation workflows |
| `locator-healer-agent` | Auto-repair broken locators in existing test code | Routed from Stage 7 failure triage |

**Note:** Deprecated skills removed to reduce token waste:
- ❌ `generate-testcases-from-requirements` → Use `generate-application-test-plan` instead (FULL discovery, not skeleton)
- ❌ `generate-manual-testcases-rbt` → Use `generate-application-test-plan` instead (automated discovery)
- ❌ `generate-locator` → Use `smart-locator-agent` instead (more robust)

## Skills Ecosystem Map

```
┌──────────────────────────────────────────────────────────┐
│         QA Full Pipeline (Orchestrator)                  │
│   Detects stage → Routes to correct skill → Validates   │
└─────────────────────┬──────────────────────────────────┘
                      │
       ┌──────────────┼──────────────┬─────────────┐
       ▼              ▼              ▼             ▼
   Bootstrap       Plan          Generate      Triage/Fix
       │              │              │             │
       ├─►─────────┬──├─►─────────┬──├─►────────┬──├─►──────┐
       │ Gen Auto  │  │ Gen App   │  │ Gen Auto │  │ Flaky  │
       │ Framework │  │ Test Plan │  │ from UI/ │  │ Test   │
       │           │  │ (FULL)    │  │TestCase  │  │Analyzer│
       │           │  │           │  │ (Incr)   │  │        │
       │           │  │           │  │          │  │        │
       │           │  │           │  └────┬─────┘  └───┬────┘
       │           │  │           │       │            │
       │           │  │           │  ┌────▼─────┐      │
       │           │  │           │  │ UI Debug  │      │
       │           │  │           │  │ Smart Loc │      │
       │           │  │           └─►│ QA Eng    │◄─────┘
       │           │  │              │ Test Data │
       │           │  │              │ Locator   │
       │           │  │              │ Healer    │
       │           │  │              └───────────┘
       │           │  │
       └─►─────────┴──┴──────────► (Framework Ready + Plan Approved)
                                  ↓
                         (Incremental Execution Loop)
                         ├─ Runtime Discovery
                         ├─ Implement Slice (1 case/loop)
                         ├─ Test & Auto-Heal
                         ├─ Expand Slice (PASS gates next)
                         ├─ Promote Workflows
                         ├─ Slice Regression
                         └─ Repeat for Next Slice
                                  ↓
                         (Full Regression & Report)
```

## Scope Checkpoint — Mandatory Gate #1 (Auto-Recommend Strategy)

After `generate-application-test-plan` completes:

### 🤖 Auto-Recommendation Strategy (NOT 5 Binary Questions)

**Analysis phase:**
- Evaluate risk levels (🔴 HIGH risk modules first)
- Analyze incremental constraints (1 test/cycle = small scope needed)
- Assess project maturity (bootstrap → start small)
- Consider user profile (assume non-technical, minimize decisions)

**Recommend best scope:**
- Select 1-2 HIGH risk modules (15-25 scenarios ideal)
- Exclude secondary/low-priority modules (add in later slices)
- Recommend first vertical slice size (~20 scenarios = 5-6 core tests)
- Provide clear rationale for each recommendation

### ⏸️ Present Checkpoint to User (3-Option Approval, Not Binary Questions)

**Format: Simple approval, NOT asking "what modules?" or "include X?"**

```markdown
## 🤖 RECOMMENDED SCOPE (Auto-Suggested)

Based on: [Risk Analysis], [Incremental Approach], [Project Stage]

### Recommended Vertical Slice: [Slice Name]
- ✅ [Module 1]: [scenarios] scenarios — [Brief reason]
- ✅ [Module 2]: [scenarios] scenarios — [Brief reason]
- ✅ [Decision 1]: [Approach] — [Brief reason]
- ✅ [Decision 2]: [Approach] — [Brief reason]

**Total: [X] scenarios, [Effort estimate]**

---

### Quick Approval (Pick ONE):
- ✅ **YES** → Accept recommendation, proceed to Runtime Discovery
- ⚠️ **CUSTOM** → Tell me what to change
- ❓ **QUESTIONS** → Ask about specific decisions

**Default (if no response):** Proceed with recommendation automatically
```

**Key Principles:**
- ✅ Recommend based on analysis (don't make user decide)
- ✅ 3-option approval (YES/CUSTOM/QUESTIONS), not 5+ binary choices
- ✅ Reduce decision fatigue (users often non-technical)
- ✅ Allow override but don't re-explain unnecessarily
- ✅ Use smart defaults (small scope, HIGH risk first)

### 💾 Save Preference for Reuse

After user approves:
1. Store choice in `.claude/project-preferences.md`
2. Future iterations: Check preferences, reuse scope (don't re-ask)
3. Allow override: "Use different scope this time?"

**User confirmation still mandatory,** but simplified from 5 questions to 1 approval question.

---

## Runtime Discovery Checkpoint — Mandatory Gate #2

After runtime discovery phase completes:

Verify and report:

- ✅ Application is accessible (no VPN/firewall blocks)
- ✅ Login flow works (if required)
- ✅ All major user flows are executable
- ✅ All interactive elements have verified locators
- ⚠️ Any blocking issues (CAPTCHA, 2FA, dynamic content)
- 📸 Baseline screenshots captured

**Stop and confirm with user:** "App verified and ready for automation?"

If NO → Return to Runtime Discovery to fix blockers.
If YES → Proceed to Stage 5 (Implement) with confidence.

## Incremental Execution Rule — CRITICAL

After both scope and runtime discovery checkpoints are approved:

**The ONLY valid approach is 1 test case at a time.**

### ❌ ANTI-PATTERN: Batch Implementation (Causes the Loop)
```
❌ WRONG:
  Input: 50 test cases (5 features)
  → Dump all 50 cases on user
  → User overwhelmed by requirement load
  → Generate code for all 50 at once
  → Run all 50
  → Result: ~70% fail
  → All failures → Triage (misclassified as "flaky")
  → Endless loop trying to fix "flaky" when code is unverified
```

### ✅ PATTERN: Feature-Scoped Incremental (1 Feature → 1 Case at a Time)
```
✅ CORRECT:
  Input: 50 test cases ÷ 5 features
  
  Step 0: Detect large scope, group by feature, ask user approval:
    "Which feature first: Authentication (12), User Profile (8), ...?"
    → User picks 1 → Proceed with that feature only
  
  LOOP for each feature:
    INNER LOOP for each case in feature:
      Step 1: Implement TEST CASE #1 (code generation)
      Step 2: Run immediately (headed mode)
      Step 3: Result?
              ├─ PASS → Mark done, proceed to case #2
              ├─ FAIL → Stop execution immediately
              │         ├─ Open browser → inspect DOM
              │         ├─ Verify expected locators exist
              │         ├─ Fix code (locator or logic)
              │         ├─ Re-run until PASS
              │         └─ Then proceed to case #2
              │         
              └─ AFTER 5 retry attempts and still fail:
                ├─ Document blocker
                ├─ Ask user: skip this case or fix app?
                └─ Proceed to next case (mark as blocked)
    
    Feature regression: Run all cases in feature together
    
  Step 4: Feature complete → Ask: "Next feature?"
  Step 5: If user says YES → Show remaining features, repeat LOOP
          If user says NO → Mark feature done, wait for next invocation
  
  Final: All features PASS → Full regression (all cases together)
```

**Benefit of Feature-Scoped Incremental:**
- 🎯 Only ~15 cases shown at a time (instead of 50+)
- 📊 Clear progress per feature (not overwhelmed by full requirement)
- 🔄 Reusable components across same feature (POM, data, workflows)
- ✅ Each feature is a milestone (feature PASS gates next feature)
- 🚀 Demo-friendly (can ship 1-2 features early)

### Rules (Enforcement)

1. **Max 1 new test case per run cycle** — Generate & execute immediately
2. **No batch generation of all test cases** — Always incremental, 1 case at a time
3. **Large requirement handling** — If >15 cases total:
   - Group by feature/module
   - Ask user: "Which feature first?"
   - Implement that feature only (don't load all)
   - After feature PASS → Ask: "Next feature?"
4. **Fail = Stop** — Do not continue expanding slice if current case fails
   - Debug immediately
   - Fix root cause (not "flaky fix")
   - Verify fix on real browser
   - Only then continue
5. **Runtime discovery prerequisite** — No implementation starts without verified DOM
6. **Status tracking** — Update artifact with per-case + per-feature status (implement → run → result → next)

### Prevents Loop

This approach prevents the "infinite flaky fix" loop because:
- ✅ Each case is verified on real UI before code generation
- ✅ Failures are caught immediately (not batch)
- ✅ Root cause is addressed (locator/logic), not misclassified as "flaky"
- ✅ Each PASS gates the next case
- ✅ No scenario where 20 cases fail → Triage → Loop forever

## Runtime Tool Decision

Do not force MCP.

Follow the project's runtime decision:

- existing test for full behavior;
- short Playwright probe for one narrow runtime fact;
- interactive browser or MCP for an unknown application;
- source code for stable attributes and behavior explanation.

Use the cheapest reliable evidence.

## Progress Reporting (Consolidated Status File)

**Instead of creating multiple checkpoint files** (`stage4-checkpoint.md`, `stage5-checkpoint.md`, etc.), maintain **single consolidated status file**:

**File:** `docs/planning/_pipeline-status.md`

**Structure:**
```markdown
# QA Pipeline Status

Last Updated: [timestamp]
Current Stage: [stage number & name]
Overall Progress: [XX%]

---

## Stage History (Append-only)

### Stage 1: Bootstrap — ✅ COMPLETE
- Date: 2026-07-20 10:15 AM
- Result: Framework scaffolded
- Files: src/ structure ready
- Next: Stage 2

### Stage 2: Plan — ✅ COMPLETE
- Date: 2026-07-20 10:45 AM
- Result: Test plan created (30 scenarios)
- File: recruitment-test-plan.md
- Next: Stage 3

### Stage 3: Scope Checkpoint — ✅ APPROVED
- Date: 2026-07-20 11:00 AM
- User Decision: YES (Authentication feature first)
- Scope: 12 test cases
- Next: Stage 4

### Stage 4: Runtime Discovery — ✅ COMPLETE
- Date: 2026-07-20 11:30 AM
- Result: Locators verified, app accessible
- File: locator-collection.md
- Issues: None
- Next: Stage 5

### Stage 5: Implementation (TC01) — ✅ PASS
- Date: 2026-07-20 12:00 PM
- Test: TC01 - Login with valid credentials
- Result: PASS (1/1 run)
- Files: login.page.ts, login.spec.ts
- Next: TC02

...

---

## Current Status
- ✅ Completed Stages: 1, 2, 3, 4
- ⏳ In Progress: Stage 5 (TC02)
- ⏳ Pending: Stage 5 (TC03-TC12), Stages 6-13
- 🚫 Blocked: None
```

**Benefits:**
- ✅ Single file to track entire pipeline (not scattered across 6 files)
- ✅ Append-only history (easy audit trail)
- ✅ Cleaner repo (only 1 status doc)
- ✅ Easy to share (1 URL instead of multiple checkpoint files)

**Auto-Maintenance:**
- Skill auto-appends to this file at each stage
- Old checkpoint files deleted after consolidation
- Task artifact still tracks detailed per-case status (for implementation detail)
- `_pipeline-status.md` is high-level summary (for human review)

## Stop Conditions (Hard Gates)

**STOP IMMEDIATELY when:**

1. **Scope confirmation is pending** — Cannot proceed without user approval of test plan
2. **Runtime discovery is incomplete** — Cannot generate code until real DOM verified
3. **Application is inaccessible** — Network, VPN, authentication, firewall blocks
4. **Business behavior is ambiguous** — Test case expected result conflicts with app behavior
5. **First test case fails with unknown cause** — Do not expand slice until root cause found & fixed
6. **5 retry attempts exhausted on single case** — Blocker or app defect; escalate to user
7. **Credentials or permissions unavailable** — Cannot authenticate to application
8. **Authentication is unstable** — Login sometimes fails, sometimes succeeds (true environmental flaky)
9. **Cleanup is unsafe** — Cannot rollback test data (e.g., no DB access, no reset API)
10. **Batch implementation detected** — If skill generates multiple test cases at once instead of incremental, STOP and re-invoke with `--incremental` flag
11. **Triage misclassification** — If test fails and flaky-test-analyzer routes to "locator repair" but root cause is "code never verified on real UI", STOP and return to Runtime Discovery
12. **Scope gap detected** — If Stage 2 test plan shows 20 cases but Stage 3 only implements 5, STOP and clarify why implementation is incomplete

**Never describe a stopped pipeline as completed.**

These gates prevent the "infinite loop" condition where batch failures get misclassified as flaky and create remediation loops.

## Key Implementation Notes

### Stage 4: Runtime Discovery (Mandatory Before Any Code)

Before any test code generation:

1. **Use `ui-debug-agent`** to interactively inspect target application DOM
2. **Execute all major user flows** on real browser (don't just inspect, actually interact)
3. **Use `smart-locator-agent`** to generate robust, semantic locators from actual DOM
4. **Verify each locator works** by attempting to interact (click, type, assert) 
5. **Capture actual element attributes** — do not guess or reuse old selectors
6. **Document all blocking issues** (CAPTCHA, 2FA, dynamic content, VPN walls)
7. **Take baseline screenshots** at key states

**Gate:** Must pass user approval before moving to Stage 5 Implement.

### Stage 5-6: Incremental Code Generation & Validation

**Per test case:**

1. **Generate code for 1 case only** (not all cases, not batch)
2. **Run immediately** (headed mode, visible browser)
3. **Verify PASS before next case**
4. **If FAIL:**
   - **First check:** Is this root cause known from Runtime Discovery?
   - **If NO:** Reopen browser, inspect DOM again, verify locators still exist
   - **If locator invalid:** Regenerate with `smart-locator-agent`
   - **Fix code and re-run** (max 5 attempts per case)
5. **Only after PASS:** Generate next case

Rules:
- **POM Pattern:** Separate locators from test logic
- **Smart Waits:** Use framework auto-waiting (no hardcoded sleeps)
- **Test Independence:** Each test standalone
- **Unique Data:** Use `test-data-generator` for traceable IDs
- **Assertions:** Clear messages, verified on real UI

### Stage 7: Failure Triage & Root Cause Classification

**⚠️ CRITICAL WORKFLOW:**

```
Scenario A: TEST FAIL during Implementation (Bước 6)
├─ Status: Single test case during incremental implementation
├─ Root cause: Almost always unverified code/locators
├─ Action:
│  ├─ DO NOT → flaky-test-analyzer (wrong stage!)
│  ├─ DO: Exploit available skills
│  │  ├─ ui-debug-agent → Inspect actual DOM
│  │  ├─ smart-locator-agent → Generate stable locators
│  │  └─ locator-healer-agent → Fix in code
│  └─ Re-run same test until PASS
│
└─ Result: Test PASS or blocked (move to next case)

Scenario B: TEST FAIL during Final Regression (after all impl PASS)
├─ Status: All test cases implemented & individually PASS
├─ Now running: Full regression (all cases together)
├─ Failure: Intermittent or consistent
├─ Action:
│  ├─ First check: Is it true flaky? (pass once, fail once, pass once?)
│  ├─ If YES → Route to: flaky-test-analyzer
│  └─ If NO → Root cause (timing, data, state)
│     └─ Route to: ui-debug-agent or smart-locator-agent
│
└─ Result: Fixed and passing for ship
```

**Key Rule: When to Use Each Skill**

```
❌ NEVER use flaky-test-analyzer for:
   ├─ Individual test fail during implementation
   ├─ Unverified code (locators not checked on real UI)
   ├─ First-time failures (too early to classify as flaky)
   └─ Development stage (only final regression)

✅ USE flaky-test-analyzer ONLY when:
   ├─ All test cases individually PASS
   ├─ Full regression run happens
   ├─ Test fails intermittently (Scenario B)
   └─ True flaky (not unverified code)

✅ ALWAYS USE first for implementation fails:
   ├─ ui-debug-agent → Inspect actual state
   ├─ smart-locator-agent → Generate/verify locators
   ├─ locator-healer-agent → Auto-fix broken locators
   └─ data-generator → Re-generate test data

Result: Find root cause, not assume flaky
```

**Decision Tree for Test Failure:**

```
Test fails:
├─ Q: Is this during implementation (individual test)?
│  └─ YES → Use skills to fix (ui-debug, locator, data)
│
└─ Q: Is this during final regression (all tests together)?
   ├─ Q: Does it fail every time?
   │  └─ YES → Root cause issue (not flaky) → Use skills to fix
   │
   └─ Q: Does it fail intermittently (sometimes pass, sometimes fail)?
      └─ YES → Use flaky-test-analyzer (true flaky detected)
```

## Final Output (Consolidated File Structure)

The pipeline must leave professional artifacts without checkpoint clutter:

```text
docs/planning/
├── _pipeline-status.md          ← SINGLE status file (append history, no stage-specific files)
├── recruitment-test-plan.md     ← Main test plan
├── locator-collection.md        ← Locator reference
├── implementation-summary.md    ← Framework summary (one-time)
└── (NO stage4-checkpoint.md, NO stage5-checkpoint.md, NO completion-summary.md ❌)

src/
├── pages/                       ← POM classes
├── tests/                       ← Test files (per feature, not per stage)
├── fixtures/
├── utils/
└── constants/

test-results/                   ← Optional, per-run execution reports
├── run-2026-07-20-120000/
│   ├── results.html
│   └── screenshots/
└── run-2026-07-20-130000/
```

**Key Changes:**
- ❌ **REMOVE:** Multiple checkpoint files (stage4, stage5, completion-summary)
- ✅ **KEEP:** Single `_pipeline-status.md` (append-only history)
- ✅ **KEEP:** Core docs (test plan, locator collection, implementation summary)
- ✅ **KEEP:** Source code (pages, tests, fixtures, utils)

The final completion report must include:

- **Confirmed scope** — features, test cases, coverage matrix
- **Test plan coverage** — scenarios per feature, vertical slice breakdown
- **Implemented and passing cases** — count, execution time, coverage %
- **Blocked or excluded cases** — reason, workaround (if any)
- **Known defects** — environmental issues, app bugs, automation blockers
- **Generated and modified files** — framework files, test code, configurations
- **Runtime evidence** — test execution screenshots, logs, reports (HTML/Allure/etc.)
- **Promoted workflows** — reusable base classes, utilities, data generators
- **Validation commands** — how to re-run all tests locally and in CI/CD
- **Slice and full-regression results** — pass/fail/skip breakdown per slice
- **Remaining risk** — features not yet automated, edge cases not covered

## Completion Gate

The pipeline is complete **only when ALL conditions are met** (per project QA standards):

### Gate Conditions

1. ✅ **Scope checkpoint approved** — User confirmed test plan scope (all features + priorities)
2. ✅ **Runtime discovery completed** — Real browser verified, locators collected, app accessible
3. ✅ **Incremental implementation used** — 1 feature at a time, 1 case per invocation
4. ✅ **First feature 100% green** — ALL cases in feature PASS at least once (incremental, not batch)
5. ✅ **Feature scoping applied** — Large requirement (>15 cases) grouped by feature, user chose 1 feature
6. ✅ **NO batch failures misclassified** — Failures investigated at root cause, not routed to flaky-fix
7. ✅ **Professional artifacts organized**:
   - Test cases per feature (with locators, expected results)
   - Page objects (verified, reusable, feature-aware)
   - Test code (incremental per feature, all passing)
   - Test reports per feature (HTML/Allure with screenshots)
   - Locator collection per feature (reference for next feature)
8. ✅ **Reusable workflows documented** — Base classes, utilities, data generators for this feature (ready for next)
9. ✅ **Feature regression passes** — All cases in feature green together
10. ✅ **Zero unverified implementation** — Every line of code tested on real UI
11. ✅ **Next feature ready or done** — If more features pending, pipeline paused awaiting user "Next feature?" approval

### Anti-Patterns That Fail This Gate

❌ **Batch generation of all test cases** → Marked incomplete
❌ **Code never run on real UI** → Marked incomplete
❌ **Failures misrouted to "flaky fix"** → Marked incomplete
❌ **Skip cases silently** → Marked incomplete (document as blocked instead)
❌ **Use of guessed locators** → Marked incomplete

**Generated code without passing runtime execution is NOT complete.**

Stop and escalate if any gate condition cannot be met due to app unavailability, environmental issues, or permission constraints.
