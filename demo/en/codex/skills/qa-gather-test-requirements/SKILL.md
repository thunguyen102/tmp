---
name: qa-gather-test-requirements
description: Analyzes requirements from Jira, documents, user stories, or a real website and creates a standard English requirements analysis for QA automation. Does not generate test cases.
---

# QA Gather Test Requirements

## When to Use

Use this skill when:

- The user provides a Jira ticket, `.doc`/`.md` file, or user story and asks for requirement analysis.
- The user provides a URL or web module and wants requirements built from the real UI because no document is available.
- The user wants to understand scope, acceptance criteria, and dependencies before creating a test plan or test cases.
- The user needs a list of unclear points to discuss with the PO or BA.

Do not generate test cases with this skill. After the requirements analysis is ready, use `qa-generate-test-plan`, followed by `qa-generate-testcases`.

## Choose an Input Mode

If the mode is not clear, ask: "Do you have a document or Jira ticket, or would you like me to explore the website directly?"

| Mode | Input | Action |
|---|---|---|
| **DOC** | `.doc`/`.md` file, exported Jira ticket, user story, mockup, or screenshot | Read and analyze the input by following the workflow below. |
| **WEBSITE** | URL or module description, with no source document | Use a browser tool or MCP to inspect the real DOM, forms, and user flows, then follow the same analysis workflow. |
| **JIRA-FETCH** | Issue key, project key, or JQL query | Run the fetch script described in [`references/jira_integration.md`](./references/jira_integration.md), then use the result as DOC input. |

If both a document and a URL are provided, use the document as the main source and use the website to verify details when needed.

## Workflow

### Step 1: Gather and Understand the Source

1. Read the requirement document or Jira ticket. Parse HTML when the ticket is exported as HTML. Record the ticket ID, type, priority, status, reporter, assignee, and sprint when available.
   - In WEBSITE mode, open the URL and inspect the layout, forms, fields, buttons, user flows, and error messages. Do not describe a field or rule that was not observed in the real UI.
2. Review mockups and screenshots for layout, components, and field details.
3. Read related or dependent tickets and summarize each dependency.
4. Read Jira comments because they may contain updated or additional requirements.

### Step 2: Extract the Core Information

- **Overview**: The purpose of the module or feature.
- **User Story**: "As a [role], I want to [action], so that [value]."
- **Scope**: The affected modules, pages, components, roles, and flows.
- **Acceptance Criteria**: Group each criterion by function and separate required behavior from optional behavior.
- **Field Specifications**: Create a table with Field Name, UI Type, Validation, and Notes. Include required/optional, minimum, maximum, format, default value, and allowed values when known. This is the main input for test data and automation design.
- **Business Rules and Validation Messages**: List each rule and the expected message for invalid input when specified.

### Step 3: Analyze Dependencies

Identify related tickets, features, services, roles, test data, and environment dependencies. Clearly mark whether each rule comes from the main requirement or a dependent source.

### Step 4: Find Ambiguities and Testing Risks

For each ambiguity, record:

- Code: `AMB-XX`
- Specific question
- Risk if it is not resolved
- Severity: High, Medium, or Low

Look for vague words such as "where applicable," "similar to," or "etc." Also check for missing validation rules, missing edge-case behavior, undefined settings or limits, conflicts between old and new requirements, and differences between the document, mockup, and real UI.

For each testing risk, record:

- Code: `RISK-XX`
- Risk name
- Description or impact
- Mitigation

### Step 5: Create the Artifact

Include the following when relevant:

- A state transition matrix for workflows with status changes.
- An acceptance criteria checklist grouped by function.
- The most important testing recommendations. These are recommendations, not test cases.

Save the result as `qa-automation/<feature-slug>/requirements-analysis.md`.

## Output Structure

```markdown
# Requirements Analysis: [Ticket ID or Module Name]

## 1. Overview
## 2. User Story
## 3. Scope
## 4. Acceptance Criteria - Detailed Analysis
## 5. Field Specifications
## 6. Business Rules and Validation Messages
## 7. Dependencies
## 8. Ambiguities and Testing Risks
## 9. State Transition Matrix (if applicable)
## 10. Acceptance Criteria Checklist
## 11. Testing Recommendations
```

## Mandatory Rules

- Do not generate test cases with this skill.
- Do not guess business logic. Add missing or unclear rules to the Ambiguities section.
- Do not skip Jira comments.
- Read related tickets when the acceptance criteria refer to them.
- In WEBSITE mode, inspect the real UI and do not infer fields or rules that were not observed.
- Record every difference found between the requirement, mockup, and real UI.
- Write all artifact content in clear English and Markdown.
- Use common technical words that QA, BSE/BA, developers, and PO can understand. Keep sentences direct and define uncommon terms when needed.
- Create and save the artifact; do not return only a chat summary.

## Handoff

After saving `qa-automation/<feature-slug>/requirements-analysis.md`, ask: "The requirements analysis is complete. Would you like me to generate the test plan now?"

If the user agrees, run `qa-generate-test-plan` with the new `requirements-analysis.md` as its main input.

For JIRA-FETCH mode, follow [`references/jira_integration.md`](./references/jira_integration.md) before starting the analysis.
