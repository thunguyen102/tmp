# 🎯 QA Orchestrator — Autonomous Pipeline

**Location:** `.claude/orchestrator/`

## What It Does

Orchestrator = Unified autonomous agent that orchestrates entire QA automation lifecycle in single execution:

```
npx ts-node .claude/orchestrator/orchestrator.ts
  ↓
Stage 1: Bootstrap (minimal)
  ↓
Stage 2: App Discovery (real browser)
  ↓
Stage 3: Test Plan (from discovery)
  ↓
Stage 4: Scope Checkpoint [USER APPROVAL]
  ↓
Stage 5-6: Implementation + Regression
  ↓
Stage 7: Report & Complete

RESULT: Fully automated QA suite in ~10 minutes
```

## 3 Problems Solved

| Problem | Solution |
|---|---|
| **Template files = junk** | Generate ONLY with real data from browser |
| **Manual locator collection** | Auto-open browser, extract locators to manifest |
| **Skills called separately** | All 7 stages chained autonomously |

## Quick Start

```bash
# Run from project root:
npx ts-node .claude/orchestrator/orchestrator.ts
```

**Expected output:**
- `src/pages/recruitment/*.page.ts` — Real locators
- `src/tests/recruitment/*.spec.ts` — Real test code
- `src/config/locators.manifest.json` — Discovered elements
- `playwright-report/` — Test results

## Files

- `orchestrator.ts` — Main agent (450+ lines, 7 stages)
- `README.md` — This file
- `quick-start.md` — 5-minute setup guide

## Configuration

Edit bottom of `orchestrator.ts`:

```typescript
const config: OrchestratorConfig = {
  scope: 'recruitment',  // or 'general'
  appUrl: 'https://...',
  features: ['vacancy-crud', 'candidate-crud', 'candidate-pipeline'],
  projectName: 'recruitment-automation',
  cicd: true,
  reporting: 'both',     // 'html' | 'allure' | 'both'
  parallel: true,
};
```

## Key Features

✅ **Zero Template Files** — Generate only with real data
✅ **Live Browser Discovery** — Auto-collect locators
✅ **Autonomous Chain** — All stages flow automatically
✅ **Single Manual Gate** — Only scope approval
✅ **10 Min Execution** — Complete pipeline
✅ **Real Data** — Discover → Generate → Test

## Timeline

| Stage | Time | What Happens |
|---|---|---|
| 1 | 30s | Bootstrap (dirs + config) |
| 2 | 2m | Auto-discover app (browser) |
| 3 | 1m | Generate test plan |
| 4 | 1m | User approves scope |
| 5-6 | 3-5m | Implement + test loop |
| 7 | 1m | Regression + reports |
| **Total** | **~10m** | **Full suite ready** |

## Integration

To integrate with qa-full-pipeline, invoke orchestrator in Stage 1:

```typescript
// In qa-full-pipeline:
if (mode === 'autonomous') {
  await orchestrate(config);  // Replaces all 7 skills
}
```

## Troubleshooting

**ts-node not found:**
```bash
npm install -D ts-node @types/node
```

**Playwright not installed:**
```bash
npx playwright install chromium
```

**Cannot access app:**
- Check internet & firewall
- Verify appUrl in config
- Check app is running

**Tests fail:**
- Review generated test code
- Fix test logic (not "flaky")
- Re-run orchestrator

## Next Steps

1. Run orchestrator: `npx ts-node .claude/orchestrator/orchestrator.ts`
2. Review generated files in `src/`
3. Run tests manually: `npx playwright test --headed`
4. Next slice: adjust config + re-run

---

**Orchestrator v1.0** — Autonomous end-to-end QA automation pipeline for Recruitment Module (extensible to other scopes)
