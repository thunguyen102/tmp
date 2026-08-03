# Test Plan: Recruitment > Vacancies

## 1. Overview
This test plan covers the OrangeHRM Recruitment > Vacancies feature. The feature lets a user view vacancies, filter the vacancy list, open the add-vacancy form, and submit a new vacancy.

The plan is based on the saved requirements analysis and verified live UI evidence from the OrangeHRM demo application.

## 2. Test Objectives
- Verify that the Vacancies page is reachable from Recruitment.
- Verify that the list page shows the expected filters, table, record count, and row actions.
- Verify that the Add Vacancy form contains the expected fields and default states.
- Verify required-field validation on blank submit.
- Verify that dynamic controls behave as expected for Job Title and Hiring Manager.
- Identify data-driven and environment-dependent behaviors that could affect automation stability.

## 3. Scope

### 3.1 In Scope
- Navigation to `Recruitment > Vacancies`
- Vacancies list page
- Search and reset controls on the list page
- Add Vacancy form
- Default state of form controls
- Required-field validation
- Job Title dropdown behavior
- Hiring Manager autocomplete behavior
- Read-only RSS/Web page URLs shown on the form

### 3.2 Out of Scope
- Full create/edit/delete lifecycle verification
- Permission matrix by role
- Back-end RSS publication behavior
- Database-level verification
- API-level contract testing

## 4. Test Approach
Test the feature in layers:

1. Start with navigation and page rendering.
2. Validate the list page controls and table layout.
3. Validate the Add Vacancy form fields and defaults.
4. Run negative validation checks for missing required fields.
5. Verify dynamic data selection for Job Title and Hiring Manager.
6. Record any data dependencies or environment-specific differences that affect repeatability.

Use Playwright with TypeScript as the default automation stack for stable UI flows. Keep manual checks for behavior that depends on live seeded data or requires exploratory verification of row actions.

## 5. Test Coverage Areas

| Area | What to verify | Type |
|---|---|---|
| Navigation | User can open Vacancies from Recruitment | Automated |
| List page rendering | Filters, table columns, record count, and action icons are visible | Automated |
| Search/reset | Search applies filters and Reset clears them | Automated |
| Add form entry | Add Vacancy opens from the list page | Automated |
| Form structure | All expected fields, checkboxes, URLs, and buttons are present | Automated |
| Default states | Active and RSS/Web page toggles are checked by default | Automated |
| Required validation | Blank submit shows `Required` for Vacancy Name, Job Title, and Hiring Manager | Automated |
| Optional field behavior | Number of Positions does not block blank submit in the verified UI state | Automated |
| Job Title selection | Dropdown opens and allows selection from live options | Automated |
| Hiring Manager selection | Typeahead/search control returns selectable results | Automated |
| Row actions | Action icons behave correctly for the displayed vacancy rows | Manual first, then automate after behavior is confirmed |
| Successful save path | A valid vacancy can be saved and appears in the list | Manual first, then automate if test data is stable |

## 6. Test Environment and Browser Coverage
- Target environment: OrangeHRM demo site
- Base URL: `https://opensource-demo.orangehrmlive.com/web/index.php/auth/login`
- Browser baseline: Chromium
- Automation baseline: Playwright 1.61.1 with TypeScript

Recommended browser coverage:

| Browser | Coverage | Reason |
|---|---|---|
| Chromium | Primary | Matches the verified browser run and is the fastest stable baseline |
| Firefox | Optional | Useful if the project later requires cross-browser validation |
| WebKit | Optional | Useful if the project later requires Safari-like coverage |

## 7. Test Data and Account Requirements
- Account: `Admin / admin123` was used for verified UI exploration.
- Additional account types were not verified and should not be assumed.
- Test data needs:
  - At least one unique vacancy name for any create/save flow
  - A stable job title value from the current master list
  - A valid hiring manager value from the current autocomplete data
  - Known filter values for list-page search coverage

Data notes:

| Data item | Requirement |
|---|---|
| Vacancy name | Must be unique to avoid collisions with seeded demo vacancies |
| Job title | Must exist in the live dropdown master data |
| Hiring manager | Must exist in the live autocomplete dataset |
| Status/filter values | Must be confirmed in the live environment before writing stable automation |

## 8. Dependencies
- OrangeHRM authentication must be available.
- Recruitment module must be enabled for the test account.
- Live job-title master data must be present.
- Live user data must be present for Hiring Manager autocomplete.
- Seeded vacancy data must remain available for list-page coverage.

## 9. Risks and Mitigation

| Risk | Impact | Priority | Mitigation |
|---|---|---|---|
| `Number of Positions` rules are unclear | Could miss validation defects or create unstable negative tests | Medium | Confirm expected data type and range before automating boundary checks |
| Hiring Manager results are data-driven | Test results may change when the environment data changes | High | Query and select values dynamically at runtime |
| Job Title list is environment-dependent | Hard-coded option checks may break | High | Enumerate current options during the test run instead of hard-coding the full list |
| Table action icons are unlabeled in the DOM | Edit/delete automation may be brittle | Medium | Confirm locator strategy after observing actual action behavior |
| Demo data changes over time | Search results and record counts may drift | Medium | Use unique test data and avoid strict dependence on seeded counts |
| Successful save path is unverified in this planning chain | Automation may miss downstream behavior | High | Run one manual or exploratory save flow before finalizing CRUD automation |

## 10. Priority and Execution Order

| Priority | Area | Reason |
|---|---|---|
| P1 | Navigation and list page rendering | This is the entry point for the feature and verifies the page is reachable |
| P1 | Add Vacancy form structure and required validation | Core functionality and highest regression value |
| P1 | Job Title and Hiring Manager selection | These are mandatory inputs with data-driven behavior |
| P2 | Search/reset coverage | Important for usability and data filtering |
| P2 | Row action behavior | Needed for CRUD completeness but not yet fully verified |
| P3 | Successful save and post-save list assertions | Depends on stable test data and may need exploratory confirmation first |

## 11. Automation and Manual Testing Recommendation

| Area | Recommendation | Why |
|---|---|---|
| Navigation | Automation | Stable and low maintenance |
| List page rendering | Automation | Deterministic UI checks |
| Search/reset | Automation | Good value for regression coverage |
| Form structure and defaults | Automation | Clear UI state checks |
| Required validation | Automation | Fast regression signal |
| Job Title dropdown | Automation | Live UI selection is observable and repeatable |
| Hiring Manager autocomplete | Automation with runtime data handling | Dynamic results require flexible locators and data selection |
| Row actions | Manual first | Need to confirm exact action meaning and confirmation behavior |
| Successful save flow | Manual first, then automation | Requires unique data and downstream verification |
| Boundary validation for numeric fields | Manual first | Business rule is still unclear for Number of Positions |

## 12. Entry Criteria
- `requirements-analysis.md` exists for Recruitment > Vacancies.
- `ui-evidence.md` is marked `VERIFIED`.
- The OrangeHRM demo environment is reachable.
- The test account is available.
- The team accepts the current open questions, especially around `Number of Positions` and Hiring Manager data.

## 13. Exit Criteria
- Navigation, list page, form structure, defaults, and required validation are covered.
- Search/reset behavior is covered.
- Job Title and Hiring Manager selection behavior is covered at least once against live data.
- High-priority risks are documented with mitigation.
- Open questions are carried forward into test cases or follow-up clarification.

## 14. Assumptions and Open Questions

### Assumptions
- The verified demo environment is the intended test target.
- Playwright with TypeScript is the default automation stack.
- The `Admin` account remains valid for this feature.

### Open Questions
| Code | Question | Testing impact |
|---|---|---|
| AMB-01 | Is `Number of Positions` numeric-only, and what are the valid min/max values? | Affects boundary and negative validation coverage |
| AMB-02 | What exact Hiring Manager values are valid in the current dataset? | Affects stable automation and test data selection |
| AMB-03 | What do the row action icons do exactly? | Affects CRUD automation scope and locator strategy |
| AMB-04 | What values are available in the Status filter? | Affects list-page filter coverage |

## 15. Deliverables
- `qa-automation/vacancies/test-plan.md`
- Existing supporting evidence:
  - `qa-automation/vacancies/requirements-analysis.md`
  - `qa-automation/vacancies/ui-evidence.md`
  - `qa-automation/vacancies/logs/evidence/*`
