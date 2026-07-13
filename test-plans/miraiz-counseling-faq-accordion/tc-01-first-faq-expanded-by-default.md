# MIRAIZ Counseling Page - First FAQ Item Is Expanded By Default

## Tags

@e2e @smoke @p0

## Data

None. This test does not enter or submit any data — it only observes the
default state of the FAQ accordion on page load.

## Preconditions

- The MIRAIZ counseling page is reachable at
  `https://miraiz-persol.jp/counseling` and does not require authentication
  to view.
- Discovered via the authenticated MyPage flow: after logging in
  (`MiraizAuthWorkflow.ensureAuthenticatedSession`), the "相談サービス内容を見る"
  button on MyPage navigates to this same `/counseling` page.

## Setup

Not required. This test never submits any form or reservation action, so
there is no session, account, or database record to seed beforehand; the
FAQ's default expanded state comes purely from the page's static component
configuration.

## Steps

1. Navigate to `https://miraiz-persol.jp/counseling`.
   - Expected: Page loads; heading "よくあるご質問" (level 2) is visible in the
     FAQ section.

2. Locate the first FAQ toggle button labeled
   "Q. なぜ無料で提供されているのですか？".
   - Expected: Button is visible.
   - Note: Underlying element observed as
     `button[aria-expanded][aria-controls^="studio-toggle-content-"]`.

3. Take Screenshot of the FAQ section in its default loaded state.
   - Expected: Screenshot saved showing the first FAQ item expanded with its
     answer visible beneath it.

4. Read the button's `aria-expanded` attribute without clicking it.
   - Expected: `aria-expanded` EQUALS `"true"`.

5. Read the visible text of the answer panel referenced by this button's
   `aria-controls` attribute.
   - Expected: Answer panel is visible and its text CONTAINS
     "サービス内のコンテンツの利用に料金はかかりません。"

## Additional Verification

Not required — all verification is covered in Steps and Critical Validation
Points.

## Cleanup

Not required. No form is submitted and no reservation/account action is
taken; closing the browser context discards all client-side state.

## Critical Validation Points

1. Default `aria-expanded` state of the first FAQ item (EXACT EQUALS)
   - Expected: `aria-expanded = "true"`
   - Assertion Method: EXACT EQUALS
   - Not Acceptable: `aria-expanded = "false"`, or attribute missing
   - Consequence if Wrong: FAIL

2. First FAQ answer text is visible on load (EXACT CONTAINS)
   - Expected: Contains
     "サービス内のコンテンツの利用に料金はかかりません。"
   - Assertion Method: EXACT CONTAINS
   - Not Acceptable: Answer panel hidden/collapsed, or empty text
   - Consequence if Wrong: FAIL

## Notes

- This test locks in the observed default state of the FAQ accordion's first
  item so any future change (e.g. defaulting all items collapsed) is caught
  as an intentional product decision rather than an accidental regression.
- Sourced from direct live exploration of
  `https://miraiz-persol.jp/counseling` on 2026-07-06 (read-only — no
  reservation, login form, or any submit action was exercised on this page;
  authentication was only used to reach this page via the MyPage CTA per the
  requested flow, but the page itself does not require it).
- Flow: navigate to `/counseling` -> observe first FAQ item's default
  expanded state -> assert.
- This test performs zero write/submit actions against production: it never
  fills in or submits a reservation, membership, or any form.

## Created

- Date: 2026-07-06
- Purpose: Verify the first FAQ item on the MIRAIZ counseling page defaults
  to expanded on page load
- Type: E2E / Smoke
- Includes: exact `aria-expanded` state assertion, exact answer-text
  containment assertion, zero submit/write footprint on production
