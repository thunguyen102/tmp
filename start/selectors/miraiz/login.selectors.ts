import { Locator, Page } from "@playwright/test";

export const MiraizLoginSelectors = {
  emailLabel: /メールアドレス/i,
  passwordLabel: /パスワード|password/i,
  // Exclude Gigya's hidden screenset "template" duplicates.
  codeInput:
    'input[name="verificationCode"]:not([data-screenset-roles="template"]), input[name="code"]:not([data-screenset-roles="template"]), input[autocomplete="one-time-code"]:not([data-screenset-roles="template"]), input[inputmode="numeric"]:not([data-screenset-roles="template"]), input[type="tel"]:not([data-screenset-roles="template"]), input[type="text"]:not([data-screenset-roles="template"])',
  loginButtonName: /ログイン|login|sign in/i,
  verifyButtonName: /認証|確認|送信|次へ|verify|submit|continue/i,
  logoutText: /ログアウト|logout/i,
  loggedOutText: /ログアウトしました|logged out/i,
  myPageText: /マイページ|mypage|dashboard/i,

  // Gigya often renders hidden template clones; prefer the visible live field
  // by stable Gigya attributes before falling back to accessible selectors.
  getEmailInput: (page: Page): Locator =>
    page
      .locator(
        [
          'input[data-gigya-name="loginID"]:visible',
          'input[name="username"]:visible',
          'input[type="email"]:visible',
        ].join(", "),
      )
      .first(),
  getPasswordInput: (page: Page): Locator =>
    page
      .locator(
        [
          'input[data-gigya-name="password"]:visible',
          'input[name="password"]:visible',
          'input[type="password"]:visible',
        ].join(", "),
      )
      .first(),
  getLoginButton: (page: Page): Locator =>
    page.getByRole("button", { name: MiraizLoginSelectors.loginButtonName }).first(),
  getCodeInput: (page: Page): Locator =>
    page.locator(MiraizLoginSelectors.codeInput).last(),
  getVerifyCodeButton: (page: Page): Locator =>
    page.getByRole("button", { name: MiraizLoginSelectors.verifyButtonName }).last(),
  getLogoutButton: (page: Page): Locator =>
    page.getByText(MiraizLoginSelectors.logoutText).first(),
  getLoggedOutHeading: (page: Page): Locator =>
    page.getByText(MiraizLoginSelectors.loggedOutText).first(),
  getPageBody: (page: Page): Locator => page.locator("body"),
};
