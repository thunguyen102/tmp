import { Locator, Page } from "@playwright/test";

/**
 * mail.tm always auto-signs a fresh visit into a random throwaway inbox
 * (account icon shows "Sign out" immediately, no visible login form). The
 * real login form only opens via Account → Login, and its email field is
 * input[name="address"] (NOT input[type="email"], which is the unrelated,
 * always-present temp-address widget). Verified against the live site.
 */
export const MailTmSelectors = {
  accountButtonName: "Account",
  backLinkText: /^Back$/i,
  closeAdButtonId: "#dismiss-button",
  closeAdButtonText: /close ad/i,
  skipAdButtonText: /skip ad/i,
  stickyCloseAdButton: '.fs-close-button[aria-label="Close Ad"]',
  closeAdButtonAria: '[aria-label="Close ad"], [aria-label="Close Ad"]',
  adContainerSelectors:
    '#gpt_unit_/15184186,22758166583/mail.tm_interstitial_0, [id^="google_ads_iframe_"], .fs-sticky-slot, .fs-sticky-footer, .fs-sticky-footer-container, .GoogleActiveViewElement',
  inboxHeadingText: /^Inbox$/i,
  loginLinkText: "Login",
  loginSubmitButtonName: "Login",
  emailInput: 'input[name="address"]',
  passwordInput: 'input[name="password"]',
  refreshText: /refresh|更新/i,
  loginModalHeading: "Log in to your account",
  loginErrorText: /error:/i,
  accountAddressText: "p.cursor-pointer.select-all",
  messageLinks: 'a[href*="/en/view/"]',
  emailAddressPattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  verificationCodePattern: /(?<!\d)\d{4,8}(?!\d)/,

  getAccountButton: (page: Page): Locator =>
    page.getByRole("button", { name: MailTmSelectors.accountButtonName }),
  getBackToInboxLink: (page: Page): Locator =>
    page.getByRole("link", { name: MailTmSelectors.backLinkText }).first(),
  getCloseAdButtonById: (page: Page): Locator =>
    page.locator(MailTmSelectors.closeAdButtonId),
  getStickyCloseAdButton: (page: Page): Locator =>
    page.locator(MailTmSelectors.stickyCloseAdButton).first(),
  getCloseAdButton: (page: Page): Locator =>
    page.getByRole("button", { name: MailTmSelectors.closeAdButtonText }).first(),
  getSkipAdButton: (page: Page): Locator =>
    page.getByRole("button", { name: MailTmSelectors.skipAdButtonText }).first(),
  getCloseAdButtonByAria: (page: Page): Locator =>
    page.locator(MailTmSelectors.closeAdButtonAria).first(),
  getInboxHeading: (page: Page): Locator =>
    page.getByRole("heading", { name: MailTmSelectors.inboxHeadingText }).first(),
  getLoginLink: (page: Page): Locator =>
    page.getByText(MailTmSelectors.loginLinkText, { exact: true }).first(),
  getEmailInput: (page: Page): Locator => page.locator(MailTmSelectors.emailInput),
  getPasswordInput: (page: Page): Locator => page.locator(MailTmSelectors.passwordInput),
  getLoginSubmitButton: (page: Page): Locator =>
    page.getByRole("button", { name: MailTmSelectors.loginSubmitButtonName, exact: true }),
  getLoginModalHeading: (page: Page): Locator =>
    page.getByText(MailTmSelectors.loginModalHeading),
  getLoginErrorMessage: (page: Page): Locator =>
    page.getByText(MailTmSelectors.loginErrorText),
  // Address text is blurred/masked until clicked once to reveal it.
  getAccountAddressText: (page: Page): Locator =>
    page.locator(MailTmSelectors.accountAddressText).first(),
  getRefreshButton: (page: Page): Locator =>
    page.getByText(MailTmSelectors.refreshText).first(),
  getMessageCandidates: (page: Page): Locator =>
    page.locator(MailTmSelectors.messageLinks),
  getMessageViewFrame: (page: Page): Locator => page.locator("main iframe").first(),
};
