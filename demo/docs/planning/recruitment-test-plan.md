# Recruitment Module - Comprehensive Test Plan

**Version**: 2.0 (Verified)
**Date**: 2026-07-21
**Project**: OrangeHRM Recruitment Module (OS 5.9)
**System**: https://opensource-demo.orangehrmlive.com/web/index.php/
**Total Test Cases**: 41 test cases
**Slice 1 Scope**: 29 cases (Slice 2: 12 cases)

---

## 🚀 PROOF OF CONCEPT (POC) APPROACH

> **⚠️ IMPORTANT**: This phase implements **3 showcase test cases** (not all 29) as a Proof of Concept.
> 
> **Why?** POC with 3 working cases proves the framework + pattern works.  
> **Timeline**: ~2.5 hours to demonstrate (vs. 2-3 days for all 29).  
> **Path to Full**: Remaining 26 cases follow exact same pattern (repeatable).
>
> **See**: [POC-STATUS.md](./POC-STATUS.md) for detailed explanation & demo script.

### 🎯 POC Showcase Cases (Phase 1)

| Case | Demonstrates | Time |
|------|---|---|
| **TC-V-001** | Vacancy creation + form validation | 45 min |
| **TC-C-001** | Candidate add + email validation | 45 min |
| **TC-P-001** | Pipeline action (Shortlist) | 30 min |
| **Total POC** | Framework + pattern proven | ~2.5 hrs |

### 📈 Path to Full Automation (Phase 2)

- **POC Complete** ✓ (3 cases PASS)
- **Pattern Proven** ✓ (repeatable approach)
- **Extend to 29** → Remaining 26 cases (~2 days)
- **Full Regression** → All 29 cases passing (~30 min)

**Total project time**: ~3 days to full automation

---

## 1. Application Overview

**Recruitment Module** trong OrangeHRM là hệ thống quản lý tuyển dụng với 2 tab chính:
- **Vacancies**: Quản lý vị trí tuyển dụng, đính kèm file, công bố công khai
- **Candidates**: Quản lý hồ sơ ứng viên, xử lý pipeline state (Shortlist → Hire)

**Key Features**:
- Complete CRUD operations on Candidates & Vacancies
- 8-stage candidate pipeline (Application Initiated → Hired)
- Public Apply Form (guest users)
- File attachments & resume validation
- Complex business rules (unique constraints, state transitions, Hiring Manager dependency)

**Tech Stack**: OrangeHRM OS (PHP/MySQL backend, HTML/CSS/JS frontend)
**Access Control**: Admin-only (role-based)

---

## 2. Module → Requirement Map

| Module | Description | Test Cases |
|--------|---|---|
| Candidate Management | CRUD and validation for candidates | 10 |
| Vacancy Management | CRUD and management of vacancies | 13 |
| Candidate Pipeline | Pipeline state actions and transitions | 18 |

**Total Test Cases**: 41

---

## 3. Slices & Scope

### Slice 1 - Core Recruitment Pipeline
**Scope**: 29 of 41 test cases (P1 Critical + High-value P2)

**Included Modules**:
- ✅ Candidate Management (6-7 cases)
- ✅ Vacancy Management (8-9 cases)
- ✅ Candidate Pipeline (12-13 cases)

**Excluded** (Slice 2):
- ❌ Public Apply Form
- ❌ Permissions & Access Control

---

## 4. Application Structure & User Flows

### Vacancy Management Flow
1. Navigate to Recruitment > Vacancies
2. Click "Add"
3. Fill form: Vacancy Name (unique), Job Title, Hiring Manager (autocomplete), Number of Positions (1-99, optional)
4. Toggle "Active" (publish to public)
5. Add Attachment (optional, ≤1MB)
6. Save → View in list → Edit → Delete

### Candidate Management Flow
1. Navigate to Recruitment > Candidates
2. Click "Add"
3. Fill form: First Name*, Last Name*, Email*, Vacancy (opt), Contact, Resume (opt, ≤1MB), Notes
4. Save → View → Edit Profile → Delete

### Candidate Pipeline Flow
1. Candidate created in "Application Initiated" status
2. Shortlist → Shortlisted
3. Schedule Interview → Interview Scheduled
4. Mark Interview Passed/Failed
5. Offer Job → Job Offered
6. Hire → Hired (terminal) OR Reject (any status)

---

## 5. Traceability Matrix

### Candidate Management

| TC ID | Title | Priority | Type |
|---|---|---|---|
| TC-C-001 | Add Candidate with Valid Data | Critical | Happy Path |
| TC-C-002 | Add Candidate without Email | Critical | Negative |
| TC-C-003 | Add Candidate with Invalid Email Format | Critical | Negative |
| TC-C-004 | Add Candidate with Invalid Resume File Type | Critical | Edge Case |
| TC-C-005 | Add Candidate with Resume Exceeding 1MB | Critical | Edge Case |
| TC-C-006 | Edit Candidate Profile | Critical | Happy Path |
| TC-C-007 | Delete Candidate | High | Happy Path |
| TC-C-008 | List Candidates with Filters | Medium | Happy Path |
| TC-C-009 | Add Candidate with Optional Resume | High | Happy Path |
| TC-C-010 | Add Candidate Duplicate Email | High | Edge Case |

### Vacancy Management

| TC ID | Title | Priority | Type |
|---|---|---|---|
| TC-V-001 | Create Vacancy with Valid Data | Critical | Happy Path |
| TC-V-002 | Create Vacancy without Vacancy Name | Critical | Negative |
| TC-V-003 | Create Vacancy without Job Title | Critical | Negative |
| TC-V-004 | Create Vacancy without Hiring Manager | Critical | Negative |
| TC-V-005 | Create Vacancy with Duplicate Name | Critical | Negative |
| TC-V-006 | Create Vacancy with Invalid Hiring Manager | Critical | Negative |
| TC-V-007 | Create Vacancy with Invalid Number of Positions | Critical | Edge Case |
| TC-V-008 | Create Vacancy with Valid Number of Positions | Critical | Happy Path |
| TC-V-009 | Create Vacancy with Attachment | High | Happy Path |
| TC-V-010 | Create Vacancy and Publish to Jobs List | High | Happy Path |
| TC-V-011 | Edit Vacancy Job Title | High | Happy Path |
| TC-V-012 | Delete Vacancy with Linked Candidates | High | Happy Path |
| TC-V-013 | List Vacancies with Filters | Medium | Happy Path |

### Candidate Pipeline

| TC ID | Title | Priority | Type |
|---|---|---|---|
| TC-P-001 | Shortlist Candidate | Critical | Happy Path |
| TC-P-002 | Reject from Application Initiated | Critical | Happy Path |
| TC-P-003 | Schedule Interview from Shortlisted | Critical | Happy Path |
| TC-P-004 | Schedule Interview without Interview Title | Critical | Negative |
| TC-P-005 | Schedule Interview without Interviewer | Critical | Negative |
| TC-P-006 | Schedule Interview without Date | Critical | Negative |
| TC-P-007 | Mark Interview Passed | Critical | Happy Path |
| TC-P-008 | Mark Interview Failed | Critical | Happy Path |
| TC-P-009 | Reject from Interview Failed | Critical | Happy Path |
| TC-P-010 | Offer Job | Critical | Happy Path |
| TC-P-011 | Offer Declined from Job Offered | Critical | Happy Path |
| TC-P-012 | Reject from Offer Declined | Critical | Happy Path |
| TC-P-013 | Hire from Job Offered | Critical | Happy Path |
| TC-P-014 | Reject from Job Offered | High | Happy Path |
| TC-P-015 | Reject from Interview Scheduled | High | Happy Path |
| TC-P-016 | Reject from Shortlisted | High | Happy Path |
| TC-P-017 | Reschedule Interview from Interview Passed | High | Happy Path |
| TC-P-018 | Schedule Interview with Optional Time | High | Happy Path |

---

## 6. Coverage Summary

| Priority | Count | Test Cases |
|---|---|---|
| 🔴 Critical | 27 | TC-C-001, TC-C-002, TC-C-003, TC-C-004, TC-C-005, TC-C-006, TC-V-001, TC-V-002, TC-V-003, TC-V-004, TC-V-005, TC-V-006, TC-V-007, TC-V-008, TC-P-001, TC-P-002, TC-P-003, TC-P-004, TC-P-005, TC-P-006, TC-P-007, TC-P-008, TC-P-009, TC-P-010, TC-P-011, TC-P-012, TC-P-013 |
| 🟡 High | 12 | TC-C-007, TC-C-009, TC-C-010, TC-V-009, TC-V-010, TC-V-011, TC-V-012, TC-P-014, TC-P-015, TC-P-016, TC-P-017, TC-P-018 |
| 🟢 Medium | 2 | TC-C-008, TC-V-013 |
| **TOTAL** | **41** | — |

---

## 7. Vertical Slices

### Slice 1 - Core Recruitment Pipeline (29 cases)
**Cases:** TC-C-001, TC-C-002, TC-C-003, TC-C-004, TC-C-005, TC-C-006, TC-C-007, TC-V-001, TC-V-002, TC-V-003, TC-V-004, TC-V-005, TC-V-006, TC-V-007, TC-V-008, TC-V-011, TC-V-012, TC-P-001, TC-P-002, TC-P-003, TC-P-004, TC-P-005, TC-P-007, TC-P-008, TC-P-009, TC-P-010, TC-P-011, TC-P-012, TC-P-013

### Slice 2 - Extended Coverage (12 cases)
**Cases:** TC-C-008, TC-C-009, TC-C-010, TC-V-009, TC-V-010, TC-V-013, TC-P-006, TC-P-014, TC-P-015, TC-P-016, TC-P-017, TC-P-018

## 8. Business Rules & Test Implications

| Rule | Test Implication | Affected Cases |
|------|---|---|
| Vacancy Name must be unique | Test duplicate error | TC-V-005 |
| Hiring Manager required, autocomplete only | Test "Invalid" error | TC-V-004, TC-V-006 |
| Number of Positions: 1-99 if filled | Test boundary values | TC-V-007, TC-V-008 |
| Resume: .docx/.pdf/.txt ≤1MB | Test file validation | TC-C-004, TC-C-005 |
| Email format: x@y.z | Test format validation | TC-C-002, TC-C-003 |
| **Pipeline fails if Vacancy has no Hiring Manager** | **CRITICAL: Always use Vacancy with Hiring Manager** | TC-P-001 to TC-P-018 |
| Interview Failed & Offer Declined NOT terminal | Test Reject allowed | TC-P-009, TC-P-012 |
| Hired is true terminal state | Test no actions after Hire | TC-P-013 |

---

## 9. Test Data Requirements

### Vacancy Setup
- **Vacancy 1**: "Software Engineer" (Active, Hiring Manager: Valid Employee)
- **Vacancy 2**: "Marketing Manager" (Inactive, Hiring Manager: Valid Employee)
- **Vacancy 3**: "No Manager" (Active, Hiring Manager: N/A) — for negative testing only

### Candidate Data (Traceable Format)
```
Format: auto_recruitment_[timestamp]_[randomID]
Example: auto_recruitment_1721548800_A3F2

Candidate 1: "John Auto_C001" (Software Engineer)
Candidate 2: "Jane Auto_C002" (Marketing Manager)
Candidate 3: "Bob Auto_C003" (Testing pipeline)
```

### Test Execution Order
1. **Phase 1**: TC-V-001 to TC-V-008 (Vacancy setup)
2. **Phase 2**: TC-C-001 to TC-C-007 (Candidate CRUD)
3. **Phase 3**: TC-P-001 → TC-P-003 → TC-P-007 → TC-P-010 → TC-P-013 (Happy Path)
4. **Phase 4**: TC-P-002, TC-P-004 to TC-P-006, TC-P-008, TC-P-009, TC-P-011, TC-P-012 (Edge cases)

---

## 10. Completion Criteria

**Slice 1** (29 of 41 cases):
✅ All automated test cases PASS
✅ Full pipeline flow verified (Application Initiated → Hired)
✅ All critical validations tested (email, resume, numbers, required fields)
✅ All 8 core state actions working
✅ Non-terminal states verified (Reject allowed after Failed/Declined)

---

**Status**: ✅ Test Plan Ready
**Automation Mode**: PLAN (Ready for incremental implementation)
**Tools**: Playwright + TypeScript (POM pattern)
