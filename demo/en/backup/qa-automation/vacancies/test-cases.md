# Test Cases: Recruitment > Vacancies

Source artifacts used:
- `qa-automation/vacancies/test-plan.md`
- `qa-automation/vacancies/requirements-analysis.md`
- `qa-automation/vacancies/ui-evidence.md`

Assumptions and open questions:
- `Number of Positions` behavior is still unclear for numeric validation, minimum, and maximum values.
- Hiring Manager values are data-driven in the live environment. The test cases use verified live values from the current UI snapshot.
- The save flow is included as a business-required happy path, but it needs stable locator handling if automated.

| TC ID | Requirement / AC | Module | Test Scenario | Preconditions | Test Steps | Test Data | Expected Result | Priority |
|---|---|---|---|---|---|---|---|---|
| ORHRM_VAC_TC_001 | Req 4.1 | Recruitment > Vacancies | Open the Vacancies page from Recruitment | User is logged in as `Admin` and is on the dashboard | 1. Open `Recruitment` from the left navigation.<br>2. Click `Vacancies`. | Admin / admin123 | The Vacancies page opens successfully and the URL changes to the Vacancies list page. | High |
| ORHRM_VAC_TC_002 | Req 4.1 | Recruitment > Vacancies | Verify the Vacancies list page layout | User is on the Vacancies page | 1. Observe the page header and controls.<br>2. Verify the table headers and record count. | N/A | The page shows filters for Job Title, Vacancy, Hiring Manager, and Status; buttons for Reset, Search, and Add; and a table with Vacancy, Job Title, Hiring Manager, Status, and Actions columns. Record count is visible. | High |
| ORHRM_VAC_TC_003 | Req 4.2 | Recruitment > Vacancies | Verify list-page default filter values | User is on the Vacancies page | 1. Inspect each filter control without changing any value. | N/A | All filters show their default unselected state, displayed as `-- Select --`. | Medium |
| ORHRM_VAC_TC_004 | Req 4.3 | Recruitment > Vacancies | Open the Add Vacancy form | User is on the Vacancies page | 1. Click `Add`. | N/A | The `Add Vacancy` form opens. | High |
| ORHRM_VAC_TC_005 | Req 4.4, Req 4.6 | Recruitment > Vacancies / Add Vacancy | Verify form fields and default checkbox states | User is on the Add Vacancy form | 1. Observe the visible form fields.<br>2. Check the default state of `Active`.<br>3. Check the default state of `Publish in RSS Feed and Web Page`. | N/A | The form shows Vacancy Name, Job Title, Description, Hiring Manager, Number of Positions, Active, and Publish in RSS Feed and Web Page. `Active` is checked by default. `Publish in RSS Feed and Web Page` is checked by default. | High |
| ORHRM_VAC_TC_006 | Req 4.5 | Recruitment > Vacancies / Add Vacancy | Validate Vacancy Name is required | User is on the Add Vacancy form | 1. Enter a valid Job Title value.<br>2. Select a valid Hiring Manager value.<br>3. Leave Vacancy Name blank.<br>4. Click `Save`. | Job Title: `QA Engineer`<br>Hiring Manager: `Sumana Testuser` | The form does not save. A `Required` validation message appears for Vacancy Name. | High |
| ORHRM_VAC_TC_007 | Req 4.5 | Recruitment > Vacancies / Add Vacancy | Validate Job Title is required | User is on the Add Vacancy form | 1. Enter a unique Vacancy Name.<br>2. Select a valid Hiring Manager value.<br>3. Leave Job Title unselected.<br>4. Click `Save`. | Vacancy Name: `QA Vacancy 001`<br>Hiring Manager: `Sumana Testuser` | The form does not save. A `Required` validation message appears for Job Title. | High |
| ORHRM_VAC_TC_008 | Req 4.5 | Recruitment > Vacancies / Add Vacancy | Validate Hiring Manager is required | User is on the Add Vacancy form | 1. Enter a unique Vacancy Name.<br>2. Select a valid Job Title value.<br>3. Leave Hiring Manager blank.<br>4. Click `Save`. | Vacancy Name: `QA Vacancy 002`<br>Job Title: `QA Engineer` | The form does not save. A `Required` validation message appears for Hiring Manager. | High |
| ORHRM_VAC_TC_009 | Req 4.7, Req 5 | Recruitment > Vacancies / Add Vacancy | Select a Job Title from the dropdown | User is on the Add Vacancy form | 1. Open the Job Title dropdown.<br>2. Select `QA Engineer`. | Job Title: `QA Engineer` | The Job Title field is populated with `QA Engineer`. | Medium |
| ORHRM_VAC_TC_010 | Req 4.7, Req 5 | Recruitment > Vacancies / Add Vacancy | Select a Hiring Manager from the autocomplete list | User is on the Add Vacancy form | 1. Click in the Hiring Manager field.<br>2. Type `Sumana`.<br>3. Select `Sumana Testuser` from the suggestions. | Search text: `Sumana`<br>Selected value: `Sumana Testuser` | The Hiring Manager field is populated with `Sumana Testuser`. The selected suggestion is accepted by the form. | Medium |
| ORHRM_VAC_TC_011 | Req 4.2 | Recruitment > Vacancies | Search and reset vacancies from the list page | User is on the Vacancies page | 1. Set Job Title to `QA Engineer`.<br>2. Click `Search`.<br>3. Verify the table updates.<br>4. Click `Reset`. | Job Title filter: `QA Engineer` | Search refreshes the table based on the selected filter. Reset returns the filters to their default state and restores the unfiltered list view. | High |
| ORHRM_VAC_TC_012 | Req 4.4, Req 4.6, Req 4.7 | Recruitment > Vacancies / Add Vacancy | Save a new vacancy with valid data | User is on the Add Vacancy form and the environment contains the verified Hiring Manager value `Sumana Testuser` | 1. Enter a unique Vacancy Name.<br>2. Select `QA Engineer` as Job Title.<br>3. Enter a Description value.<br>4. Select `Sumana Testuser` as Hiring Manager.<br>5. Enter `1` for Number of Positions.<br>6. Keep `Active` checked.<br>7. Keep `Publish in RSS Feed and Web Page` checked.<br>8. Click `Save`. | Vacancy Name: `QA Vacancy 003`<br>Job Title: `QA Engineer`<br>Description: `Vacancy save flow verification`<br>Hiring Manager: `Sumana Testuser`<br>Number of Positions: `1` | The vacancy is saved successfully. The user is returned to the Vacancies list page or sees a confirmed post-save state, and the new vacancy appears in the list with the entered values and Active status. | High |

## Automation Notes

- `ORHRM_VAC_TC_001` to `ORHRM_VAC_TC_011` are suitable for Playwright automation.
- `ORHRM_VAC_TC_010` depends on live autocomplete data and should use runtime selection, not a hard-coded DOM index.
- `ORHRM_VAC_TC_012` is suitable for automation only after the save path is confirmed with a stable locator strategy for the Vacancy Name, Job Title, and Hiring Manager controls.
- `Number of Positions` validation is not covered beyond the verified optional state because the business rule remains open.

