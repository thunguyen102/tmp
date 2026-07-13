# Miraiz Login - Remember Me Checkbox Can Be Re-Checked After Unchecking (State Transition)

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

2. Read the checkbox's baseline checked state.
   - Expected: Checked state EQUALS `true` (state: `idle-checked`).

3. Click the "次回から自動でログインする" checkbox once.
   - Expected: Checked state transitions `idle-checked -> unchecked`; checked
     state EQUALS `false`.

4. Click the "次回から自動でログインする" checkbox a second time.
   - Expected: Checked state transitions `unchecked -> checked`; checked state
     EQUALS `true` again.

5. Take Screenshot of the final re-checked state.
   - Expected: Screenshot saved showing the checkbox rendered as checked.

## Additional Verification

Not required — all verification is covered in Steps and Critical Validation
Points.

## Cleanup

Not required. The login form is never submitted, so no server-side session,
cookie, or account record is created; closing the browser context discards
the toggled (in-memory only) checkbox value.

## Critical Validation Points

1. Checked state after the first click (EXACT EQUALS)
   - Expected: `checked = false`
   - Assertion Method: EXACT EQUALS boolean check
   - Not Acceptable: `checked = true` (no state change registered)
   - Consequence if Wrong: FAIL

2. Checked state after the second click, i.e. the full round-trip
   (EXACT EQUALS)
   - Expected: `checked = true`
   - Assertion Method: EXACT EQUALS boolean check
   - Not Acceptable: `checked = false` (checkbox got stuck unchecked, or the
     second click was not registered)
   - Consequence if Wrong: FAIL

## Notes

- Validates the checkbox behaves as a standard idempotent binary toggle
  (`checked -> unchecked -> checked`), guarding against a click-handler bug
  that could cause it to get stuck or invert incorrectly across repeated
  toggles.
- Sourced from direct live exploration of `https://miraiz-persol.jp/common` on
  2026-07-05 (checkbox toggled twice only — the "ログイン" submit button was
  never clicked and no credentials were entered).
- Flow: navigate -> confirm default checked -> click (unchecked) -> click
  again (checked) -> assert final state.
- No production data is touched: no account, session, or login-attempt record
  is created by this test.

## Created

- Date: 2026-07-05
- Purpose: Verify the "remember me" checkbox toggle is reversible across a
  full checked -> unchecked -> checked cycle
- Type: E2E / Regression
- Includes: state-transition coverage, exact boolean-state assertions at each
  transition
