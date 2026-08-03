# Field-Level Validation Checklist

Use this checklist with `qa-generate-testcases` when a form or UI contains input fields. Review each field and apply only the checks that match its type and documented rules. Do not use the same validation set for every field, and do not combine unrelated field validations in one test case.

| Field Type | Validation Checks to Consider |
|---|---|
| **Text (Name, Address, etc.)** | Required or optional; minimum and maximum length; whitespace-only value; allowed or blocked special characters such as `<>&"'`; XSS input such as `<script>alert(1)</script>`; SQL-like input such as `' OR 1=1--`; Unicode or emoji; leading and trailing spaces. |
| **Email** | Valid format such as `user@domain.com`; missing `@`; missing domain; invalid domain; multiple `@` characters; allowed special characters before `@`; maximum length; case handling; duplicate email when the value must be unique. |
| **Phone** | Digits only when required; valid prefix such as `+84` or `0`; minimum and maximum length; mixed letters; separators such as `-`, `.`, or spaces; invalid country or area code. |
| **Date / DateTime** | Required format such as `dd/MM/yyyy` or ISO; invalid date such as `31/02`; leap day such as `29/02/2024`; past or future date rules; minimum and maximum dates; time zone behavior when applicable. |
| **Number / Currency** | Minimum and maximum values; negative value; zero; decimal value and decimal precision; non-numeric characters; very large value or overflow; leading zeros; currency separators and display format. |
| **Dropdown / Select** | Default value; valid options; disabled options; selection change; required behavior when no value is selected; dependent options when applicable. |
| **Checkbox / Radio** | Default state; select and clear behavior; required selection; radio-group rule that allows only one option; enabled and disabled states. |
| **File Upload** | Allowed and blocked file types; maximum size; empty file; special characters in the file name; multiple files when supported; drag-and-drop compared with the file picker; upload failure and retry when specified. |
| **Password** | Minimum and maximum length; required uppercase, lowercase, number, and special character rules; blocked or allowed copy and paste; show and hide behavior; matching and non-matching confirmation. |
| **Textarea** | Maximum length; line breaks; HTML tags; resize behavior when supported; character counter; leading and trailing spaces. |

## Application Rules

- Confirm the field type and documented business rule before selecting checks.
- Do not create a test for a limit, format, or message that was not defined. Add an open question instead.
- Use concrete values in each selected test case.
- Keep one independent validation purpose per test case when combining checks would make the failure unclear.
- Write all generated test cases and notes in English.
