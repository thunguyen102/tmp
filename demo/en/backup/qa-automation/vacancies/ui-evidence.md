# Real UI Evidence: Recruitment > Vacancies

## Status
VERIFIED

## Environment and Tooling
- Application: OrangeHRM demo
- Entry URL: `https://opensource-demo.orangehrmlive.com/web/index.php/auth/login`
- Browser automation: Playwright 1.61.1
- Run mode: headless Chromium
- Login used for verification: `Admin` / `admin123`

## Navigation and Roles
- Logged in successfully and reached the dashboard.
- Navigated from `Recruitment` to `Vacancies`.
- Opened the `Add Vacancy` form from the Vacancies page.

## Observed UI Inventory
- Vacancies list page:
  - Filters: `Job Title`, `Vacancy`, `Hiring Manager`, `Status`
  - Buttons: `Reset`, `Search`, `Add`
  - Table columns: `Vacancy`, `Job Title`, `Hiring Manager`, `Status`, `Actions`
  - Record count shown as `(14) Records Found`
- Add Vacancy form:
  - Fields: `Vacancy Name`, `Job Title`, `Description`, `Hiring Manager`, `Number of Positions`
  - Toggles/checkboxes: `Active`, `Publish in RSS Feed and Web Page`
  - Read-only URLs shown for `RSS Feed URL` and `Web Page URL`
  - Buttons: `Cancel`, `Save`

## Observed Rules and Messages
- Blank submit on `Add Vacancy` shows required-field errors on exactly three fields:
  - `Vacancy Name` -> `Required`
  - `Job Title` -> `Required`
  - `Hiring Manager` -> `Required`
- `Number of Positions` did not show a required error on blank submit.
- `Active` checkbox is checked by default.
- `Publish in RSS Feed and Web Page` checkbox is checked by default.
- `Job Title` dropdown options observed in the live environment:
  - `Account Assistant`
  - `Automaton Tester`
  - `Chief Executive Officer`
  - `Chief Financial Officer`
  - `Chief Technical Officer`
  - `Content Specialist`
  - `Customer Success Manager`
  - `Database Administrator`
  - `Finance Manager`
  - `Financial Analyst`
  - `Head of Support`
  - `HR Associate`
  - `HR Manager`
  - `IT Manager`
  - `Network Administrator`
  - `Payroll Administrator`
  - `Pre-Sales Coordinator`
  - `QA Engineer`
  - `QA Lead`
  - `qwer`
  - `rsjsrii`
  - `Sales Representative`
  - `Social Media Marketer`
  - `Software Architect`
  - `Software Engineer`
  - `Support Specialist`
  - `Turyg`
  - `Tytytt_edited`
  - `VP - Client Services`
  - `VP - Sales & Marketing`
- Hiring Manager field behaved as a typeahead/search field; the exact result set was not fully enumerated in this run.

## Exercised Flows
- Successful login
- Navigate to `Recruitment > Vacancies`
- Open Vacancies list
- Open `Add Vacancy`
- Submit a blank `Add Vacancy` form and capture validation errors

## Evidence Files
- `qa-automation/vacancies/logs/evidence/runlog.txt`
- `qa-automation/vacancies/logs/evidence/body.txt`
- `qa-automation/vacancies/logs/evidence/controls.json`
- `qa-automation/vacancies/logs/evidence/vacancies-list-body.txt`
- `qa-automation/vacancies/logs/evidence/add-form-body.txt`
- `qa-automation/vacancies/logs/evidence/blank-save-fresh-body.txt`
- `qa-automation/vacancies/logs/evidence/job-title-options.json`
- `qa-automation/vacancies/logs/evidence/blank-save-fresh-errors.json`
- `qa-automation/vacancies/logs/evidence/dashboard.png`
- `qa-automation/vacancies/logs/evidence/vacancies.png`
- `qa-automation/vacancies/logs/evidence/vacancies-list.png`
- `qa-automation/vacancies/logs/evidence/add-form.png`
- `qa-automation/vacancies/logs/evidence/blank-save-fresh.png`

## Blockers and Unverified Areas
- No blocker remained after browser bootstrap.
- The following areas were not fully exercised:
  - Successful creation of a new vacancy
  - Edit and delete action behavior from the table
  - Full hiring-manager suggestion set
  - Status filter option set
  - Whether `Number of Positions` has a numeric-only constraint
