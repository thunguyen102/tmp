# Miraiz Login - "次回から自動でログインする" (Remember Me) Checkbox Is Checked By Default

## Tags

@e2e @smoke @p0

## Data

None. This test does not enter or submit any credentials — it only observes the
default state of the "remember me" checkbox on initial page load, before any
user interaction.

## Preconditions

- The Miraiz login page is reachable at `https://miraiz-persol.jp/common`
  (observed to redirect to `https://miraiz-persol.jp/common/auth/login`).
- The browser context has no pre-existing Miraiz authentication session/cookie
  (fresh context), so the login form renders instead of an authenticated
  redirect.

## Setup

Not required. This test never fills in or submits login credentials, so there
is no session, account, or database record to seed beforehand; the checkbox's
default state comes purely from the page's static Gigya widget configuration.

## Steps

1. Navigate to `https://miraiz-persol.jp/common`.
   - Expected: Browser redirects and the final URL EQUALS
     `https://miraiz-persol.jp/common/auth/login`.

2. Wait for the login form to render.
   - Expected: Heading "ログイン" (level 2) is visible; textbox "メールアドレス"
     and textbox "パスワード" are visible.

3. Take Screenshot of the freshly loaded login form.
   - Expected: Screenshot saved showing the login form with the "remember me"
     checkbox in its default (checked) visual state.

4. Locate the checkbox labeled "次回から自動でログインする".
   - Expected: Checkbox is visible.
   - Note: Underlying element observed as
     `input[name="remember"][data-gigya-name="remember"]`.

5. Read the checkbox's checked state without clicking it.
   - Expected: Checked state EQUALS `true`.

## Additional Verification

Not required — all verification is covered in Steps and Critical Validation
Points.

## Cleanup

Not required. The login form is never submitted, so no server-side session,
cookie, or account record is created; closing the browser context at the end
of the test discards all client-side state with nothing left behind on
production systems.

## Critical Validation Points

1. Default Remember-Me checkbox state (EXACT EQUALS)
   - Expected: `checked = true`
   - Assertion Method: EXACT EQUALS boolean check on the checkbox's checked
     state
   - Not Acceptable: `checked = false`, or an indeterminate/mixed state
   - Consequence if Wrong: FAIL

2. Login page URL after navigation (EXACT EQUALS)
   - Expected: `https://miraiz-persol.jp/common/auth/login`
   - Assertion Method: EXACT EQUALS
   - Not Acceptable: still on `https://miraiz-persol.jp/common` (no redirect
     occurred), or any other path (e.g. an error page)
   - Consequence if Wrong: INCOMPLETE (wrong page loaded, rest of the
     assertion is invalid)

## Notes

- This test locks in the observed default state of the "remember me" checkbox
  so any future change (e.g. defaulting it unchecked for privacy reasons) is
  caught as an intentional product decision rather than an accidental
  regression.
- Sourced from direct live exploration of `https://miraiz-persol.jp/common` on
  2026-07-05 (read-only navigation only — no form was ever filled or
  submitted).
- Flow: navigate to login page -> observe checkbox default state -> assert.
- This test performs zero write/submit actions against production: it never
  fills the email/password fields and never clicks the "ログイン" submit
  button, so it creates no account, session, or login-attempt record.

## Created

- Date: 2026-07-05
- Purpose: Verify the "remember me" checkbox on the Miraiz login page defaults
  to checked on a fresh page load
- Type: E2E / Smoke
- Includes: exact boolean-state assertion, exact URL assertion, zero
  submit/write footprint on production
