# ⚡ QA Orchestrator — 5-Minute Quick Start

## Prerequisites

- Node.js >= 18.x
- npm latest
- Internet connection (access to target app)

## Step 1: Install Dependencies (2 min)

```bash
npm install
```

## Step 2: Install Playwright Browsers (3 min)

```bash
npx playwright install chromium
```

## Step 3: Run Orchestrator (10 min)

```bash
npx ts-node .claude/orchestrator/orchestrator.ts
```

## What Happens

```
📦 Stage 1: Bootstrap (minimal structure, NO templates)
🔍 Stage 2: App Discovery (real browser, collect locators)
📋 Stage 3: Test Plan (from discovered pages)
✓ Stage 4: Scope Checkpoint (you approve)
🤖 Stage 5-6: Implementation + Regression (auto)
📊 Stage 7: Report & Complete
```

## Expected Output

```
src/pages/recruitment/
  ├─ vacancy-list.page.ts          (real locators)
  ├─ add-vacancy.page.ts
  └─ ...

src/tests/recruitment/
  ├─ TC001.spec.ts                 (real test code)
  ├─ TC002.spec.ts
  └─ ...

src/config/locators.manifest.json   (discovered elements)

playwright-report/                  (test results)
```

## Configuration

Edit `.claude/orchestrator/orchestrator.ts` (bottom):

```typescript
const config = {
  scope: 'recruitment',  // Change scope here
  appUrl: 'https://...',
  features: ['vacancy-crud', 'candidate-crud'],
  // ... more options
};
```

## After Orchestrator

```bash
# View tests
ls src/tests/recruitment/

# Run tests manually
npx playwright test --headed

# View report
npx playwright show-report
```

## Troubleshooting

| Issue | Fix |
|---|---|
| `ts-node: command not found` | `npm install -D ts-node @types/node` |
| `Playwright not found` | `npx playwright install` |
| Cannot access app URL | Check internet, firewall, app running |
| Tests fail after gen | Fix test logic, re-run orchestrator |

## Next

Run orchestrator now:

```bash
npx ts-node .claude/orchestrator/orchestrator.ts
```

**~10 minutes → Full QA suite ready** ✅
