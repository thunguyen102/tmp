/**
 * Base Page Object
 * Provides common functionality for all page objects
 */

import { Page } from "@playwright/test";

export class BasePage {
  public page: Page;

  constructor(page: Page) {
    this.page = page;
  }
}
