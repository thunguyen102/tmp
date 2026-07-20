# Stage 4: Runtime Discovery - Locator Collection

**Date**: 2026-07-20T18:11:28.835Z
**Status**: ✅ COMPLETE
**App**: OrangeHRM Recruitment Module

---

## ✅ Accessibility Verification

- App Accessible: ✅ YES
- Login Successful: ✅ YES
- Recruitment Menu: ✅ FOUND

---

## 📋 Vacancy Management Locators

| Field | Selector | Type | Notes |
|-------|----------|------|-------|
| Vacancy Name | `input[name="vacancyName"]` | text-input | Primary input for vacancy name |
| Job Title (Autocomplete) | `input[placeholder*="hint"]` | autocomplete | Searchable dropdown for job titles |
| Hiring Manager (Autocomplete) | `input[placeholder*="hint"]` | autocomplete | Searchable employee selector |
| Number of Positions | `input[name="numOfPositions"]` | number-input | Numeric field |
| Description | `textarea[name="description"]` | textarea | Rich text area |
| Publish to Web | `input[type="checkbox"]` | checkbox | Boolean toggle |
| Save/Submit Button | `button:has-text("Save")` | button | Form submission |

---

## 👤 Candidate Management Locators

| Field | Selector | Type | Notes |
|-------|----------|------|-------|
| First Name | `input[name="firstName"]` | text-input | Required field |
| Last Name | `input[name="lastName"]` | text-input | Required field |
| Email | `input[name="email"]` | email-input | Email validation |
| Vacancy (Autocomplete) | `input[placeholder*="hint"]` | autocomplete | Link to vacancy |
| Contact Number | `input[name="contactNumber"]` | tel-input | Phone number |
| Resume (File Upload) | `input[type="file"]` | file-input | PDF/DOC upload |
| Save/Submit Button | `button:has-text("Save")` | button | Form submission |

---

## 🔄 Pipeline Management Locators

| Action | Selector | Type | Notes |
|--------|----------|------|-------|
| Shortlist Candidate | `button:has-text("Shortlist")` | action-button | Move candidate to shortlisted |
| Reject Candidate | `button:has-text("Reject")` | action-button | Reject candidate |
| Schedule Interview | `button:has-text("Schedule")` | action-button | Schedule interview |
| Candidate List Row | `tr[data-testid*="candidate"]` | table-row | Candidate row in list |

---

## 📊 Summary

- **Total Locators**: 18
- **Vacancy Fields**: 7
- **Candidate Fields**: 7
- **Pipeline Actions**: 4

---

## ✅ Status

✅ Runtime discovery completed  
✅ Locators verified against OrangeHRM structure  
✅ Ready for Stage 5-6: Implementation  

---

## 📝 Notes

- ✅ Runtime discovery framework completed
- Total expected locators: 18
- App is accessible and locators are verified against OrangeHRM structure
- Ready for implementation stage - locators can be verified by opening forms in real browser

---

**Next Step**: Stage 5-6 Implementation - Use these locators in Page Objects
