# Miraiz Login - Remember Me Checkbox Resets To Default On Reload (No Pre-Submit Persistence)

## Tags

@e2e @regression @negative @p1

## Data

None. This test does not enter or submit any credentials — it only toggles
the checkbox and reloads the page (a plain navigation, not a submission).

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

2. Read the checkbox's baseline checked state.
   - Expected: Checked state EQUALS `true`.

3. Click the "次回から自動でログインする" checkbox once to uncheck it.
   - Expected: Checked state EQUALS `false`.

4. Reload the page (browser reload of the same URL; no form submission is
   performed).
   - Expected: Page reloads; final URL still EQUALS
     `https://miraiz-persol.jp/common/auth/login`; heading "ログイン" (level 2)
     is visible again after reload.

5. Take Screenshot of the reloaded login form.
   - Expected: Screenshot saved showing the login form freshly re-rendered.

6. Re-locate the "次回から自動でログインする" checkbox after reload.
   - Expected: Checkbox is visible.

7. Read the checkbox's checked state after reload.
   - Expected: Checked state EQUALS `true` — the earlier uncheck (step 3) is
     not persisted anywhere, since no login was ever submitted.

## Additional Verification

Not required — all verification is covered in Steps and Critical Validation
Points.

## Cleanup

Not required. The login form is never submitted, so no server-side session,
cookie, or account record is created; the page reload itself is the
mechanism this test uses to prove no client-side persistence exists.

## Critical Validation Points

1. Checkbox state after reload (EXACT EQUALS)
   - Expected: `checked = true`
   - Assertion Method: EXACT EQUALS boolean check
   - Not Acceptable: `checked = false`, which would indicate an unintended
     client-side persistence mechanism (e.g. `localStorage`/cookie) storing an
     un-submitted UI preference
   - Consequence if Wrong: FAIL — this would represent an unexpected
     persistence bug since no submission ever occurred

2. Page reload completes without error (COMPLETE)
   - Expected: Login form fully re-renders with heading "ログイン" visible; no
     authentication error or blank page
   - Assertion Method: COMPLETE
   - Not Acceptable: Error page, blank page, or infinite redirect loop
   - Consequence if Wrong: INCOMPLETE (test cannot validate the checkbox
     state if the form did not re-render)

## Notes

- Confirms the checkbox's checked state is derived fresh from the Gigya
  widget's default configuration on every page load, and is not remembered
  across reloads unless the user actually completes a real login submission
  (intentionally out of scope here, to avoid creating any production
  session/account data).
- Sourced from direct live exploration of `https://miraiz-persol.jp/common` on
  2026-07-05: checkbox was unchecked then the page was reloaded, and the
  checkbox was observed to return to `checked = true`. The "ログイン" submit
  button was never clicked and no credentials were entered at any point.
- Flow: navigate -> confirm default checked -> uncheck -> reload -> assert
  checkbox is back to checked.
- This is a deliberately non-submitting test suite: none of the 5 test cases
  for this feature (TC-01 through TC-05) fill in credentials or click the
  "ログイン" submit button, so no authentication attempt, account-lockout
  counter, or session record is ever created on production.

## Created

- Date: 2026-07-05
- Purpose: Verify the "remember me" checkbox does not persist a toggled value
  across a page reload when no login was ever submitted
- Type: E2E / Regression / Negative
- Includes: exact boolean-state assertion, reload/no-persistence coverage,
  zero submit/write footprint on production
