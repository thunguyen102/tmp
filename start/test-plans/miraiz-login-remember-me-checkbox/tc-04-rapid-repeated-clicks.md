# Miraiz Login - Remember Me Checkbox Under Rapid Repeated Clicks (Error Guessing)

## Tags

@e2e @regression @negative @p2

## Data

None. This test does not enter or submit any credentials — it only clicks the
"remember me" checkbox rapidly before any submission.

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

3. Perform 2 rapid consecutive clicks (double-click) on the
   "次回から自動でログインする" checkbox with minimal delay between clicks.
   - Expected: After the two clicks settle, checked state EQUALS `true` (an
     even number of toggles returns to the original state).
   - Note: This exercises the double-click / rapid-repeated-action
     error-guessing rule against a UI toggle instead of a submit button.

4. Perform 1 additional rapid click (3rd click total).
   - Expected: Checked state EQUALS `false` (an odd number of toggles from
     the original state).

5. Take Screenshot of the final state after all rapid clicks.
   - Expected: Screenshot saved showing the checkbox unchecked.

6. Compare the checkbox's rendered visual state against its underlying
   `checked` DOM property.
   - Expected: The rendered visual state (checked/unchecked appearance)
     EQUALS the underlying `checked` DOM property with no desync.

## Additional Verification

Not required — all verification is covered in Steps and Critical Validation
Points.

## Cleanup

Not required. The login form is never submitted, so no server-side session,
cookie, or account record is created; closing the browser context discards
the toggled (in-memory only) checkbox value.

## Critical Validation Points

1. End state after an even number (2) of rapid toggles (EXACT EQUALS)
   - Expected: `checked = true`
   - Assertion Method: EXACT EQUALS boolean check
   - Not Acceptable: `checked = false`, or an indeterminate/unresponsive
     checkbox
   - Consequence if Wrong: FAIL

2. End state after an odd number (3) of rapid toggles (EXACT EQUALS)
   - Expected: `checked = false`
   - Assertion Method: EXACT EQUALS boolean check
   - Not Acceptable: `checked = true` (unchanged from the previous step,
     which would indicate a missed or duplicated click event)
   - Consequence if Wrong: FAIL

3. Visual state vs. DOM state consistency (EXACT EQUALS)
   - Expected: Rendered checkbox appearance matches the `checked` DOM
     property exactly
   - Assertion Method: EXACT EQUALS
   - Not Acceptable: Visual shows checked while the DOM property is `false`,
     or vice versa (a rendering/state desync bug)
   - Consequence if Wrong: FAIL

## Notes

- Applies the error-guessing rule for rapid/double-click actions to this UI
  toggle, verifying the click handler is not vulnerable to event
  double-firing or race conditions under fast repeated interaction.
- Sourced from direct live exploration of `https://miraiz-persol.jp/common` on
  2026-07-05 (checkbox clicked rapidly only — the "ログイン" submit button was
  never clicked and no credentials were entered).
- Flow: navigate -> confirm default checked -> double-click (expect
  unchanged) -> one more click (expect flipped) -> assert visual/DOM
  consistency.
- No production data is touched: no account, session, or login-attempt record
  is created by this test.

## Created

- Date: 2026-07-05
- Purpose: Verify the "remember me" checkbox produces a deterministic,
  non-desynced end state under rapid repeated clicks
- Type: E2E / Regression / Negative
- Includes: error-guessing (rapid/double-click) coverage, visual/DOM state
  consistency assertion
