# MIRAIZ Counseling Page - FAQ Toggle Under Rapid Repeated Clicks (Error Guessing)

## Tags

@e2e @regression @negative @p2

## Data

None. This test does not enter or submit any data — it only clicks an FAQ
toggle button rapidly.

## Preconditions

- The MIRAIZ counseling page is reachable at
  `https://miraiz-persol.jp/counseling` and does not require authentication
  to view.

## Setup

Not required. This test never submits any form or reservation action, so
there is no session, account, or database record to seed beforehand.

## Steps

1. Navigate to `https://miraiz-persol.jp/counseling`.
   - Expected: Heading "よくあるご質問" (level 2) is visible.

2. Read the baseline `aria-expanded` state of the FAQ item
   ("Q. MIRAIZキャリアコーチも無料ですか？").
   - Expected: `aria-expanded` EQUALS `"false"`.

3. Perform 2 rapid consecutive clicks (double-click) on the FAQ toggle
   button with minimal delay between clicks.
   - Expected: After the two clicks settle, `aria-expanded` EQUALS `"false"`
     (an even number of toggles returns to the original state).
   - Note: This exercises the double-click / rapid-repeated-action
     error-guessing rule against a UI toggle instead of a submit button.

4. Perform 1 additional rapid click (3rd click total).
   - Expected: `aria-expanded` EQUALS `"true"` (an odd number of toggles from
     the original state).

5. Take Screenshot of the final state after all rapid clicks.
   - Expected: Screenshot saved showing the FAQ item expanded.

6. Compare the button's `aria-expanded` attribute against its visual
   collapsed/expanded rendering (presence of the `_isClose` CSS class).
   - Expected: `aria-expanded="true"` corresponds to the `_isClose` class
     being absent; no visual/state desync.

## Additional Verification

Not required — all verification is covered in Steps and Critical Validation
Points.

## Cleanup

Not required. No form is submitted and no reservation/account action is
taken; closing the browser context discards the toggled (in-memory only)
expand state.

## Critical Validation Points

1. End state after an even number (2) of rapid toggles (EXACT EQUALS)
   - Expected: `aria-expanded = "false"`
   - Assertion Method: EXACT EQUALS
   - Not Acceptable: `aria-expanded = "true"`, or an unresponsive button
   - Consequence if Wrong: FAIL

2. End state after an odd number (3) of rapid toggles (EXACT EQUALS)
   - Expected: `aria-expanded = "true"`
   - Assertion Method: EXACT EQUALS
   - Not Acceptable: `aria-expanded = "false"` (unchanged from the previous
     step, which would indicate a missed or duplicated click event)
   - Consequence if Wrong: FAIL

3. Visual state vs. `aria-expanded` consistency (EXACT EQUALS)
   - Expected: `_isClose` CSS class present if and only if
     `aria-expanded="false"`
   - Assertion Method: EXACT EQUALS
   - Not Acceptable: `_isClose` class present while `aria-expanded="true"`,
     or vice versa (a rendering/state desync bug)
   - Consequence if Wrong: FAIL

## Notes

- Applies the error-guessing rule for rapid/double-click actions to this FAQ
  toggle, verifying the click handler is not vulnerable to event
  double-firing or race conditions under fast repeated interaction.
- Sourced from direct live exploration of
  `https://miraiz-persol.jp/counseling` on 2026-07-06 (button attributes
  `aria-expanded` and the `_isClose` CSS class were directly observed via
  `outerHTML` before and after toggling — no reservation or form was ever
  submitted).
- Flow: navigate -> confirm baseline collapsed -> double-click (expect
  unchanged) -> one more click (expect expanded) -> assert
  attribute/visual-class consistency.
- No production data is touched: no reservation, account, or session record
  is created by this test.

## Created

- Date: 2026-07-06
- Purpose: Verify the FAQ toggle produces a deterministic, non-desynced end
  state under rapid repeated clicks
- Type: E2E / Regression / Negative
- Includes: error-guessing (rapid/double-click) coverage, `aria-expanded`
  vs. CSS class consistency assertion
