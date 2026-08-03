# Test Plan: Recruitment Module

## 1. Overview

This test plan covers the OrangeHRM Recruitment module, including vacancy management, candidate management, public job applications, candidate pipeline stage actions, and role-based access control.

The source of truth is [requirements-analysis.md](/C:/Users/ThinkPad/Downloads/ai%20agent/proj-1-qa-automation-refactored/proj-1/qa-automation/recruitment-module/requirements-analysis.md). The most important known issue in the source is the Hiring Manager-related HTTP 500 defect on specific pipeline actions when a vacancy has no Hiring Manager.

## 2. Test Objectives

- Verify that vacancy CRUD behaves as documented.
- Verify that candidate CRUD behaves as documented.
- Verify that the public apply flow works without authentication.
- Verify all candidate pipeline status transitions and allowed actions.
- Verify role-based access control for Admin and ESS.
- Verify field validation, attachment validation, delete flows, and date display behavior.
- Verify the documented defect does not invalidate normal test data usage.

## 3. Scope

### 3.1 In Scope

| Area | Coverage Reference | Notes |
|---|---|---|
| Vacancy list | REC-101 | Filters, columns, and omitted UI elements |
| Create vacancy | REC-102 | Required fields, uniqueness, Hiring Manager lookup, Number of Positions validation, publish toggles |
| Edit vacancy and attachments | REC-103 | Attachment dialog and 1 MB limit |
| Delete vacancy | REC-104 | Permanent delete and deleted vacancy reference behavior |
| Candidate list | REC-201 | Filters, columns, and row actions |
| Delete candidate | REC-202 | Permanent delete flow |
| Add candidate internal | REC-203 | Required fields, email format, resume validation, date defaults |
| View candidate profile | REC-204 | Application stage, profile, and history sections |
| Edit candidate profile | REC-205 | Editable fields and Save-only behavior |
| Public job list | REC-301 | Published vacancies and Apply action |
| Public apply form | REC-302 | Required resume and no extra fields |
| Stage actions | REC-401 to REC-408 | All status transitions and forms |
| Role access | REC-501 to REC-502 | Admin vs ESS access control |

### 3.2 Out of Scope

- Dashboard or reporting behavior
- Kanban board behavior
- Reject Reason dropdown
- Custom questions on public apply form
- Paste-text resume input on public apply form
- Slot remaining or hired count on public job list
- Duplicate candidate email validation
- Interview schedule overlap validation
- Blocking vacancy deletion when candidates exist
- Locking Job Title when a vacancy already has linked candidates
- Cancel button on Edit Candidate Profile
- Hiring Manager and Interviewer as system roles

## 4. Test Approach

The plan uses a mixed approach:

- UI automation with Playwright and TypeScript for stable end-to-end coverage.
- Manual verification only where UI behavior is simple and low value for automation, or where exploratory confirmation of the documented defect is needed.
- Negative and boundary testing for validation, file constraints, and required fields.
- State-based testing for candidate pipeline transitions.
- Role-based testing for Admin and ESS.

Execution will prioritize high-risk flows first:

1. Access control
2. Vacancy creation and the Hiring Manager rule
3. Candidate creation and resume validation
4. Pipeline transitions
5. Public apply flow
6. Deletion and history verification

The test approach should explicitly avoid using a vacancy without a Hiring Manager except for the defect reproduction case. That defect is not normal expected behavior.

## 5. Test Coverage Areas

### 5.1 Vacancy management

| Coverage | Type | Priority | Automation Recommendation |
|---|---|---:|---|
| Vacancy list filters and columns | Positive UI | High | Automate |
| Missing Total Candidates / View Candidates UI | Negative UI | Medium | Automate |
| Create vacancy required fields | Positive/negative | High | Automate |
| Vacancy Name uniqueness | Negative | High | Automate |
| Hiring Manager autocomplete and Invalid message | Negative | High | Automate |
| Number of Positions boundary validation | Boundary | High | Automate |
| Publish RSS/Web toggles and generated URLs | Positive UI | Medium | Automate |
| Edit vacancy attachment upload | Positive/negative | Medium | Automate |
| Attachment file size limit | Boundary | High | Automate |
| Vacancy deletion confirmation and permanent delete | Positive/negative | High | Automate |
| Linked candidate shows `(Deleted)` after vacancy deletion | Integration/UI | High | Automate |

### 5.2 Candidate management

| Coverage | Type | Priority | Automation Recommendation |
|---|---|---:|---|
| Candidate list filters and columns | Positive UI | Medium | Automate |
| Candidate creation required fields and email format | Positive/negative | High | Automate |
| Duplicate candidate email allowed | Negative control | Medium | Automate |
| Resume optional on internal form | Positive | Medium | Automate |
| Resume file type and 1 MB limit on internal form | Boundary | High | Automate |
| Immediate client-side validation on resume selection | UI behavior | High | Automate |
| Candidate profile sections and history layout | Positive UI | Medium | Automate |
| Edit candidate profile Save-only behavior | Positive UI | Medium | Automate |
| Candidate deletion permanent delete | Positive/negative | High | Automate |

### 5.3 Public apply flow

| Coverage | Type | Priority | Automation Recommendation |
|---|---|---:|---|
| Public jobs list visibility without login | Access/UI | High | Automate |
| Only published vacancies appear | Positive/negative | High | Automate |
| Public form fields and Back/Submit buttons | Positive UI | High | Automate |
| Resume required on public form | Negative | High | Automate |
| Public form resume file validation | Boundary | High | Automate |
| No custom questions or paste-text resume area | Negative UI | Medium | Automate |

### 5.4 Pipeline and state transitions

| Coverage | Type | Priority | Automation Recommendation |
|---|---|---:|---|
| Allowed actions per status | State-based | High | Automate |
| Terminal behavior for Rejected and Hired | State-based | High | Automate |
| Offer Declined and Interview Failed still allow Reject | State-based | High | Automate |
| Schedule Interview required fields | Positive/negative | High | Automate |
| Schedule Interview overlap allowed | Negative control | Medium | Automate |
| Candidate history entries for pipeline events | Integration/UI | High | Automate |
| Hiring Manager defect reproduction on missing Hiring Manager vacancy | Defect reproduction | High | Manual and optional automation evidence capture |

### 5.5 Access control

| Coverage | Type | Priority | Automation Recommendation |
|---|---|---:|---|
| Admin has full Recruitment access | Positive access | High | Automate |
| ESS menu-level block | Negative access | High | Automate |
| ESS direct route block with `Credential Required` | Negative access | High | Automate |

## 6. Test Environment and Browser Coverage

### Environment

- OrangeHRM OS Demo environment
- Recruitment behavior verified on OS 5.9
- Public routes available for unauthenticated access checks

### Browser coverage

| Browser | Coverage | Notes |
|---|---|---|
| Chromium | Required | Primary automation browser |
| Firefox | Recommended | Secondary regression browser |
| WebKit | Optional | Only if the project regression scope requires it |

### Execution notes

- Use the same environment for UI and network response verification when possible.
- Reuse browser storage states for authenticated Admin and ESS roles.
- Reset or isolate test data between runs because delete actions are permanent.

## 7. Test Data and Account Requirements

### Accounts

| Account | Purpose | Required |
|---|---|---|
| Admin | Full Recruitment testing | Yes |
| ESS | Access control testing | Yes |
| Anonymous user | Public job list and public apply form | Yes |

### Test data

| Data | Purpose | Required |
|---|---|---|
| At least one job title | Create vacancy | Yes |
| At least one employee for Hiring Manager | Create vacancy and stage actions | Yes |
| At least one employee for Interviewer | Schedule interview | Yes |
| Published vacancy with valid Hiring Manager | Main pipeline coverage | Yes |
| Vacancy without Hiring Manager | Defect reproduction only | Yes |
| Existing candidate linked to a vacancy | Delete vacancy and profile behavior | Yes |
| File samples within and over 1 MB | Attachment and resume validation | Yes |
| Allowed and disallowed resume file types | File validation | Yes |

### Data handling

- Use dedicated test records for permanent delete scenarios.
- Do not use the missing-Hiring-Manager defect record for standard pipeline regression.
- Keep one published vacancy available for the public apply flow.

## 8. Dependencies

| Dependency | Impact | Mitigation |
|---|---|---|
| Employee master data | Required for Hiring Manager and Interviewer selection | Confirm fixture data exists before execution |
| Job Titles master data | Required for vacancy creation | Seed or select an existing valid title |
| Authentication roles | Required for Admin and ESS coverage | Prepare separate sessions or storage states |
| Network stability | Needed for response verification and defect evidence | Re-run only if transient transport failure is suspected |
| Known 500 defect on missing Hiring Manager vacancy | Can invalidate pipeline runs if wrong data is used | Use valid vacancy data for standard runs |

## 9. Risks and Mitigation

| Risk | Impact | Priority | Mitigation |
|---|---|---:|---|
| Hiring Manager-related HTTP 500 defect | High: can cause false failures on pipeline actions | High | Use only valid vacancy data except for the dedicated defect case |
| Permanent delete behavior | High: test data cannot be restored | High | Use isolated fixtures and cleanup-aware execution |
| Client-side resume validation | Medium: network-only checks miss failures | High | Assert UI state immediately after file selection |
| Non-standard date format | Medium: easy to assert incorrectly | Medium | Use explicit format checks for `yyyy-dd-mm` |
| Different resume requiredness between internal and public forms | Medium: can create incorrect shared assertions | High | Split test logic by entry point |
| Allowed interview overlap | Low to Medium: may be mistaken for defect | Medium | Treat as expected unless product changes |

## 10. Priority and Execution Order

### Priority 1

- ESS access control
- Vacancy creation
- Vacancy Name uniqueness
- Hiring Manager autocomplete validation
- Number of Positions validation
- Candidate internal create validation
- Resume file validation

### Priority 2

- Candidate profile view and edit
- Vacancy attachments
- Vacancy deletion and deleted vacancy display
- Public job list visibility
- Public apply form validation

### Priority 3

- Full pipeline state transitions
- Candidate history verification
- Schedule interview overlap allowed behavior
- Missing Hiring Manager defect reproduction

## 11. Automation and Manual Testing Recommendation

| Area | Recommendation | Reason |
|---|---|---|
| Vacancy CRUD | Automate | Core regression flow with stable UI and clear assertions |
| Candidate CRUD | Automate | High-value repeatable validation and data handling |
| Public apply form | Automate | Important customer-facing flow with deterministic checks |
| Pipeline transitions | Automate | State-based coverage benefits from repeatability |
| Access control | Automate | Fast regression signal with simple pass/fail criteria |
| Known 500 defect reproduction | Manual plus evidence capture | It is a defect reproduction case, not a stable acceptance path |
| Exploratory smoke around layout/text | Manual | Useful for quick visual confirmation, but not the main regression target |

## 12. Entry Criteria

- Requirements analysis is approved and available.
- Test environment is reachable.
- Admin and ESS accounts are available.
- Required master data exists for employee and job title lookups.
- Test files for resume and attachment validation are prepared.
- The team agrees to exclude the missing-Hiring-Manager defect record from normal regression runs.

## 13. Exit Criteria

- All high-priority coverage areas pass or are triaged with clear defects.
- No unresolved blocker remains on access control, vacancy creation, candidate creation, or critical pipeline transitions.
- Known defect evidence is captured if the missing-Hiring-Manager issue is revalidated.
- Test data cleanup is complete or documented.
- Test results are shared with QA, BA/BSE, development, and PO stakeholders.

## 14. Assumptions and Open Questions

| Code | Question | Testing Impact |
|---|---|---|
| AMB-01 | Is Vacancy Name uniqueness case-sensitive or case-insensitive? | Could change expected duplicate behavior |
| AMB-02 | Are Number of Positions validation messages split by invalid type and range, or shared? | Affects exact assertion strategy |
| AMB-03 | What are the default toggle states for Active and Publish in RSS Feed and Web Page? | Impacts create-form baseline checks |
| AMB-04 | Is `yyyy-dd-mm` the only expected display format across all views? | Impacts date assertions in list, detail, and history views |
| AMB-05 | Can candidate history ever omit an event description during partial failures? | Impacts robustness of history checks |

Assumptions:

- The requirements analysis remains the authoritative source for scope and validation messages.
- The documented defect remains outside expected product behavior.
- Playwright with TypeScript is the target automation stack.

## 15. Deliverables

- `qa-automation/recruitment-module/test-plan.md`
- Optional follow-up test cases after plan approval
- Automation-ready coverage map for Playwright implementation
- Risk summary and execution priority list

