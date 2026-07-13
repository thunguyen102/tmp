# MIRAIZ Counseling Page - A Collapsed FAQ Item Can Be Expanded By Clicking It

## Tags

@e2e @regression @p2

## Data

None. This test does not enter or submit any data — it only clicks an FAQ
toggle button.

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

2. Locate the FAQ toggle button labeled
   "Q. MIRAIZキャリアコーチも無料ですか？" and read its baseline state.
   - Expected: `aria-expanded` EQUALS `"false"` (baseline, collapsed by
     default).

3. Click the "Q. MIRAIZキャリアコーチも無料ですか？" button once.
   - Expected: `aria-expanded` changes to `"true"` immediately, with no page
     navigation and no full page reload.

4. Take Screenshot showing the expanded state.
   - Expected: Screenshot saved showing this FAQ item's answer panel visible.

5. Re-read the button's `aria-expanded` attribute after the click.
   - Expected: `aria-expanded` EQUALS `"true"`.

6. Read the answer panel referenced by this button's `aria-controls`
   attribute.
   - Expected: Answer panel is visible (non-empty rendered text).

## Additional Verification

Not required — all verification is covered in Steps and Critical Validation
Points.

## Cleanup

Not required. No form is submitted and no reservation/account action is
taken; closing the browser context discards the toggled (in-memory only)
expand state.

## Critical Validation Points

1. `aria-expanded` state after a single click (EXACT EQUALS)
   - Expected: `aria-expanded = "true"`
   - Assertion Method: EXACT EQUALS
   - Not Acceptable: `aria-expanded = "false"` (click had no effect)
   - Consequence if Wrong: FAIL

2. No navigation occurs on toggle (EXACT EQUALS)
   - Expected: URL remains `https://miraiz-persol.jp/counseling`, unchanged
     from before the click
   - Assertion Method: EXACT EQUALS
   - Not Acceptable: URL changes, or a full page reload is triggered
   - Consequence if Wrong: FAIL (would indicate the FAQ toggle unexpectedly
     triggers navigation)

## Notes

- Validates that expanding a collapsed FAQ item is a pure front-end state
  flip with no submit/navigation side effect.
- Sourced from direct live exploration of
  `https://miraiz-persol.jp/counseling` on 2026-07-06 (FAQ button clicked
  only — no reservation or form was ever submitted).
- Flow: navigate -> confirm baseline collapsed -> click once -> assert
  expanded.
- No production data is touched: no reservation, account, or session record
  is created by this test.

## Created

- Date: 2026-07-06
- Purpose: Verify a collapsed FAQ item can be expanded by the user without
  side effects
- Type: E2E / Regression
- Includes: exact `aria-expanded` assertion, exact URL/no-navigation
  assertion
