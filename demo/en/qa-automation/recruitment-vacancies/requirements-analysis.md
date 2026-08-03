# Requirements Analysis: Recruitment > Vacancies

## 1. Overview
The Vacancies feature in OrangeHRM Recruitment is used to manage job openings from end to end. It covers vacancy listing, filtering, vacancy creation, workflow setup, application form setup, smart screening rules, and job posting/publication.

This analysis is based on the public OrangeHRM demo login page and official OrangeHRM help articles. Direct verification of the authenticated UI was limited in this environment, so any UI behavior not explicitly documented is marked as unclear.

## 2. User Story
As an HR Admin or Recruiter, I want to create, filter, publish, and manage vacancies under Recruitment > Vacancies so that I can control open positions and candidate applications in one place.

## 3. Scope
In scope:
- Recruitment > Vacancies list page
- Vacancy filtering
- Add Vacancy flow
- Vacancy template import
- Workflow setup
- Application form setup
- Smart screening / best match rules
- Job posting and publication
- Vacancy-related candidate visibility

Out of scope:
- Candidate management details outside the vacancy context
- Admin master-data setup beyond its dependency on vacancies
- Public job-board sharing details beyond vacancy publication

Roles affected:
- HR Admin
- Recruiter
- Hiring Manager
- Any role with permission to view or manage vacancies

## 4. Acceptance Criteria - Detailed Analysis

### 4.1 Vacancy List
- Users with permission can open Recruitment > Vacancies and see the vacancy list.
- The page provides an Add Vacancy action for creating a new vacancy.
- The page provides a Filter action for narrowing the list of vacancies.
- Vacancy rows can expose vacancy-related actions such as viewing candidates and accessing vacancy settings, depending on permission and configuration.
- Closed vacancies can be included in search results when the user enables the Include Closed Vacancies option.

### 4.2 Vacancy Filtering
- The user can filter vacancies by Job Vacancy, Hiring Manager, Job Title, Sub Unit, Location, Status, From, and To.
- The filter supports an Include Closed Vacancies option.
- Search results should match the combined filter criteria entered by the user.
- Date-based filters should limit results to vacancies within the selected posted date range.
- If no records match the filter criteria, the user should see an empty result state.
- The exact filter control types, default values, and validation messages are not documented and must be confirmed in the live UI.

### 4.3 Add Vacancy
- Clicking Add Vacancy opens the vacancy creation flow.
- The user can start from a vacancy template and choose what to import from that template.
- If Import Smart Screening Information is enabled, Import Job Posting Information is automatically enabled as a dependency.
- The user can enter vacancy setup data such as Vacancy, Job Title, Location, Subunit, Hiring Manager, Number of Positions, consent setting, and resume requirement.
- The user can continue from vacancy setup to workflow configuration.
- The workflow step allows the user to define interview stage details.
- The application form step allows the user to edit the header, maintain the candidate personal details section, add custom sections, mark questions as required, and edit the footer.
- The smart screening step allows the user to define a rule name, select a question, choose a selection criterion, and decide whether archived candidates are included.
- The job posting step allows the user to define a job post title, edit the job post content, and either publish the vacancy or save it as a template.
- After publication, the vacancy should be available on the public job page and/or RSS feed when enabled.

### 4.4 Candidate and Applicant Impact
- If request consent to keep candidate data for later processing is enabled, the public application form should show a consent option.
- If resume required is enabled, the public application flow should require a resume upload.
- Additional questions configured in the application form should be shown to applicants for that vacancy.
- Smart screening rules should be usable to shortlist, reject, archive, or delete candidates based on configured question responses.

## 5. Field Specifications

| Function | Field Name | UI Type | Validation | Notes |
|---|---|---|---|---|
| Vacancy list filter | Job Vacancy | Unknown, likely text/autocomplete | Not documented | Search by vacancy name |
| Vacancy list filter | Hiring Manager | Unknown, likely autocomplete/dropdown | Not documented | Search by vacancy manager |
| Vacancy list filter | Job Title | Dropdown or autosuggest | Not documented | Uses job titles configured in Admin |
| Vacancy list filter | Sub Unit | Dropdown or autosuggest | Not documented | Search by vacancy subunit |
| Vacancy list filter | Location | Dropdown or autosuggest | Not documented | Search by vacancy location |
| Vacancy list filter | Status | Dropdown | Not documented | Exact status values are not documented |
| Vacancy list filter | From | Date picker | Not documented | Start of posted date range |
| Vacancy list filter | To | Date picker | Not documented | End of posted date range |
| Vacancy list filter | Include Closed Vacancies | Checkbox | Boolean | Expands results to closed vacancies |
| Add Vacancy | Import from template | Template selector / checkbox group | Not documented | Can import job posting, smart screening, and workflow information |
| Add Vacancy | Import Job Posting Information | Checkbox | Optional | May be auto-enabled by other template options |
| Add Vacancy | Import Smart Screening Information | Checkbox | Optional | Auto-enables Import Job Posting Information |
| Add Vacancy | Import Workflow Information | Checkbox | Optional | Reuses workflow setup from template |
| Add Vacancy | Vacancy | Text input | Not documented | Vacancy title/name |
| Add Vacancy | Job Title | Dropdown | Not documented | Populated from Admin > Job > Job Titles |
| Add Vacancy | Location | Dropdown | Not documented | Vacancy location |
| Add Vacancy | Subunit | Dropdown | Not documented | Vacancy subunit |
| Add Vacancy | Hiring Manager | Multi-select / autocomplete | Not documented | One vacancy can have multiple hiring managers |
| Add Vacancy | Number of Positions | Numeric input | Not documented | Number of openings |
| Add Vacancy | Request consent to keep candidate data for later processing | Toggle/checkbox | Boolean | Shows consent checkbox on the public application page |
| Add Vacancy | Resume Required | Toggle/checkbox | Boolean | Makes resume mandatory for applicants |
| Workflow | Workflow Type | Dropdown | Not documented | Uses configured workflow types |
| Workflow | Interview Name | Text input | Not documented | Enables additional workflow fields after input |
| Workflow | Interview Type | Dropdown | Not documented | Interview format selection |
| Workflow | Interviewers | Multi-select / autocomplete | Not documented | Can contain one or more interviewers |
| Workflow | Interview Outcome | Dropdown | Not documented | Outcome options are not documented |
| Application Form | Header | Rich text editor | Not documented | Used for vacancy application header content |
| Application Form | Candidate Personal Details | Fixed section | Not editable as a normal field | Core personal information section |
| Application Form | Add a Section | Action button | Not documented | Adds a custom application section |
| Application Form | Required Question | Toggle | Boolean | Marks a question as mandatory |
| Application Form | Footer | Rich text editor | Not documented | Used for application footer content |
| Smart Screening | Rule name | Text input | Not documented | Rule label |
| Smart Screening | Question | Dropdown | Not documented | Uses pre-configured vacancy questions |
| Smart Screening | Selection Criteria | Dropdown | Not documented | Allowed values: Is empty, Is not empty, Is in, Is not in |
| Smart Screening | Include Archived Candidates | Toggle/checkbox | Boolean | Includes archived applications in the rule |
| Job Posting | Job Posting Title | Text input | Not documented | Public job post title |
| Job Posting | Job Post | Rich text editor | Not documented | Public job post content |

## 6. Business Rules and Validation Messages
- Import Smart Screening Information automatically enables Import Job Posting Information.
- A vacancy can reuse content from an existing vacancy template.
- A vacancy can reuse workflow information from a template.
- A vacancy can reuse job posting information from a template.
- One vacancy can have multiple hiring managers.
- Job Title values come from Admin > Job > Job Titles.
- The workflow stages depend on the interview flow configured in the system.
- Smart screening actions can route candidates to Shortlist, Reject, Archive, or Delete.
- Smart screening selection criteria are limited to Is empty, Is not empty, Is in, and Is not in.
- Enabling request consent to keep candidate data for later processing should expose a consent checkbox on the public job application page.
- Enabling resume required should make resume upload mandatory for applicants.
- No specific validation error messages are documented in the reviewed sources.

## 7. Dependencies
- Admin master data for Job Titles, Locations, and Subunits must exist before vacancy creation can be completed.
- Interview flow configuration must exist before workflow setup can be finalized.
- Vacancy templates must exist before template import can be used.
- Public job posting or job board publishing must be enabled if the vacancy is meant to be visible externally.
- Candidate application form configuration must be consistent with public application behavior.
- Permission configuration must allow the target role to view or manage vacancies.

Reviewed sources:
- OrangeHRM Help Center, "How to Create a New Vacancy in OrangeHRM": https://help.orangehrm.com/hc/en-us/articles/18264958234649-How-to-create-a-new-vacancy-in-OrangeHRM
- OrangeHRM Help Center, "How To Add Candidates To Created Vacancies": https://help.orangehrm.com/hc/en-us/articles/10457315002777-How-To-Add-Candidates-To-Created-Vacancies
- OrangeHRM Help Center, "How to view the Candidate Profile": https://help.orangehrm.com/hc/en-us/articles/18266402107545-How-to-view-the-Candidate-Profile
- OrangeHRM Starter Help, "How to Create a Vacancy": https://starterhelp.orangehrm.com/hc/en-us/articles/360018591500-How-to-Create-a-Vacancy

## 8. Ambiguities and Testing Risks

### Ambiguities
- AMB-01: Which fields on Add Vacancy are strictly required in the current UI?
  - Risk if unresolved: Validation coverage and automation data design may miss mandatory inputs or false failures.
  - Severity: High
- AMB-02: What are the exact field types, default values, and allowed values for the vacancy filter controls?
  - Risk if unresolved: The filter automation may target the wrong control type or assert incorrect behavior.
  - Severity: Medium
- AMB-03: What status values are available in the Vacancy Status filter?
  - Risk if unresolved: Status-based test data may not match the production dropdown options.
  - Severity: Medium
- AMB-04: Does the current UI still use Save, Save and Continue, Publish, and Save as Template exactly as documented?
  - Risk if unresolved: The test plan may cover outdated actions or miss a current save path.
  - Severity: High
- AMB-05: Does importing from a template merge data or overwrite manually entered values?
  - Risk if unresolved: Users may lose configuration data without warning.
  - Severity: High
- AMB-06: Is Hiring Manager mandatory, and can the same vacancy have more than one hiring manager in the live UI?
  - Risk if unresolved: Vacancy creation tests may fail on permission or validation differences.
  - Severity: Medium
- AMB-07: What exact validation message appears when required data is missing or invalid?
  - Risk if unresolved: Negative test assertions cannot verify user-facing feedback precisely.
  - Severity: Low
- AMB-08: The authenticated demo UI could not be directly verified in this environment because the app requires interactive login and JavaScript.
  - Risk if unresolved: Help-center documentation may not fully match the live UI.
  - Severity: Medium

### Testing Risks
- RISK-01: Outdated or inconsistent documentation
  - Impact: Automated coverage may be built around deprecated fields or actions.
  - Mitigation: Reconfirm the live authenticated UI before finalizing automation selectors and data.
- RISK-02: Missing master data
  - Impact: Vacancy creation may fail because Job Title, Location, or Subunit values are absent.
  - Mitigation: Seed prerequisite configuration data before end-to-end runs.
- RISK-03: Conditional sections not persisting
  - Impact: Consent, resume, application questions, or smart screening settings may be lost after save/reopen.
  - Mitigation: Add reopen-and-verify checks for each conditional section.
- RISK-04: Date-range filter edge cases
  - Impact: Vacancies may be excluded because of timezone or boundary-date handling.
  - Mitigation: Test inclusive lower and upper bounds and boundary timestamps.
- RISK-05: Permission-dependent behavior
  - Impact: Users may see different buttons or menu items than the test expects.
  - Mitigation: Validate the role matrix before automation and test with at least one authorized role.

## 9. State Transition Matrix (if applicable)

| Current State | Action | Next State | Notes |
|---|---|---|---|
| Vacancy configuration in progress | Save or save-and-continue through the setup flow | Configured vacancy | Exact internal state label is not documented |
| Configured vacancy | Complete job posting and publish | Published vacancy | Published vacancies become available externally when publishing is enabled |
| Published vacancy | Close the vacancy | Closed vacancy | Closed vacancies can be included in filter results when requested |
| Closed vacancy | Enable Include Closed Vacancies in the filter | Visible in list results | This is a filter behavior, not a state change |

## 10. Acceptance Criteria Checklist
- [ ] Users with permission can open Recruitment > Vacancies.
- [ ] The vacancy list shows Add Vacancy and Filter actions.
- [ ] Vacancies can be filtered by vacancy name, manager, job title, subunit, location, status, and date range.
- [ ] Closed vacancies can be included in search results.
- [ ] Users can start vacancy creation from scratch or from a template.
- [ ] Template import can bring in job posting, workflow, and smart screening settings.
- [ ] Smart screening template import auto-enables job posting import.
- [ ] Users can configure vacancy basics, workflow, application form, smart screening, and job posting.
- [ ] Enabling consent and resume options affects the public application flow.
- [ ] Published vacancies are available externally when publishing is enabled.

## 11. Testing Recommendations
- Confirm the live authenticated UI before building automation selectors, because the current analysis relies on help-center documentation.
- Use seeded master data for Job Titles, Locations, Subunits, Interviewers, and Vacancy Templates.
- Test the vacancy creation flow both with and without template import.
- Verify that conditional settings survive save, reload, edit, and publish actions.
- Cover filter boundaries, especially date ranges and closed-vacancy inclusion.
- Validate permission-based visibility for Add Vacancy, Filter, settings, and candidate actions.
- Check the public application page after toggling consent and resume requirements to confirm the vacancy configuration is reflected externally.
- Recheck the live UI whenever OrangeHRM help articles and the demo interface differ, since the product documentation appears to have both legacy and newer vacancy flows.
