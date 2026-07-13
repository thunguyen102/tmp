import { expect, Page } from "@playwright/test";

import { BasePage } from "@/pages/base/base.page";
import { safeClick, safeFill, safeGoto } from "@/utils/dom-helper";
import { TIMEOUT, URLS } from "@/constants";
import { MiraizLoginSelectors as Sel } from "@/selectors/miraiz/login.selectors";

const AUTH_OBSERVED_KEY = "__miraizAuthenticatedObserved";

export class MiraizLoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await safeGoto(this.page, URLS.MIRAIZ.LOGIN, undefined, {
      navTimeout: TIMEOUT.PAGE_LOAD,
    });
  }

  async waitForLoginFormReady(): Promise<void> {
    await Sel.getEmailInput(this.page).waitFor({
      state: "visible",
      timeout: TIMEOUT.LOGIN_FORM_APPEAR,
    });
  }

  async login(email: string, password: string): Promise<void> {
    await safeFill(this.page, Sel.getEmailInput(this.page), email);
    await safeFill(this.page, Sel.getPasswordInput(this.page), password);
    await safeClick(this.page, Sel.getLoginButton(this.page));
  }

  async waitForCodeVerificationForm(): Promise<void> {
    await Sel.getCodeInput(this.page).waitFor({
      state: "visible",
      timeout: TIMEOUT.CODE_VERIFICATION_WAIT,
    });
  }

  /**
   * After submitting login credentials, the site sometimes recognizes the
   * device/session as already valid and skips straight to the authenticated
   * landing page instead of showing the OTP form (e.g. when a prior
   * REUSE_SESSION run left a still-valid session that the pre-submit
   * isLoggedIn() check narrowly missed due to timing). Race both outcomes
   * instead of only waiting on the OTP input, so that case is detected
   * instead of timing out.
   */
  async waitForCodeVerificationFormOrAuthenticated(): Promise<
    "code" | "authenticated"
  > {
    const codeVisible: Promise<"code"> = Sel.getCodeInput(this.page)
      .waitFor({ state: "visible", timeout: TIMEOUT.CODE_VERIFICATION_WAIT })
      .then(() => "code");
    const authenticated: Promise<"authenticated"> =
      this.waitForAuthenticatedLanding().then(() => "authenticated");

    return Promise.race([
      codeVisible.catch(() => authenticated),
      authenticated.catch(() => codeVisible),
    ]);
  }

  async verifyCode(code: string): Promise<void> {
    await safeFill(this.page, Sel.getCodeInput(this.page), code);
    await safeClick(this.page, Sel.getVerifyCodeButton(this.page));
  }

  async expectLoggedIn(): Promise<void> {
    await this.waitForAuthenticatedLanding();
    this.markAuthenticatedObserved();
  }

  async hasAuthenticatedEvidence(): Promise<boolean> {
    return this.getAuthenticatedObservedFlag() || (await this.isLoggedIn());
  }

  async isLoggedIn(): Promise<boolean> {
    if (!/miraiz-persol\.jp/.test(this.page.url())) {
      return false;
    }

    // The SPA resolves auth state via an async client-side check before
    // redirecting anonymous visitors to /auth/login. Right after navigation
    // the URL/title can transiently look authenticated mid-check, so give it
    // a short bounded window to settle before reading either signal.
    await this.page
      .waitForLoadState("networkidle", { timeout: TIMEOUT.SHORT_WAIT })
      .catch(() => {});

    if (await this.isLoginFormVisible()) {
      return false;
    }

    const logoutVisible = await Sel.getLogoutButton(this.page)
      .isVisible()
      .catch(() => false);
    if (logoutVisible) {
      return true;
    }

    const onAuthenticatedUrl = this.isAuthenticatedUrl(this.page.url());
    if (!onAuthenticatedUrl) {
      return false;
    }

    const title = await this.page.title().catch(() => "");
    return Sel.myPageText.test(title);
  }

  async isLoginFormVisible(): Promise<boolean> {
    return await Sel.getEmailInput(this.page)
      .isVisible()
      .catch(() => false);
  }

  async isLoggedOutState(): Promise<boolean> {
    const loggedOutHeadingVisible = await Sel.getLoggedOutHeading(this.page)
      .isVisible()
      .catch(() => false);
    if (loggedOutHeadingVisible) {
      return true;
    }

    return await this.isLoginFormVisible();
  }

  async logout(): Promise<void> {
    console.log("[logout] Clicking logout button");

    if (await this.isLoggedOutState()) {
      console.log("[logout] Already logged out");
      return;
    }

    const action = await expect
      .poll(
        async () => {
          if (await this.isLoggedOutState()) {
            return "logged-out";
          }

          const logoutVisible = await Sel.getLogoutButton(this.page)
            .isVisible()
            .catch(() => false);
          if (logoutVisible) {
            return "can-logout";
          }

          return "waiting";
        },
        {
          timeout: TIMEOUT.LOGIN_SUBMIT_WAIT,
          intervals: [500, 1_000, 2_000],
          message:
            "Expected either logout control or logged-out state before cleanup",
        },
      )
      .not.toBe("waiting")
      .then(async () => {
        if (await this.isLoggedOutState()) {
          return "logged-out" as const;
        }

        return "can-logout" as const;
      });

    if (action === "logged-out") {
      console.log("[logout] Session already returned to a logged-out page");
      return;
    }

    await Promise.all([
      this.page
        .waitForURL(/.*/, { waitUntil: "networkidle", timeout: TIMEOUT.DEFAULT_WAIT })
        .catch(() => {}),
      safeClick(this.page, Sel.getLogoutButton(this.page)),
    ]);

    console.log("[logout] Waiting for logged-out state...");
    await Promise.race([
      this.waitForLoginFormReady(),
      Sel.getLoggedOutHeading(this.page).waitFor({
        state: "visible",
        timeout: TIMEOUT.LOGIN_FORM_APPEAR,
      }),
      this.page
        .getByRole("button", { name: Sel.loginButtonName })
        .first()
        .waitFor({
          state: "visible",
          timeout: TIMEOUT.LOGIN_FORM_APPEAR,
        }),
    ]);

    console.log("[logout] Logged out successfully");
  }

  private async waitForAuthenticatedLanding(): Promise<void> {
    await Promise.race([
      Sel.getLogoutButton(this.page).waitFor({
        state: "visible",
        timeout: TIMEOUT.LOGIN_SUBMIT_WAIT,
      }),
      this.page
        .waitForURL((url) => this.isAuthenticatedUrl(url.toString()), {
          timeout: TIMEOUT.LOGIN_SUBMIT_WAIT,
        })
        .then(async () => {
          await expect
            .poll(async () => await this.page.title().catch(() => ""), {
              timeout: TIMEOUT.LOGIN_SUBMIT_WAIT,
            })
            .toMatch(Sel.myPageText);
        }),
    ]);
  }

  private isAuthenticatedUrl(url: string): boolean {
    return url.startsWith(URLS.MIRAIZ.COMMON) && !url.includes("/auth/login");
  }

  private markAuthenticatedObserved(): void {
    Reflect.set(this.page, AUTH_OBSERVED_KEY, true);
  }

  private getAuthenticatedObservedFlag(): boolean {
    return Reflect.get(this.page, AUTH_OBSERVED_KEY) === true;
  }
}
