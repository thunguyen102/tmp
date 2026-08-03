---
name: qa-generate-testcases
description: Creates clear English manual test cases from requirements or a test plan, with enough detail for later Playwright automation.
---

# QA Generate Test Cases

## When to Use

Use this skill to turn approved requirements or a test plan into manual test cases that can be reviewed by QA, BSE/BA, developers, and PO and later implemented with Playwright.

Preferred input, in order:

1. `qa-automation/<feature-slug>/test-plan.md`
2. `qa-automation/<feature-slug>/requirements-analysis.md`
3. A requirement document, Jira ticket, user story, URL, or UI flow

Use all related artifacts when they exist. Do not ask the user to provide the same information again.

## Working Mode

- Default to QUICK mode: complete the work in one run without long checkpoints.
- Write all test case content in English.
- Create test cases that are clear, specific, and ready for a later Playwright implementation.
- Do not switch to a full risk-based testing process unless the user asks for it.
- If the scope is too large or unclear, document focused assumptions and open questions. Do not silently guess.

## Workflow

1. Read and understand the supplied requirements and test plan. Use the existing files under `qa-automation/<feature-slug>/` as the main input when available.
2. Identify applicable coverage groups:
   - Happy paths
   - Negative paths
   - Boundary cases
   - Edge cases
   - Role and permission cases
   - State transition cases
   - Error and recovery cases
3. Apply suitable test design techniques:
   - Equivalence Partitioning (EP)
   - Boundary Value Analysis (BVA)
   - Decision Table for combined business rules
   - State Transition Testing for workflows and statuses
4. For forms and UI fields, create field-specific validation cases using [`references/field_validation_checklist.md`](./references/field_validation_checklist.md).
   - Do not apply every validation check to every field.
   - Do not combine independent field validations in one case when this makes the expected result unclear.
5. Create each test case with:
   - TC ID
   - Requirement or AC reference when available
   - Module
   - Test scenario or title
   - Preconditions
   - Test steps
   - Specific test data
   - Expected result
   - Priority
   - Automation suitability or note when useful
6. Save the cases as a standard Markdown table. If a case needs complex steps, use numbered steps with `<br>` inside the table cell or a detailed subsection linked to the TC ID.

## Output

Save the result as `qa-automation/<feature-slug>/test-cases.md`.

Start with a short summary and any assumptions or open questions, then use this table:

```markdown
| TC ID | Requirement / AC | Module | Test Scenario | Preconditions | Test Steps | Test Data | Expected Result | Priority |
|---|---|---|---|---|---|---|---|---|
```

If automation is blocked for some cases, add:

```markdown
## Automation Notes
```

State the affected TC IDs and the missing requirement, data, environment, access, or dependency.

## Test Case Rules

- Use specific test data, such as `test_login_01@domain.com`, instead of descriptions such as "a valid email."
- Include positive, negative, boundary, and edge cases that are relevant to the defined scope.
- Use one clear purpose per test case.
- Do not combine independent field validations when the result would be difficult to identify.
- Use the user's TC ID format when provided. Otherwise use `[PROJECT]_[MODULE]_TC_[NUMBER]`, for example `CRM_LOGIN_TC_001`.
- Make test steps and expected results detailed enough for later automation without another scope decision.
- Keep expected results observable. State the UI state, message, saved value, status change, or prevented action that must be verified.
- Do not invent exact validation messages when the requirement or real UI does not provide them. Mark the text as an open question and verify the observable behavior that is known.
- If a case cannot be automated because information, test data, environment, or access is missing, explain the reason under `Assumptions and Open Questions` or `Automation Notes`. Do not silently skip it.
- If the file becomes too large, split it into clearly named parts and state the coverage of each part.
- Write all artifact content in clear English and Markdown. Use common technical words that QA, BSE/BA, developers, and PO can understand.

## Required Difference: New Input Data vs. Existing Entity

Many automation failures happen because generated form input is confused with an entity that is assumed to exist before the test.

### New Input Data

Input data is entered or created during the test, such as an email, password, field value, or new record name.

- It may use a specific generated value, timestamp, or unique suffix.
- The test or setup creates it during the run.
- The case must explain where and how it is created when that affects the flow.

### Existing Entity or Precondition

An existing entity is a record that must already be present before the main test action, for example an order in `Shipped` status or a user with a specific role.

- Do not give an assumed entity a realistic fixed name or ID unless its existence was verified in the target environment.
- Use an explicit placeholder, such as `<entity-created-during-setup>`, when automation must create it.
- For any required non-default state, the precondition must describe the setup actions needed to create a new entity and move it to that state through supported UI actions.
- Do not reuse fixed records from a shared or demo environment unless the user confirms them or they were verified directly.
- A fixed entity may be referenced only when it was created earlier in the same controlled test chain or its existence and state were confirmed.

Example precondition:

> Setup: Create a new order through the UI and move it to `Shipped` using the real workflow. Store its generated ID as `<order-created-during-setup>`. Do not depend on a fixed order from the shared environment.

## Mandatory Rules

- Do not add cases outside the agreed scope.
- Do not hide requirement gaps or unsupported automation conditions.
- Do not claim that placeholder entities already exist.
- Do not generate Playwright code with this skill.
- Save `test-cases.md`; do not return only a chat summary.

## Completion Report

This is the final step in the current chain:

`qa-gather-test-requirements` -> `qa-generate-test-plan` -> `qa-generate-testcases`

After saving `test-cases.md`, report the file path, total test case count, priority summary, open questions, and automation blockers. Hand the artifact to the team. Playwright implementation belongs to a separate automation skill or phase.
