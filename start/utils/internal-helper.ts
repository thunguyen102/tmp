/**
 * Internal Helper Functions
 * Used by dom-helper.ts and other utilities
 */

import type { Page, Locator } from "@playwright/test";

/**
 * Converts a selector string or Locator into a Locator object.
 * If input is already a Locator, returns it as-is.
 * If input is a string, creates a Locator from the page.
 *
 * @param page Playwright Page
 * @param target CSS selector string or Locator
 * @returns Locator object
 */
export function resolveLocator(
  page: Page,
  target: string | Locator,
): Locator {
  return typeof target === "string" ? page.locator(target) : target;
}
