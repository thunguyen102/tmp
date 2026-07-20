# .claude/tools — Utility Scripts

Utility scripts for QA automation discovery, validation, and orchestration.

## Files

- **`stage4-discovery.ts`** — Runtime discovery script (TypeScript)
- **`stage4-discovery.js`** — Runtime discovery script (CommonJS/Node.js)
- **`validate-test-plan.cjs`** — Test plan validation utility
- **`tsconfig.json`** — TypeScript configuration for tools

## Setup

### 1. Install Dependencies

```bash
npm install
```

Required packages:
- `@playwright/test` — Browser automation
- `dotenv` — Environment variable loading
- `@types/node` — TypeScript Node.js types (dev)
- `ts-node` — TypeScript execution (dev)

### 2. Configure Environment

Create or update `.env` file in project root:

```bash
cp .env.example .env
```

Then edit `.env` with your credentials:

```env
APP_BASE_URL=https://your-app-url.com
APP_ADMIN_USERNAME=your_username
APP_ADMIN_PASSWORD=your_password
```

## Running Scripts

### Stage 4: Runtime Discovery (TypeScript)

```bash
npx ts-node .claude/tools/stage4-discovery.ts
```

**Output:**
- Opens browser (headed mode)
- Logs into app using APP_ADMIN_USERNAME / APP_ADMIN_PASSWORD
- Navigates through Recruitment module
- Collects element locators
- Saves results to `docs/planning/stage4-locators.json`

### Stage 4: Runtime Discovery (Node.js)

```bash
node .claude/tools/stage4-discovery.js
```

**Same as TypeScript version** — choose based on your environment.

### Validate Test Plan

```bash
node .claude/tools/validate-test-plan.cjs docs/planning/recruitment-test-plan.md
```

## Environment Variables

All scripts use environment variables (NO hardcoded credentials):

| Variable | Purpose | Example |
|----------|---------|---------|
| `APP_BASE_URL` | Application URL | `https://app.example.com` |
| `APP_ADMIN_USERNAME` | Admin login username | `admin` |
| `APP_ADMIN_PASSWORD` | Admin login password | `SecurePass@123` |
| `BROWSER` | Playwright browser | `chromium`, `firefox`, `webkit` |
| `HEADLESS` | Run headless (optional) | `true` or `false` |

## TypeScript Configuration

**`tsconfig.json`** in this directory:
- Supports Node.js types (`"types": ["node"]`)
- Includes Playwright types (`@playwright/test`)
- Configured for standalone execution with ts-node

Main `tsconfig.json` (project root) compiles `src/` only.

## Troubleshooting

### "Cannot find module 'dotenv'"

```bash
npm install dotenv
```

### "ts-node: command not found"

```bash
npm install -D ts-node @types/node
```

### "Missing required environment variable: APP_BASE_URL"

Ensure `.env` file exists with `APP_BASE_URL=...`

```bash
cat .env  # Verify file exists
```

### Browser won't open / Script hangs

- Check internet connection
- Verify `APP_BASE_URL` is correct
- Ensure Playwright browsers installed:
  ```bash
  npx playwright install chromium
  ```

### Login fails

- Verify `APP_ADMIN_USERNAME` and `APP_ADMIN_PASSWORD` are correct in `.env`
- Check if app is running
- Check if app URL is accessible: `curl APP_BASE_URL`

## Next Steps

After running discovery:

1. Review collected locators: `cat docs/planning/stage4-locators.json`
2. Validate test plan: `node .claude/tools/validate-test-plan.cjs ...`
3. Run orchestrator: `npx ts-node .claude/orchestrator/orchestrator.ts`

---

**Status**: ✅ All scripts use environment variables (NO hardcoded credentials)
