---
name: qa-explore-real-ui
description: Opens and explores a supplied web application URL in a real browser, installs or falls back between Playwright MCP and Playwright CLI when needed, and saves verified UI evidence for QA requirements, test plans, and test cases. Use whenever a relevant URL is supplied, documentation is incomplete or conflicts with the UI, exact UI behavior is required, or existing QA artifacts lack current verified UI evidence.
---

# QA Explore Real UI

## Goal

Explore the target feature through a real browser and save observable evidence. Never replace browser execution with memory, search results, documentation, or assumptions.

Read [`references/browser_bootstrap.md`](./references/browser_bootstrap.md) before selecting or installing browser tooling.

## Trigger Rules

Run real UI exploration when any condition is true:

- A relevant application URL is supplied directly or appears inside a document, Jira ticket, comment, or existing QA artifact.
- The request names a web feature but the requirements are missing, incomplete, ambiguous, or conflicting.
- Exact fields, options, messages, permissions, validation, navigation, or state behavior are needed.
- Existing artifacts have no `VERIFIED` evidence for the same feature and environment, or the evidence may be stale or incomplete.

Reuse one current `VERIFIED` evidence artifact across the requirements -> plan -> test-cases chain. Rerun when the target environment or feature differs, coverage is missing, the UI may have changed, or the prior status is `BLOCKED`.

Do not run only for document-only work with no reachable target UI, non-web features, or editorial reformatting that introduces no factual UI claim.

## Workflow

1. Resolve the target URL, feature path, allowed account source, and output feature slug from the request and workspace.
2. Bootstrap a working browser by following `browser_bootstrap.md`. Act autonomously: inspect, install, configure, run, and request system approval when required. Never ask the user to execute commands, install tools, open DevTools, click through the UI, or collect screenshots.
3. Open the application in a real browser. Navigate from the supplied entry point to the requested feature instead of loading only a guessed deep link.
4. Inspect all relevant visible states: navigation, fields, controls, options, tables, filters, validation, dialogs, success/error feedback, pagination, permissions, and state changes.
5. Use unique disposable data for safe create/update flows. Do not delete or corrupt shared records. Record any destructive or privileged path that cannot be exercised safely.
6. Run an ambiguity-closure pass. For every unknown needed downstream, attempt to resolve it through reachable UI states, control options, safe boundary inputs, validation triggers, reversible state changes, existing artifacts, and observable requests/responses. Retry with a stable locator or alternate safe path when one attempt fails.
7. Stop exploring an item only when it is verified, unsafe/destructive, blocked by access or credentials, or is business intent that cannot be observed from the product. Record the evidence or exact blocker.
8. Capture enough evidence to reproduce observations: final URLs, exact labels/messages, screenshots, and a Playwright trace or equivalent execution log when supported.
9. Keep the feature root review-friendly. Save `ui-evidence.md` at `qa-automation/<feature-slug>/`; save raw screenshots, traces, JSON, text, and runtime logs under `logs/evidence/`; save temporary exploration scripts under `logs/scripts/`.

## Evidence Artifact

Use this structure:

```markdown
# Real UI Evidence: [Feature]

## Status
VERIFIED | BLOCKED

## Environment and Tooling
## Navigation and Roles
## Observed UI Inventory
## Observed Rules and Messages
## Exercised Flows
## Evidence Files
## Blockers and Unverified Areas
```

For each observation, state the page/state, action, observable result, and evidence file when available.

## Mandatory Rules

- Treat real browser execution as mandatory when a relevant URL is supplied.
- Do not produce `VERIFIED` from HTML fetched without browser execution, public documentation, search results, screenshots alone, or prior product knowledge.
- Do not guess fields, options, messages, permissions, validations, or business rules.
- Do not ask the user about an observable UI fact. Explore and resolve it first.
- Do not treat one failed locator, one failed script, or an untested safe path as an unresolved product question.
- Ask only when progress requires unavailable access/credentials, approval for a risky action, or non-observable business intent. The human reviewer performs final confirmation, not routine discovery.
- Do not stop because the preferred MCP is absent or broken. Continue through the bootstrap fallback until a real browser runs or all executable routes have a concrete blocker.
- Do not delegate setup or browser interaction to the user. Request approval only when the environment requires authorization, then continue automatically after approval.
- Do not expose passwords, tokens, cookies, or secret values in artifacts, logs, screenshots, or chat.
- Keep only review artifacts such as requirements, test plans, test cases, and `ui-evidence.md` in the feature root. Never leave temporary `.mjs` scripts or raw browser output there.
- Mark `BLOCKED` only after recording attempted MCP and CLI routes plus the exact technical or access blocker. Missing credentials may block authenticated areas, but explore every reachable state first.
- A blocked artifact must separate observed facts from unverified areas. Never promote an unverified claim into downstream requirements or test expectations.

## Handoff

Return the evidence artifact to the calling QA skill. `qa-gather-test-requirements` converts verified observations into requirements; planning and test-case skills use it only to validate their source material.
