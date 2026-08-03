# Test Plan: Recruitment > Vacancies

## 1. Overview
This test plan covers the OrangeHRM Recruitment > Vacancies feature. The feature supports vacancy listing, filtering, vacancy creation, template import, workflow setup, application form setup, smart screening, and job posting/publishing.

The plan is based on the previously saved requirements analysis and the current Help Center documentation. Some live UI details remain unclear, so those items are treated as assumptions or open questions and should be confirmed during execution.

## 2. Test Objectives
- Verify that users with the right permission can access the Vacancies page and use its main actions.
- Verify that vacancy filters return the correct records for the selected criteria.
- Verify that a vacancy can be created from scratch and from a template.
- Verify that workflow, application form, smart screening, and job posting settings persist after save.
- Verify that publication-related settings affect the external job application experience as expected.
- Verify that permission, state, and dependency behavior is consistent across the vacancy flow.

## 3. Scope

### 3.1 In Scope
- Recruitment > Vacancies list page
- Vacancy filter behavior
- Add Vacancy flow
- Vacancy template import
- Workflow setup
- Application form setup
- Smart screening rules
- Job posting and publication
- Vacancy-related candidate visibility where it depends on vacancy setup

### 3.2 Out of Scope
- Candidate management flows not initiated from vacancy setup
- Admin master data creation for Job Titles, Locations, Subunits, or Interview flows
- Job board integration outside the documented vacancy publication path
- API-level validation unless needed for setup or debugging
- Visual redesign or accessibility redesign work not tied to vacancy behavior

## 4. Test Approach
The feature should be tested as a mix of manual and automated web UI coverage using Playwright with TypeScript.

Approach by area:
- Smoke coverage for access to the page, opening Add Vacancy, saving a basic vacancy, and applying one simple filter.
- Functional coverage for all vacancy setup sections, including required and conditional fields.
- Negative coverage for missing required inputs, invalid dates, and unsupported combinations of setup options.
- Boundary coverage for date filters, numeric inputs, and state transitions such as open, published, and closed vacancies.
- Permission coverage for users with and without vacancy management rights.
- Persistence coverage for save, reopen, edit, and publish flows.
- External impact coverage for public job posting behavior when consent or resume requirements are enabled.

Execution notes:
- Use a stable seeded dataset because Vacancy creation depends on configured Job Titles, Locations, Subunits, templates, and workflow data.
- Revalidate the live authenticated UI before automation if control names or page actions differ from the Help Center article.
- Treat undocumented validation messages as unknown until verified in the UI.

## 5. Test Coverage Areas

| Area | Coverage | Type | Priority | Reason |
|---|---|---:|---:|---|
| Page access | Open Recruitment > Vacancies, view list, confirm actions | Automated + Manual | High | Core entry point |
| Vacancy filters | Search by vacancy name, hiring manager, job title, subunit, location, status, date range, closed vacancies | Automated | High | Main list usability and regression risk |
| Add Vacancy basics | Vacancy, job title, location, subunit, hiring manager, positions, consent, resume required | Automated + Manual | High | Core create flow |
| Template import | Import job posting, workflow, smart screening settings | Manual first, then automated | High | High dependency and overwrite risk |
| Workflow setup | Interview stage fields and continuation behavior | Automated + Manual | Medium | Important, but often data-dependent |
| Application form setup | Header, custom sections, required question, footer | Automated + Manual | Medium | Persistence and external impact |
| Smart screening | Rule creation, selection criteria, archived candidate inclusion | Automated + Manual | High | Business rule path with branching logic |
| Job posting | Title, content, publish, save as template | Automated + Manual | High | External visibility and release path |
| Public application impact | Consent and resume requirement behavior | Manual + Automation where feasible | High | Customer-facing behavior |
| Permission behavior | Access and action visibility by role | Automated | High | Regression-sensitive |
| State behavior | Draft/configured, published, closed, include closed results | Automated | Medium | Filter and lifecycle consistency |

## 6. Test Environment and Browser Coverage

Recommended environment:
- OrangeHRM demo or QA environment with JavaScript enabled
- Stable test tenant with seeded recruitment master data
- Network access to public job posting pages if external publication is validated

Browser coverage:
- Primary: Chromium-based browser
- Secondary: Firefox
- Optional smoke check: WebKit if the team supports it

Platform coverage:
- Desktop first
- Mobile browser coverage is not required unless the Vacancy page is explicitly supported on mobile in the project scope

## 7. Test Data and Account Requirements

### Accounts
- HR Admin account with full Recruitment permission
- Recruiter account with limited Recruitment permission
- Optional read-only or restricted account for permission checks

### Test Data
- At least one active Job Title
- At least one Location
- At least one Subunit
- At least one interview workflow or interview flow configuration
- At least one vacancy template
- At least one hiring manager account or employee record that can be assigned as a hiring manager
- Candidate records for smart screening and vacancy-related verification where needed

### Cleanup Needs
- Remove or archive test vacancies created during execution
- Remove any temporary published jobs if the environment allows cleanup
- Reset any configuration changed for the test run if the environment is shared

## 8. Dependencies
- The vacancy flow depends on Admin master data for Job Titles, Locations, and Subunits.
- Workflow setup depends on an interview flow configuration already existing in the system.
- Template import depends on at least one saved vacancy template.
- Public job posting checks depend on publication being enabled in the environment.
- Permission checks depend on the assigned role and module access configuration.

## 9. Risks and Mitigation

| Risk | Impact | Priority | Mitigation | Related ID |
|---|---|---:|---|---|
| Documentation and live UI may differ | Tests may target outdated buttons or fields | High | Reconfirm the live UI before automation | AMB-04, AMB-08 |
| Required fields are not fully documented | Test data may miss a mandatory field | High | Validate required indicators in the live form before finalizing scripts | AMB-01 |
| Template import may overwrite manual values | Vacancy setup data may be lost | High | Test import behavior on a disposable vacancy first | AMB-05 |
| Missing master data blocks setup | Vacancy creation fails before core coverage completes | High | Seed prerequisite data before execution | RISK-02 |
| Filter date boundaries may be inconsistent | Search results may be off by one day or timezone | Medium | Test exact boundary dates and recheck timezone handling | RISK-04 |
| Role-based access may vary | Buttons or menu items may disappear | Medium | Execute with at least one authorized and one restricted role | RISK-05 |
| Conditional sections may not persist | Saved vacancy may not match user input | Medium | Save, reopen, and verify each conditional section | RISK-03 |

## 10. Priority and Execution Order
Recommended execution order:

1. Environment and access check
2. Page access and vacancy list smoke coverage
3. Vacancy filter smoke coverage
4. Basic vacancy creation without template import
5. Vacancy creation with template import
6. Workflow setup verification
7. Application form customization verification
8. Smart screening rule verification
9. Job posting and publish/save-as-template verification
10. Public application impact verification
11. Permission and regression checks

Priority order:
- P1: access, filter, basic creation, permission, publish
- P2: template import, workflow, smart screening, application form
- P3: deep edge cases, cleanup checks, and secondary browser confirmation

## 11. Automation and Manual Testing Recommendation

| Area | Recommendation | Reason |
|---|---|---|
| Page access | Automate | Stable smoke check with clear expected results |
| Vacancy filters | Automate | High regression value and repetitive coverage |
| Basic vacancy creation | Automate core path | Repeated UI flow with structured fields |
| Template import | Start manual, then automate | Higher risk of data overwrite and dependency complexity |
| Workflow setup | Hybrid | More dependable after UI confirmation |
| Application form setup | Hybrid | Rich-text and dynamic section behavior benefits from manual review plus automation checks |
| Smart screening | Automate key branches | Clear rule-based behavior with high business value |
| Job posting and publish | Automate core publish path | Critical release behavior |
| Public application impact | Manual first, then automate selected checks | External page behavior can vary by environment |
| Permission checks | Automate | Easy regression detection across roles |

## 12. Entry Criteria
- Requirements analysis is available and reviewed.
- Test environment is accessible.
- Required master data and roles are seeded.
- At least one vacancy template and one workflow configuration exist.
- Testers understand which UI details still need confirmation from the live system.

## 13. Exit Criteria
- All P1 coverage is executed and passed, or defects are logged with clear reproduction details.
- P2 coverage is executed for the main vacancy creation and publishing flows.
- No open blocker remains on page access, vacancy creation, or publishing.
- Open questions that affect automation are resolved or documented as assumptions.
- Test evidence is stored for the executed scenarios.

## 14. Assumptions and Open Questions

### Assumptions
- The environment supports authenticated access to the Recruitment module.
- The current UI still aligns closely enough with the documented vacancy flow to support the planned coverage.
- Test accounts can be provisioned with the needed Recruitment permissions.

### Open Questions
- AMB-01: Which fields are mandatory in the current Add Vacancy form?
- AMB-02: What are the exact UI control types and default values for vacancy filters?
- AMB-03: Which values appear in the Vacancy Status filter?
- AMB-04: Are the documented action labels still current in the live UI?
- AMB-05: Does template import overwrite or merge existing vacancy input?
- AMB-06: Is Hiring Manager mandatory, and can multiple hiring managers be assigned in the current UI?
- AMB-07: What validation messages appear for missing or invalid inputs?
- AMB-08: Can the live authenticated demo UI be verified directly before automation begins?

## 15. Deliverables
- `qa-automation/recruitment-vacancies/test-plan.md`
- A reviewed execution order for P1 and P2 coverage
- A list of automation candidates and manual-only checks
- Logged open questions and assumptions for the PO or BA
- Test evidence for executed smoke, functional, and permission coverage
