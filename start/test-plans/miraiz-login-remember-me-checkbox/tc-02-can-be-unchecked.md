# Miraiz Login - Remember Me Checkbox Can Be Unchecked By The User

## Tags

@e2e @regression @p2

## Data

None. This test does not enter or submit any credentials — it only toggles
the "remember me" checkbox before any submission.

## Preconditions

- The Miraiz login page is reachable at `https://miraiz-persol.jp/common`
  (redirects to `https://miraiz-persol.jp/common/auth/login`).
- The browser context has no pre-existing Miraiz authentication session.

## Setup

Not required. This test never fills in or submits login credentials, so there
is no session, account, or database record to seed beforehand.

## Steps

1. Navigate to `https://miraiz-persol.jp/common`.
   - Expected: Final URL EQUALS `https://miraiz-persol.jp/common/auth/login`.

2. Locate the checkbox labeled "次回から自動でログインする" and read its
   baseline state.
   - Expected: Checked state EQUALS `true` (baseline, per TC-01).

3. Click the "次回から自動でログインする" checkbox once.
   - Expected: Checked state changes to `false` immediately, with no page
     navigation and no full page reload.

4. Take Screenshot showing the unchecked state.
   - Expected: Screenshot saved showing the checkbox rendered as unchecked.

5. Re-read the checkbox's checked state after the click.
   - Expected: Checked state EQUALS `false`.

## Additional Verification

Not required — all verification is covered in Steps and Critical Validation
Points.

## Cleanup

Not required. The login form is never submitted, so no server-side session,
cookie, or account record is created; closing the browser context discards
the toggled (in-memory only) checkbox value.

## Critical Validation Points

1. Checkbox state after a single click (EXACT EQUALS)
   - Expected: `checked = false`
   - Assertion Method: EXACT EQUALS boolean check on the checkbox's checked
     state
   - Not Acceptable: `checked = true` (click had no effect), or an
     indeterminate state
   - Consequence if Wrong: FAIL

2. No navigation occurs on toggle (EXACT EQUALS)
   - Expected: URL remains `https://miraiz-persol.jp/common/auth/login`,
     unchanged from before the click
   - Assertion Method: EXACT EQUALS
   - Not Acceptable: URL changes, or a full page reload is triggered by the
     click
   - Consequence if Wrong: FAIL (would indicate the checkbox unexpectedly
     triggers navigation or a form submission side effect)

## Notes

- Validates that unchecking the box is a pure front-end state flip with no
  submit/navigation side effect, ahead of any real login submission.
- Sourced from direct live exploration of `https://miraiz-persol.jp/common` on
  2026-07-05 (checkbox toggled only — the "ログイン" submit button was never
  clicked and no credentials were entered).
- Flow: navigate -> confirm default checked -> click once -> assert unchecked.
- No production data is touched: no account, session, or login-attempt record
  is created by this test.

## Created

- Date: 2026-07-05
- Purpose: Verify the "remember me" checkbox can be unchecked by the user
  without side effects
- Type: E2E / Regression
- Includes: exact boolean-state assertion, exact URL/no-navigation assertion
