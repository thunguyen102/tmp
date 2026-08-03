# Requirements Analysis: Recruitment Module

## 1. Overview

The Recruitment module in OrangeHRM covers vacancy management, candidate management, public job applications, candidate pipeline stage actions, and access control.

The source document is an as-is reverse-engineered specification based on real UI verification and network response checks against the OrangeHRM OS Demo system. It is intended as the ground truth for QA automation planning.

## 2. User Story

As an administrator, I want to manage recruitment vacancies and candidates, publish jobs publicly, progress candidates through the hiring pipeline, and control access by role, so that recruitment operations can be executed and verified end to end.

## 3. Scope

### In scope

- Recruitment module with two tabs:
  - Candidates
  - Vacancies
- Vacancy CRUD
- Vacancy attachments
- Candidate CRUD
- Public job listing page
- Public apply form
- Candidate pipeline stage actions
- Role-based access control for Recruitment
- Status history and profile editing in candidate details

### Out of scope

- Dashboard or reporting modules
- Kanban board pipeline
- Total candidates count and View Candidates action on vacancy list
- Reject Reason dropdown
- Custom questions on the public apply form
- Paste-text resume input on the public apply form
- Slot remaining or hired count on the public jobs list
- Hiring Manager and Interviewer as system roles
- Blocking vacancy deletion when candidates exist
- Duplicate email validation when creating a candidate
- Interview schedule overlap validation
- Locking Job Title when a vacancy already has linked candidates
- Cancel button on Edit Candidate Profile
- Field-specific required messages beyond the generic `Required`

## 4. Acceptance Criteria - Detailed Analysis

### 4.1 Vacancy list

- The Vacancies page shows filters for Job Title, Vacancy, Hiring Manager, and Status.
- The page provides an Add button.
- The vacancy table shows Vacancy, Job Title, Hiring Manager, Status, and Actions columns.
- The page does not show Total Candidates, Active/Applied counts, or a View Candidates button.

### 4.2 Create vacancy

- The Add Vacancy form includes:
  - Vacancy Name
  - Job Title
  - Description
  - Hiring Manager
  - Number of Positions
  - Active toggle
  - Publish in RSS Feed and Web Page toggle
- Vacancy Name is required and unique across the system, including inactive vacancies.
- Duplicate Vacancy Name shows the message `Already exists`.
- Hiring Manager is required.
- Hiring Manager must be selected from autocomplete employee suggestions.
- Typing without selecting a suggested employee shows `Invalid`.
- Number of Positions is optional.
- If provided, Number of Positions must be an integer from 1 to 99.
- Non-numeric, negative, decimal, or zero values are rejected with the appropriate validation message.
- The Job Title field remains editable even when candidates are already linked to the vacancy.
- When Publish in RSS Feed and Web Page is enabled, the form displays the RSS Feed URL and Web Page URL.

### 4.3 Edit vacancy and attachments

- Editing a vacancy shows the same fields as Add Vacancy.
- The edit form also includes an Attachments section.
- Attachment fields include File Name, File Size, File Type, Comment, and Actions.
- The Add Attachment action opens a dialog with:
  - Select File
  - Comment
  - Cancel
  - Save
- Attachment files are limited to 1 MB.

### 4.4 Delete vacancy

- Deleting a vacancy opens a confirmation dialog with the text:
  - `Are you Sure?`
  - `The selected record will be permanently deleted...`
  - `No, Cancel`
  - `Yes, Delete`
- Vacancy deletion is permanent.
- Vacancy deletion is not blocked even if linked candidates exist.
- Candidates linked to a deleted vacancy show Vacancy as `(Deleted)`.

### 4.5 Candidate list

- The Candidates page shows filters for:
  - Job Title
  - Vacancy
  - Hiring Manager
  - Status
  - Candidate Name
  - Keywords
  - Date of Application
  - Method of Application
- The candidate table shows:
  - Vacancy
  - Candidate
  - Hiring Manager
  - Date of Application
  - Status
  - Actions
- Row actions can include opening the profile, deleting the candidate, and downloading resume or attachment files when available.

### 4.6 Create candidate

- The internal Add Candidate form includes:
  - First Name
  - Middle Name
  - Last Name
  - Vacancy
  - Email
  - Contact Number
  - Resume
  - Keywords
  - Date of Application
  - Notes
  - Consent to keep data checkbox
- First Name and Last Name together form the required full name.
- Email is required.
- Duplicate email addresses are allowed.
- Missing required fields show the message `Required`.
- Invalid email format shows `Expected format: admin@example.com`.
- Resume is optional on the internal Add Candidate form.
- Allowed resume file types are `docx`, `doc`, `odt`, `pdf`, `rtf`, and `txt`.
- Resume size limit is 1 MB.
- Invalid file type shows `File type not allowed`.
- File size over 1 MB shows `Attachment Size Exceeded`.
- Resume validation happens immediately on file selection before Save.
- Date of Application defaults to today.
- Date of Application and Candidate History dates display in `yyyy-dd-mm` format.
- Candidate History entries use natural language descriptions.

### 4.7 View candidate profile

- The candidate profile page contains three areas:
  - Application Stage
  - Candidate Profile
  - Candidate History
- Application Stage shows Name, Vacancy, Hiring Manager, Status, and an action button.
- Candidate Profile displays the full field set and an Edit toggle.
- Candidate History displays Performed Date, Description, and Actions.
- History entries are written for pipeline events using natural-language descriptions.

### 4.8 Edit candidate profile

- Enabling Edit makes the following fields editable:
  - First Name
  - Middle Name
  - Last Name
  - Job Vacancy
  - Email
  - Contact Number
  - Keywords
  - Date of Application
  - Notes
  - Consent
  - Resume
- The edit panel provides only a Save button.
- There is no separate Cancel button.

### 4.9 Public job list

- The public jobs page is accessible without login.
- It lists published vacancies only.
- Each row shows the vacancy name and an Apply button.
- The public jobs list does not show slot remaining or hired count.

### 4.10 Public apply form

- The public apply form includes:
  - First Name
  - Middle Name
  - Last Name
  - Email
  - Contact Number
  - Resume
  - Keywords
  - Notes
  - Consent to keep data checkbox
- Resume is required on the public apply form.
- Resume format and size rules match the internal form.
- The form provides Back and Submit buttons.
- The public form does not include custom questions or paste-text resume input.

### 4.11 Candidate pipeline stage actions

- The pipeline status values are:
  - Application Initiated
  - Shortlisted
  - Rejected
  - Interview Scheduled
  - Interview Passed
  - Interview Failed
  - Job Offered
  - Offer Declined
  - Hired
- Application Initiated supports Shortlist and Reject.
- Shortlisted supports Schedule Interview and Reject.
- Interview Scheduled supports Reject, Mark Interview Failed, and Mark Interview Passed.
- Interview Passed supports Reject, Schedule Interview, and Offer Job.
- Interview Failed supports Reject.
- Job Offered supports Reject, Offer Declined, and Hire.
- Offer Declined supports Reject.
- Hired has no available actions.
- Rejected and Hired are terminal states.
- Offer Declined and Interview Failed are not terminal states and can still move to Reject.
- All stage actions use a common form pattern with:
  - Candidate
  - Vacancy
  - Hiring Manager
  - Current Status
  - Notes
  - Cancel
  - Save

### 4.12 Schedule interview

- Schedule Interview is available from Shortlisted and Interview Passed.
- The schedule form includes:
  - Interview Title
  - Interviewer
  - Date
  - Time
- Interview Title, Interviewer, and Date are required.
- Time is optional.
- Interviewer is selected from autocomplete employee suggestions.
- Add Another is available for Interviewer.
- Schedule overlap validation is not enforced.
- Double-booking the same interviewer at the same date and time is allowed.

### 4.13 Role and access control

- Only two system roles exist for user management:
  - Admin
  - ESS
- Hiring Manager and Interviewer are not system roles.
- They are employee reference fields used in recruitment forms.
- Admin has full Recruitment access.
- ESS has no Recruitment access.
- ESS users are blocked at both menu level and direct route access.
- Direct access returns `Credential Required`.

## 5. Field Specifications

### Vacancy

| Field Name | UI Type | Validation | Notes |
|---|---|---|---|
| Vacancy Name | Text | Required, unique across active and inactive vacancies, duplicate shows `Already exists` | System-wide uniqueness |
| Job Title | Dropdown | Required | Remains editable even if candidates exist |
| Description | Text area | None specified | Optional |
| Hiring Manager | Autocomplete employee field | Required, must be selected from suggestions, free typing without selection shows `Invalid` | Employee reference field |
| Number of Positions | Numeric text field | Optional, integer 1-99, invalid input shows numeric / range errors | Accepts only whole numbers |
| Active | Toggle | None specified | Default state not explicitly disputed; document indicates active toggle exists |
| Publish in RSS Feed and Web Page | Toggle | None specified | When enabled, URLs become visible |
| Attachment File | File picker | Max 1 MB | Available in edit vacancy attachment flow |
| Attachment Comment | Text field / text area | None specified | Used with attachment upload |

### Candidate - Internal Add

| Field Name | UI Type | Validation | Notes |
|---|---|---|---|
| First Name | Text | Required as part of full name, missing shows `Required` | Full name is a composite requirement |
| Middle Name | Text | None specified | Optional |
| Last Name | Text | Required as part of full name, missing shows `Required` | Full name is a composite requirement |
| Vacancy | Dropdown | None specified | Optional |
| Email | Text | Required, format must match `admin@example.com`, duplicate allowed | No duplicate check |
| Contact Number | Text | None specified | Optional |
| Resume | File picker | Optional, allowed types `docx`, `doc`, `odt`, `pdf`, `rtf`, `txt`, max 1 MB, client-side validation on selection | Validation happens before Save |
| Keywords | Text | None specified | Optional |
| Date of Application | Date picker / date field | Defaults to today | Displays as `yyyy-dd-mm` |
| Notes | Text area | None specified | Optional |
| Consent to keep data | Checkbox | None specified | Optional behavior not further defined |

### Candidate - Public Apply

| Field Name | UI Type | Validation | Notes |
|---|---|---|---|
| First Name | Text | Required as part of full name, missing shows `Required` | Public form |
| Middle Name | Text | None specified | Optional |
| Last Name | Text | Required as part of full name, missing shows `Required` | Public form |
| Email | Text | Required, format must match `admin@example.com` | Public form |
| Contact Number | Text | None specified | Optional |
| Resume | File picker | Required, allowed types `docx`, `doc`, `odt`, `pdf`, `rtf`, `txt`, max 1 MB | Mandatory on public form |
| Keywords | Text | None specified | Optional |
| Notes | Text area | None specified | Optional |
| Consent to keep data | Checkbox | None specified | Optional behavior not further defined |

### Schedule Interview

| Field Name | UI Type | Validation | Notes |
|---|---|---|---|
| Interview Title | Text | Required | Stage action form |
| Interviewer | Autocomplete employee field | Required | Add Another supported |
| Date | Date picker | Required | No overlap validation |
| Time | Time field | Optional | Optional by design |

## 6. Business Rules and Validation Messages

| Rule | Validation Message / Result |
|---|---|
| Vacancy Name must be unique across the system | `Already exists` |
| Hiring Manager must be selected from autocomplete suggestions | `Invalid` |
| Required fields on recruitment forms use a generic error | `Required` |
| Number of Positions must be a whole number between 1 and 99 | `Should be a numeric value` or `Should be a number between 1-99` |
| Invalid resume file type on internal or public form | `File type not allowed` |
| Resume larger than 1 MB on internal or public form | `Attachment Size Exceeded` |
| Invalid email format | `Expected format: admin@example.com` |
| Delete confirmation uses a permanent delete flow | `Are you Sure?` and `The selected record will be permanently deleted...` |
| ESS access to Recruitment is blocked | `Credential Required` |
| Rejected and Hired are terminal states | No actions available |
| Offer Declined is not terminal | Reject remains available |
| Interview Failed is not terminal | Reject remains available |
| Public apply form requires Resume | Save/Submit blocked until file is attached |
| Duplicate candidate email is allowed | No validation message |
| Interview overlap is allowed | No validation message |
| Vacancy deletion is allowed even when candidates exist | No validation block |
| Job Title remains editable even when candidates exist | No lock or warning |

### Verified defect, not a business rule

- If a candidate's vacancy has no Hiring Manager, the following actions may return HTTP 500 `Unexpected Error Occurred`:
  - Shortlist
  - Reject
  - Mark Interview Passed
  - Mark Interview Failed
- This is documented as a defect in the source, not expected product behavior.
- For pipeline testing, always use a vacancy with a valid Hiring Manager to avoid false failures.

## 7. Dependencies

### Source and environment dependencies

- OrangeHRM OS Demo system at `https://opensource-demo.orangehrmlive.com/web/index.php/`
- Recruitment module behavior verified on OS 5.9
- Public routes:
  - `recruitmentApply/jobs.html`
  - `recruitmentApply/jobs.rss`
- Admin authentication for all Recruitment actions
- ESS role for access control verification
- Employee master data for Hiring Manager and Interviewer autocomplete fields
- Job Titles master data for vacancy creation
- Browser/network inspection capability to confirm server responses and error messages

### Data dependencies

- Existing vacancies for uniqueness checks
- Existing candidates for delete and profile behavior
- At least one vacancy with a valid Hiring Manager for stage action testing
- At least one vacancy without a Hiring Manager for reproducing the documented defect
- Published vacancies for public job list verification

### Requirement dependencies

- Public apply form behavior depends on vacancy publication state
- Candidate pipeline actions depend on current status
- Candidate profile history depends on prior stage transitions and create/edit actions

## 8. Ambiguities and Testing Risks

### Ambiguities

| Code | Question | Risk if unresolved | Severity |
|---|---|---|---|
| AMB-01 | Is Vacancy Name uniqueness case-sensitive or case-insensitive? | Duplicate creation behavior may differ by backend collation rules | Medium |
| AMB-02 | What exact validation message is shown for Number of Positions values outside 1-99 versus non-numeric values? | Test assertions may become brittle if all invalid values map to a single generic message | Medium |
| AMB-03 | What is the default initial state of the Active toggle and the Publish in RSS Feed and Web Page toggle? | Test data setup may be inconsistent if defaults are assumed incorrectly | Low |
| AMB-04 | Are the date storage and display formats identical across all screens, or only on the UI display layer? | Automation could fail if backend serialization differs from UI formatting | Low |
| AMB-05 | What happens if an empty candidate history event is generated during partial failures? | History assertions may need resilient handling for edge cases | Low |

### Testing risks

| Code | Risk name | Description / impact | Mitigation |
|---|---|---|---|
| RISK-01 | Hidden Hiring Manager defect | Several pipeline actions can return HTTP 500 when the linked vacancy has no Hiring Manager | Use only valid vacancy data for normal pipeline coverage; keep a separate defect reproduction case |
| RISK-02 | Client-side resume validation | File validation happens on selection before Save, so network assertions alone will miss failures | Verify UI state and messages immediately after file selection |
| RISK-03 | Permanent delete flows | Deleted vacancies and candidates cannot be restored, which can create irreversible test data loss | Use isolated test data and cleanup-aware test design |
| RISK-04 | Public form mandatory resume | Public and internal add candidate forms differ on resume requiredness | Split tests by entry point and do not reuse assertions between forms |
| RISK-05 | Date format mismatch | The UI displays dates as `yyyy-dd-mm`, which is non-standard and easy to assert incorrectly | Normalize date checks in automation and avoid ISO assumptions |
| RISK-06 | No overlap validation for interviews | Double-booking is allowed, which may look like a defect to testers unfamiliar with the spec | Treat overlap as expected behavior unless product changes |

## 9. State Transition Matrix

| Current Status | Allowed Actions | Next Status |
|---|---|---|
| Application Initiated | Shortlist, Reject | Shortlisted, Rejected |
| Shortlisted | Schedule Interview, Reject | Interview Scheduled, Rejected |
| Interview Scheduled | Reject, Mark Interview Failed, Mark Interview Passed | Rejected, Interview Failed, Interview Passed |
| Interview Passed | Reject, Schedule Interview, Offer Job | Rejected, Interview Scheduled, Job Offered |
| Interview Failed | Reject | Rejected |
| Job Offered | Reject, Offer Declined, Hire | Rejected, Offer Declined, Hired |
| Offer Declined | Reject | Rejected |
| Rejected | None | Terminal |
| Hired | None | Terminal |

## 10. Acceptance Criteria Checklist

### Vacancy

- [ ] Vacancy list shows the correct filters and columns
- [ ] Vacancy list excludes Total Candidates, Active/Applied counts, and View Candidates
- [ ] Add Vacancy form includes all required fields and toggles
- [ ] Vacancy Name uniqueness is enforced
- [ ] Hiring Manager autocomplete selection is enforced
- [ ] Number of Positions validation is enforced
- [ ] Attachments can be added in edit mode
- [ ] Delete vacancy uses a permanent delete flow
- [ ] Deleted vacancies leave linked candidates marked as `(Deleted)`

### Candidate

- [ ] Candidate list shows the correct filters and columns
- [ ] Candidate profile displays application stage, profile, and history areas
- [ ] Internal Add Candidate allows duplicate emails
- [ ] Resume validation runs client-side on selection
- [ ] Public apply form requires Resume
- [ ] Candidate profile edit mode exposes the expected editable fields

### Pipeline

- [ ] Each status exposes the expected actions
- [ ] Rejected and Hired are terminal states
- [ ] Offer Declined and Interview Failed still allow Reject
- [ ] Schedule Interview includes the expected fields
- [ ] Schedule Interview does not enforce overlap blocking
- [ ] Stage history records natural-language events

### Access control

- [ ] Admin can access Recruitment
- [ ] ESS cannot access Recruitment from the menu
- [ ] ESS direct route access is blocked with `Credential Required`

## 11. Testing Recommendations

- Use separate test data sets for vacancy CRUD, candidate CRUD, public application, and pipeline transitions.
- Keep one dedicated vacancy with a valid Hiring Manager for all normal pipeline tests.
- Keep one dedicated vacancy without a Hiring Manager only for the documented defect reproduction case.
- Verify both UI messages and server/network results where the source document explicitly references HTTP status or client-side validation timing.
- Split assertions by form entry point because internal add candidate and public apply use different requiredness rules for Resume.
- Treat the non-standard date display format as a first-class requirement in assertions.
- Avoid assumptions from common recruitment systems, especially around duplicate candidate email, interview overlap validation, and deletion constraints.
- Use permanent-delete test data only when cleanup isolation is guaranteed.

