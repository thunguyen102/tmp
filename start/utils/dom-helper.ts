/**
 * DOM Helpers — Playwright × TypeScript (Best Practice)
 *
 * Purpose:
 * - Stable, readable actions around common DOM ops (click, fill, navigate…)
 * - Reduce flakiness with built-in waits & clearer intent
 *
 * Implemented now (names match implementations below):
 *  - safeClick(target, timeout?)                // click with auto-wait (visible, enabled, scrolled; retry once)
 *  - safeFill(target, text, timeout?)           // replace content with waits (visible + enabled)
 *  - safeGoto(url, waitFor?, opts?)             // navigate then optionally wait for target visible
 *
 * Notes:
 * - All helpers are async and side-effect limited to the intended action.
 * - Accept both selector strings and Locators; actions are always performed on Locators.
 * - Built-in waits: visible/enabled/scrollIntoView where relevant to reduce flakiness.
 * - Prefer Locator-first waits (`locator.waitFor`) over `page.waitForSelector` to avoid stale handles.
 * - Keep helpers UI-agnostic; business/workflow logic belongs in /workflows.
 */

import { expect } from "@playwright/test";
import { TIMEOUT } from "@/constants/timeout";
import { resolveLocator } from "./internal-helper";
import type { Page, Locator } from "@playwright/test";

/**
 * Converts input to Locator, waits until it is visible, then returns the Locator.
 * Uses Locator-only waiting to avoid stale ElementHandle issues.
 * @param page Playwright Page
 * @param target CSS selector or Locator to wait on
 * @param timeout Timeout in ms (defaults to TIMEOUT.ELEMENT_VISIBLE)
 */
async function waitVisibleAndGetLocator(
  page: Page,
  target: string | Locator,
  timeout: number = TIMEOUT.ELEMENT_VISIBLE,
): Promise<Locator> {
  const loc = resolveLocator(page, target);
  await loc.waitFor({ state: "visible", timeout });
  return loc;
}

/**
 * Navigates to a URL and (optionally) waits for a target (selector/Locator) to become visible.
 * Prefer waiting for a concrete UI condition rather than generic network idle.
 *
 * @param page Playwright Page
 * @param url Absolute or relative URL
 * @param waitFor Optional selector/Locator to wait visible after navigation
 * @param opts Optional timeouts: navTimeout (goto), visibleTimeout (post-nav wait)
 */
export async function safeGoto(
  page: Page,
  url: string,
  waitFor?: string | Locator,
  {
    navTimeout = TIMEOUT.PAGE_LOAD,
    visibleTimeout = TIMEOUT.ELEMENT_VISIBLE,
  }: { navTimeout?: number; visibleTimeout?: number } = {},
) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: navTimeout });
  if (waitFor) {
    const loc = resolveLocator(page, waitFor);
    await loc.waitFor({ state: "visible", timeout: visibleTimeout });
  }
}

/**
 * Clicks an element safely:
 * - Waits: visible + enabled + scrolled into view
 * - Action: click
 * - Retry: one retry after QUICK_ACTION delay (handles minor transient issues)
 *
 * @param page Playwright Page
 * @param target Selector or Locator to click
 * @param timeout Timeout for visibility/enabled checks
 */
export async function safeClick(
  page: Page,
  target: string | Locator,
  timeout: number = TIMEOUT.ELEMENT_VISIBLE,
) {
  // Ensure element is visible & enabled
  let locator = await waitVisibleAndGetLocator(page, target, timeout);
  await expect(locator).toBeEnabled({ timeout });

  // Avoid off-screen / layout shift issues
  await locator.scrollIntoViewIfNeeded();

  // Dry-run click → verify really clickable (no overlay/animation)
  try {
    await locator.click({ trial: true, timeout });
  } catch {
    await page.waitForLoadState("networkidle");
  }

  // Real click with single retry (handles re-render / late enable)
  try {
    await locator.click({ timeout });
  } catch {
    locator = await waitVisibleAndGetLocator(page, target, timeout);
    await expect(locator).toBeEnabled({ timeout });
    await locator.click({ timeout });
  }
}

/**
 * Replaces input content safely (uses locator.fill):
 * - Waits: visible + enabled
 * - Action: fill(value)
 *
 * @param page Playwright Page
 * @param target Selector or Locator for input/textarea/contentEditable
 * @param value New value to set (replaces existing content)
 * @param timeout Timeout for waits
 */
export async function safeFill(
  page: Page,
  target: string | Locator,
  value: string,
  timeout: number = TIMEOUT.ELEMENT_VISIBLE,
) {
  const locator = await waitVisibleAndGetLocator(page, target, timeout);
  await expect(locator).toBeEnabled({ timeout });
  await locator.fill(value, { timeout });
}
