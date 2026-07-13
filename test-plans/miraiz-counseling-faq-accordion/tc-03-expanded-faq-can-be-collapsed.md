# MIRAIZ Counseling Page - An Expanded FAQ Item Can Be Collapsed Again (State Transition)

## Tags

@e2e @regression @p2

## Data

None. This test does not enter or submit any data — it only toggles an FAQ
item twice.

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
   - Expected: `aria-expanded` EQUALS `"false"` (state: `idle-collapsed`).

3. Click the button once.
   - Expected: State transitions `idle-collapsed -> expanded`;
     `aria-expanded` EQUALS `"true"`.

4. Click the same button a second time.
   - Expected: State transitions `expanded -> collapsed`; `aria-expanded`
     EQUALS `"false"` again.

5. Take Screenshot of the final re-collapsed state.
   - Expected: Screenshot saved showing the FAQ item collapsed (answer panel
     hidden).

## Additional Verification

Not required — all verification is covered in Steps and Critical Validation
Points.

## Cleanup

Not required. No form is submitted and no reservation/account action is
taken; closing the browser context discards the toggled (in-memory only)
expand state.

## Critical Validation Points

1. `aria-expanded` state after the first click (EXACT EQUALS)
   - Expected: `aria-expanded = "true"`
   - Assertion Method: EXACT EQUALS
   - Not Acceptable: `aria-expanded = "false"` (no state change registered)
   - Consequence if Wrong: FAIL

2. `aria-expanded` state after the second click, i.e. the full round-trip
   (EXACT EQUALS)
   - Expected: `aria-expanded = "false"`
   - Assertion Method: EXACT EQUALS
   - Not Acceptable: `aria-expanded = "true"` (FAQ item got stuck expanded,
     or the second click was not registered)
   - Consequence if Wrong: FAIL

## Notes

- Validates the FAQ toggle behaves as a standard idempotent binary control
  (`collapsed -> expanded -> collapsed`), guarding against a click-handler
  bug that could cause it to get stuck or invert incorrectly across repeated
  toggles.
- Sourced from direct live exploration of
  `https://miraiz-persol.jp/counseling` on 2026-07-06 (FAQ button toggled
  twice only — no reservation or form was ever submitted).
- Flow: navigate -> confirm baseline collapsed -> click (expanded) -> click
  again (collapsed) -> assert final state.
- No production data is touched: no reservation, account, or session record
  is created by this test.

## Created

- Date: 2026-07-06
- Purpose: Verify an expanded FAQ item is reversible across a full
  collapsed -> expanded -> collapsed cycle
- Type: E2E / Regression
- Includes: state-transition coverage, exact `aria-expanded` assertions at
  each transition
