---
name: qa-generate-test-plan
description: Creates a clear English test plan for a web application from requirements, a URL, a user story, or a UI flow. Uses Playwright and TypeScript as the default automation stack.
---

# QA Generate Test Plan

## When to Use

Use this skill after requirement analysis, or when the user provides enough information to plan testing for a web feature.

Accepted input includes:

- `qa-automation/<feature-slug>/requirements-analysis.md`
- A requirement document or user story
- A Jira ticket or exported Jira content
- A web application URL
- A described UI flow

If `requirements-analysis.md` already exists, use it as the main input. Do not ask the user to provide the same information again.

## Goal

Create a concise but complete test plan that QA, BSE/BA, developers, and PO can review. The plan must explain what will be tested, what will not be tested, the main risks, priorities, test approach, test data needs, and whether each area is suitable for automation or manual testing.

This skill creates a test plan. It does not create detailed test cases or Playwright test code.

## Default Test Standard

- Target: web applications only.
- Default automation stack: Playwright with TypeScript.
- Stay within Playwright-supported browser and UI testing unless the input clearly requires related API setup or verification.
- Do not assume unsupported tools, environments, data, roles, or business rules.

## Workflow

1. Read the available input and identify the feature, users or roles, business goal, acceptance criteria, dependencies, and open questions.
2. Use `requirements-analysis.md` as the source of truth when it exists. Keep its ambiguity and risk codes so the artifacts remain traceable.
3. Define in-scope and out-of-scope items. Do not hide unclear items; record them under Assumptions and Open Questions.
4. Define test objectives and the test approach for the main user flows, negative behavior, field validation, permissions, state changes, integration points, and error handling when applicable.
5. Identify environment, browser, account, role, test data, dependency, and cleanup needs.
6. List risks with impact, priority, and mitigation.
7. Recommend automation or manual testing for each area and give a short reason.
8. Define entry criteria, exit criteria, and the expected test deliverables.
9. Save the artifact during the current run. Do not start a background job or stop after saying that generation is in progress.

## Output Structure

Save the result as `qa-automation/<feature-slug>/test-plan.md`.

```markdown
# Test Plan: [Ticket ID or Feature Name]

## 1. Overview
## 2. Test Objectives
## 3. Scope
### 3.1 In Scope
### 3.2 Out of Scope
## 4. Test Approach
## 5. Test Coverage Areas
## 6. Test Environment and Browser Coverage
## 7. Test Data and Account Requirements
## 8. Dependencies
## 9. Risks and Mitigation
## 10. Priority and Execution Order
## 11. Automation and Manual Testing Recommendation
## 12. Entry Criteria
## 13. Exit Criteria
## 14. Assumptions and Open Questions
## 15. Deliverables
```

Use tables where they make scope, coverage, risk, priority, or automation decisions easier to review. Keep each item linked to an acceptance criterion or requirement when an ID is available.

## Mandatory Rules

- Write the complete test plan in clear English and Markdown.
- Use common technical words and direct sentences that QA, BSE/BA, developers, and PO can understand.
- Keep the plan specific to the supplied feature; do not add generic sections with no useful content.
- Do not turn the plan into a detailed list of test cases.
- Do not invent business rules, validation messages, test data, or environment details.
- Record missing information under Assumptions and Open Questions, including its possible testing impact.
- Include positive, negative, boundary, edge, permission, and state-based coverage only when relevant to the feature.
- Save the artifact; do not return only a chat summary.

## Completion Report and Handoff

After saving the file, report:

- The path to `test-plan.md`
- A short summary of scope
- The highest risks
- The proposed execution priorities

Then ask: "The test plan is complete. Would you like me to generate the test cases now?"

If the user agrees, run `qa-generate-testcases` with the new `test-plan.md` and the related `requirements-analysis.md` when available.
