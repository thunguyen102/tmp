# MIRAIZ Counseling Page - Expanding One FAQ Item Does Not Collapse Other Open Items

## Tags

@e2e @regression @p1

## Data

None. This test does not enter or submit any data — it only toggles two
independent FAQ items.

## Preconditions

- The MIRAIZ counseling page is reachable at
  `https://miraiz-persol.jp/counseling` and does not require authentication
  to view.
- The first FAQ item ("Q. なぜ無料で提供されているのですか？") is expanded by
  default on page load (per TC-01).

## Setup

Not required. This test never submits any form or reservation action, so
there is no session, account, or database record to seed beforehand.

## Steps

1. Navigate to `https://miraiz-persol.jp/counseling`.
   - Expected: Heading "よくあるご質問" (level 2) is visible.

2. Read the baseline `aria-expanded` state of the first FAQ item
   ("Q. なぜ無料で提供されているのですか？").
   - Expected: `aria-expanded` EQUALS `"true"` (default expanded, per TC-01).

3. Read the baseline `aria-expanded` state of a second, different FAQ item
   ("Q. MIRAIZキャリアコーチも無料ですか？").
   - Expected: `aria-expanded` EQUALS `"false"` (default collapsed).

4. Click the second FAQ item ("Q. MIRAIZキャリアコーチも無料ですか？") to
   expand it.
   - Expected: Second FAQ item's `aria-expanded` EQUALS `"true"`.

5. Take Screenshot showing both FAQ items expanded simultaneously.
   - Expected: Screenshot saved showing both the first and second FAQ
     items' answer panels visible at the same time.

6. Re-read the first FAQ item's `aria-expanded` state (the one that was
   already open before step 4).
   - Expected: `aria-expanded` STILL EQUALS `"true"` — unaffected by
     expanding the second item.

## Additional Verification

Not required — all verification is covered in Steps and Critical Validation
Points.

## Cleanup

Not required. No form is submitted and no reservation/account action is
taken; closing the browser context discards the toggled (in-memory only)
expand state.

## Critical Validation Points

1. First FAQ item's `aria-expanded` state after expanding the second item
   (EXACT EQUALS)
   - Expected: `aria-expanded = "true"` (unchanged from baseline)
   - Assertion Method: EXACT EQUALS
   - Not Acceptable: `aria-expanded = "false"` — this would indicate the
     component was changed into a single-open accordion (mutually exclusive
     items), a real behavioral regression from what is currently observed
     in production
   - Consequence if Wrong: FAIL

2. Second FAQ item's `aria-expanded` state after being clicked (EXACT
   EQUALS)
   - Expected: `aria-expanded = "true"`
   - Assertion Method: EXACT EQUALS
   - Not Acceptable: `aria-expanded = "false"` (click had no effect)
   - Consequence if Wrong: FAIL

## Notes

- This is the standout test in this set: it locks in a non-obvious, directly
  observed business rule — the FAQ items are **independent toggles**, not a
  single-open accordion. Expanding one item does not collapse any other
  already-open item.
- Sourced from direct live exploration of
  `https://miraiz-persol.jp/counseling` on 2026-07-06: the first FAQ item was
  observed expanded by default (`aria-expanded="true"`), the second FAQ item
  was then clicked to expand it, and the first item's `aria-expanded`
  attribute was re-read and confirmed still `"true"` — no reservation or
  form was ever submitted.
- Flow: navigate -> confirm first item expanded, second collapsed -> expand
  second item -> assert first item remains expanded.
- If a future implementation changes this component into a true accordion
  (single-open), this test is expected to fail and should be treated as an
  intentional product decision requiring test update, not silently ignored.
- No production data is touched: no reservation, account, or session record
  is created by this test.

## Created

- Date: 2026-07-06
- Purpose: Verify the FAQ accordion allows multiple items to be expanded at
  once, guarding against an accidental regression into single-open accordion
  behavior
- Type: E2E / Regression
- Includes: multi-toggle independence assertion, exact `aria-expanded`
  assertions across two items
