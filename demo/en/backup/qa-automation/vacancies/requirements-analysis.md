# Requirements Analysis: Recruitment > Vacancies

## 1. Overview
The Vacancies feature in OrangeHRM lets a user view existing job vacancies, filter the vacancy list, and create a new vacancy from the Recruitment module.

This analysis is based on verified live UI behavior from the OrangeHRM demo environment.

## 2. User Story
As a recruitment user, I want to view, search, and add vacancies, so that I can manage open job roles in the system.

## 3. Scope
In scope:

- Recruitment module navigation to the Vacancies page.
- Vacancies list page with filters, results table, and row actions.
- Add Vacancy form and its validation.

Out of scope for this analysis:

- Full create/edit/delete lifecycle verification.
- Permission matrix by role.
- Back-end publication behavior for RSS/Web page toggles.

## 4. Acceptance Criteria - Detailed Analysis

### 4.1 Vacancies list page
- The user can open `Recruitment > Vacancies` from the left navigation.
- The page shows a search/filter area with these controls:
  - Job Title
  - Vacancy
  - Hiring Manager
  - Status
  - Reset button
  - Search button
- The page shows a vacancy table with these columns:
  - Vacancy
  - Job Title
  - Hiring Manager
  - Status
  - Actions
- The page displays the record count for the current result set.

### 4.2 Search and filter behavior
- The filter area must support searching vacancies from the list page.
- Reset should clear the applied filters back to their default state.
- Search should refresh the table based on the current filter values.

### 4.3 Add Vacancy entry point
- The user can open the `Add Vacancy` form from the Vacancies list page.

### 4.4 Add Vacancy form
- The form must show these fields:
  - Vacancy Name
  - Job Title
  - Description
  - Hiring Manager
  - Number of Positions
  - Active
  - Publish in RSS Feed and Web Page
- The form must show read-only RSS and Web Page URLs.
- The form must provide `Cancel` and `Save` actions.

### 4.5 Required-field validation
- A blank save must show required-field errors for:
  - Vacancy Name
  - Job Title
  - Hiring Manager
- A blank save must not show a required-field error for Number of Positions.

### 4.6 Default state
- `Active` must be checked by default.
- `Publish in RSS Feed and Web Page` must be checked by default.

### 4.7 Allowed values
- Job Title must be selected from the available job-title list.
- Hiring Manager must be selected through the search/autocomplete control.

## 5. Field Specifications

| Field Name | UI Type | Validation | Notes |
|---|---|---|---|
| Job Title filter | Select/dropdown | Default value is `-- Select --`. Exact option list not fully verified on the filter control. | Located on the Vacancies list page. |
| Vacancy filter | Select-style control | Default value is `-- Select --`. Exact option list not fully verified. | Located on the Vacancies list page. |
| Hiring Manager filter | Select/search control | Default value is `-- Select --`. Exact option list not fully verified. | Located on the Vacancies list page. |
| Status filter | Select/dropdown | Default value is `-- Select --`. Exact option list not fully verified. | Located on the Vacancies list page. |
| Vacancy Name | Text input | Required. Blank save shows `Required`. | Add Vacancy form. |
| Job Title | Select/dropdown | Required. Blank save shows `Required`. | Add Vacancy form. Verified options in the live environment: `Account Assistant`, `Automaton Tester`, `Chief Executive Officer`, `Chief Financial Officer`, `Chief Technical Officer`, `Content Specialist`, `Customer Success Manager`, `Database Administrator`, `Finance Manager`, `Financial Analyst`, `Head of Support`, `HR Associate`, `HR Manager`, `IT Manager`, `Network Administrator`, `Payroll Administrator`, `Pre-Sales Coordinator`, `QA Engineer`, `QA Lead`, `qwer`, `rsjsrii`, `Sales Representative`, `Social Media Marketer`, `Software Architect`, `Software Engineer`, `Support Specialist`, `Turyg`, `Tytytt_edited`, `VP - Client Services`, `VP - Sales & Marketing`. |
| Description | Textarea | No required validation observed. | Placeholder: `Type description here`. |
| Hiring Manager | Search/autocomplete input | Required. Blank save shows `Required`. | Placeholder: `Type for hints...`. Suggestion set is data-driven and was not fully enumerated. |
| Number of Positions | Text input | No required validation observed. Numeric-only behavior not verified. | Add Vacancy form. |
| Active | Checkbox | Checked by default. | Represents the active state of the vacancy. |
| Publish in RSS Feed and Web Page | Checkbox | Checked by default. | Read-only RSS/Web page URLs are shown below this control. |
| RSS Feed URL | Read-only text | N/A | Displayed value: `https://opensource-demo.orangehrmlive.com/web/index.php/recruitmentApply/jobs.rss` |
| Web Page URL | Read-only text | N/A | Displayed value: `https://opensource-demo.orangehrmlive.com/web/index.php/recruitmentApply/jobs.html` |

## 6. Business Rules and Validation Messages
- Blank save on Add Vacancy must display `Required` under Vacancy Name, Job Title, and Hiring Manager.
- `Number of Positions` is optional in the verified UI state.
- Job Title selection is constrained to the available job-title master list in the current environment.
- Hiring Manager selection is constrained to the autocomplete search results.

Observed validation message:

| Field | Message |
|---|---|
| Vacancy Name | Required |
| Job Title | Required |
| Hiring Manager | Required |

## 7. Dependencies
- Authentication into the OrangeHRM demo application.
- Recruitment module access after login.
- Existing job-title master data.
- Existing user records for the Hiring Manager autocomplete.
- Seeded vacancy data for the list page and record count.

## 8. Ambiguities and Testing Risks

### Ambiguities

| Code | Question | Risk if unresolved | Severity |
|---|---|---|---|
| AMB-01 | Is `Number of Positions` strictly numeric, and what are the minimum and maximum allowed values? | Invalid values may be accepted or blocked unexpectedly. | Medium |
| AMB-02 | What exact user records are available for the Hiring Manager autocomplete, and are deleted/inactive users excluded? | Tests may become unstable if the underlying dataset changes. | Medium |
| AMB-03 | What do the row action icons do exactly: edit, delete, or both? What confirmations or permission checks apply? | UI automation may target the wrong action or miss a required confirmation step. | Medium |
| AMB-04 | What values are available in the list-page Status filter? | Search coverage may be incomplete if the filter set is broader than expected. | Low |
| AMB-05 | Does `Publish in RSS Feed and Web Page` affect only visibility or also external publication logic? | Test expectations may overreach the verified UI. | Low |

### Testing Risks

| Code | Risk name | Description / impact | Mitigation |
|---|---|---|---|
| RISK-01 | Data-driven dropdowns | Job Title and Hiring Manager options depend on live environment data. | Use runtime enumeration in tests and avoid hard-coded assumptions. |
| RISK-02 | Shared demo data | The live demo already contains seeded and user-created vacancies. | Use unique test data and isolate assertions to the created record. |
| RISK-03 | Unlabeled action icons | Table action buttons do not expose clear labels in the DOM. | Prefer stable row-and-icon locators or verify action behavior before automating. |
| RISK-04 | Partial validation coverage | Only blank-submit validation was verified. | Add targeted checks for numeric, length, and invalid-value scenarios before automation. |

## 9. State Transition Matrix (if applicable)

| Current State | User Action | Next State | Notes |
|---|---|---|---|
| Add Vacancy form open | Save with blank required fields | Remains on form with validation errors | Verified for Vacancy Name, Job Title, and Hiring Manager. |
| Add Vacancy form open | Cancel | Vacancies list page | Form dismissal behavior is visible in the UI; save outcome was not verified here. |
| Vacancy marked Active | Save new vacancy | Active vacancy appears in the list | Default Active state was verified; save success path was not executed in this analysis. |

## 10. Acceptance Criteria Checklist

### Navigation and list page
- [ ] User can open `Recruitment > Vacancies`
- [ ] Vacancies page shows search filters
- [ ] Vacancies page shows results table and record count
- [ ] User can reset filters
- [ ] User can search with filters

### Add Vacancy form
- [ ] User can open `Add Vacancy`
- [ ] Form shows all expected fields
- [ ] Active is checked by default
- [ ] Publish in RSS Feed and Web Page is checked by default
- [ ] Blank save shows required validation for Vacancy Name
- [ ] Blank save shows required validation for Job Title
- [ ] Blank save shows required validation for Hiring Manager
- [ ] Blank save does not require Number of Positions

### Data selection
- [ ] Job Title is selected from the available job-title list
- [ ] Hiring Manager is selected from autocomplete results

## 11. Testing Recommendations
- Use the live UI to enumerate dynamic dropdown data at runtime instead of hard-coding values.
- Add negative tests for `Number of Positions` once the numeric rule is clarified.
- Verify one full successful save flow before automating broader CRUD coverage.
- Capture edit and delete behavior separately because the table action icons are unlabeled in the DOM.
- Keep test data unique so list assertions do not collide with the demo environment's seeded vacancies.
