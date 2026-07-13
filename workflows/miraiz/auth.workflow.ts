import { existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";

import { Page } from "@playwright/test";

import { MailTmPage } from "@/pages/mail/mail-tm.page";
import { MiraizLoginPage } from "@/pages/miraiz/login.page";
import { MailTmApiClient } from "@/utils/email/mail-tm-api.client";
import {
  MIRAIZ_STORAGE_STATE_PATH,
  OTP_MODE,
  REUSE_SESSION,
  TIMEOUT,
  type OtpMode,
} from "@/constants";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface MailTmCredentials {
  email: string;
  password: string;
}

/**
 * Lazily hands out the mail.tm Page. OTP_MODE=api resolves OTPs via the API
 * first and only needs a real mail.tm browser tab if that call fails, so the
 * fixture backing this defers opening it until `get()` is actually called.
 */
export interface MailPageHandle {
  get: () => Promise<Page>;
}

class MiraizAuthWorkflow {
  /**
   * Reuse an authenticated session when it is really on-screen; otherwise
   * perform the full email + OTP login flow.
   */
  async ensureAuthenticatedSession(
    miraizPage: Page,
    mailPageHandle: MailPageHandle,
    credentials: LoginCredentials,
    mailCredentials: MailTmCredentials,
  ): Promise<void> {
    const loginPage = new MiraizLoginPage(miraizPage);

    if (REUSE_SESSION) {
      console.log("[REUSE_SESSION] Enabled: checking for existing authenticated session");
      await loginPage.goto();
      if (await loginPage.isLoggedIn()) {
        console.log("[REUSE_SESSION] Found existing session, reusing it");
        return;
      }
      console.log("[REUSE_SESSION] No existing session found, performing fresh login");
    } else {
      console.log("[REUSE_SESSION] Disabled: skipping session check, going straight to fresh login");
      this.clearPersistedSession();
    }

    await this.loginWithEmailVerification(
      loginPage,
      mailPageHandle,
      credentials,
      mailCredentials,
    );

    if (REUSE_SESSION) {
      await this.persistSession(miraizPage);
    }
  }

  /**
   * Removes any previously persisted session file so a stale, disabled-mode
   * run can never be mistaken later for a still-valid REUSE_SESSION=true
   * session. Only touches the Miraiz session file; OTP_MODE is untouched.
   */
  private clearPersistedSession(): void {
    if (!existsSync(MIRAIZ_STORAGE_STATE_PATH)) {
      return;
    }

    try {
      rmSync(MIRAIZ_STORAGE_STATE_PATH);
      console.log(`[REUSE_SESSION] Cleared stale session file at ${MIRAIZ_STORAGE_STATE_PATH}`);
    } catch (error) {
      console.warn(`[REUSE_SESSION] Failed to clear stale session: ${String(error)}`);
    }
  }

  /**
   * Saves the current browser context's cookies/storage to disk so a future
   * run (with REUSE_SESSION enabled) can skip the login form entirely. This
   * only persists the Miraiz session state — it has no effect on how the OTP
   * code itself is resolved (OTP_MODE branching is untouched).
   */
  private async persistSession(miraizPage: Page): Promise<void> {
    try {
      mkdirSync(path.dirname(MIRAIZ_STORAGE_STATE_PATH), { recursive: true });
      await miraizPage.context().storageState({ path: MIRAIZ_STORAGE_STATE_PATH });
      console.log(`[REUSE_SESSION] Saved session to ${MIRAIZ_STORAGE_STATE_PATH}`);
    } catch (error) {
      console.warn(`[REUSE_SESSION] Failed to save session: ${String(error)}`);
    }
  }

  async loginWithEmailVerification(
    loginPage: MiraizLoginPage,
    mailPageHandle: MailPageHandle,
    credentials: LoginCredentials,
    mailCredentials: MailTmCredentials,
  ): Promise<void> {
    const useApi = OTP_MODE === "api" || OTP_MODE === "hybrid";
    console.log(`[OTP_MODE] ${OTP_MODE}`);

    const { mailApi, existingMessageIds, existingMessageFingerprints } =
      await this.prepareMailApi(mailCredentials, useApi);

    console.log("[Miraiz] Returning to login page");
    await loginPage.goto();
    await loginPage.waitForLoginFormReady();
    console.log("[Miraiz] Submitting login form");
    await loginPage.login(credentials.email, credentials.password);
    console.log("[Miraiz] Waiting for code verification form");
    const loginOutcome = await loginPage.waitForCodeVerificationFormOrAuthenticated();

    if (loginOutcome === "authenticated") {
      console.log(
        "[Miraiz] Session was already authenticated after submitting login; skipping OTP step",
      );
      await loginPage.expectLoggedIn();
      return;
    }

    console.log("[Miraiz] Code verification form is visible");

    const code = await this.resolveOtpCode(
      OTP_MODE,
      mailPageHandle,
      mailApi,
      existingMessageIds,
      existingMessageFingerprints,
      mailCredentials,
      "",
    );

    await loginPage.page.bringToFront();
    await loginPage.verifyCode(code);
    await loginPage.expectLoggedIn();
  }

  private async resolveOtpCode(
    otpMode: OtpMode,
    mailPageHandle: MailPageHandle,
    mailApi: MailTmApiClient | null,
    existingMessageIds: string[],
    existingMessageFingerprints: Record<string, string>,
    mailCredentials: MailTmCredentials,
    previousUiMarker: string,
  ): Promise<string> {
    if (otpMode === "api") {
      console.log("[OTP_MODE] Using mail.tm API only");
      if (!mailApi) {
        throw new Error(
          "OTP_MODE=api requires MailTmApiClient to be initialized.",
        );
      }
      try {
        const latestOtp = await mailApi.waitForLatestOtp({
          existingMessageIds,
          existingMessageFingerprints,
          timeoutMs: TIMEOUT.MAIL_NEW_EMAIL_WAIT,
          subjectIncludes: /PERSOL|MIRAIZ|認証|確認|verification|code/i,
        });
        return latestOtp.code;
      } catch (apiError) {
        console.warn(
          `[OTP_MODE] API did not resolve OTP, falling back to mail.tm UI: ${String(apiError)}`,
        );
        const mailPage = new MailTmPage(await mailPageHandle.get());
        await mailPage.page.bringToFront();
        await mailPage.ensureLoggedIn(
          mailCredentials.email,
          mailCredentials.password,
        );
        await mailPage.focusInbox();
        return await mailPage.waitForCodeFromUi({
          timeoutMs: TIMEOUT.MAIL_NEW_EMAIL_WAIT,
          previousMarker: previousUiMarker,
        });
      }
    }

    const mailPage = new MailTmPage(await mailPageHandle.get());
    console.log("[OTP_MODE] Opening mail.tm after code verification form is visible");
    await mailPage.page.bringToFront();
    console.log("[OTP_MODE] mail.tm is in foreground");
    await mailPage.ensureLoggedIn(
      mailCredentials.email,
      mailCredentials.password,
    );
    await mailPage.focusInbox();

    if (otpMode === "ui") {
      console.log("[OTP_MODE] Using mail.tm UI only");
      return await mailPage
        .waitForCodeFromUi({
          timeoutMs: TIMEOUT.MAIL_NEW_EMAIL_WAIT,
          previousMarker: previousUiMarker,
        })
        .catch(async (uiError) => {
          if (!mailApi) {
            throw uiError;
          }

          console.log("[OTP_MODE] UI failed, falling back to mail.tm API");
          const latestOtp = await mailApi.waitForLatestOtp({
            existingMessageIds,
            existingMessageFingerprints,
            timeoutMs: TIMEOUT.MAIL_NEW_EMAIL_WAIT,
            subjectIncludes: /PERSOL|MIRAIZ|認証|確認|verification|code/i,
          });
          return latestOtp.code;
        });
    }

    console.log("[OTP_MODE] Using mail.tm UI first, API fallback");
    const code = await mailPage
      .waitForCodeFromUi({
        timeoutMs: TIMEOUT.MAIL_NEW_EMAIL_WAIT,
        previousMarker: previousUiMarker,
      })
      .catch(() => "");

    if (code) {
      console.log("[OTP_MODE] OTP resolved from UI");
      return code;
    }

    if (!mailApi) {
      throw new Error(
        "OTP_MODE=hybrid could not fall back to API because API is unavailable.",
      );
    }

    console.log("[OTP_MODE] UI failed, falling back to API");
    const latestOtp = await mailApi.waitForLatestOtp({
      existingMessageIds,
      existingMessageFingerprints,
      timeoutMs: TIMEOUT.MAIL_NEW_EMAIL_WAIT,
      subjectIncludes: /PERSOL|MIRAIZ|認証|確認|verification|code/i,
    });
    return latestOtp.code;
  }

  private async prepareMailApi(
    mailCredentials: MailTmCredentials,
    required: boolean,
  ): Promise<{
    mailApi: MailTmApiClient | null;
    existingMessageIds: string[];
    existingMessageFingerprints: Record<string, string>;
  }> {
    const mailApi = new MailTmApiClient();

    try {
      await mailApi.login(mailCredentials.email, mailCredentials.password);
      const existingMessages = await mailApi.listMessages();
      const existingMessageIds = existingMessages.map((message) => message.id);
      const fingerprintTargetIds = existingMessages
        .slice(0, 10)
        .map((message) => message.id);
      const existingMessageFingerprints =
        await mailApi.captureMessageFingerprints(fingerprintTargetIds);
      return { mailApi, existingMessageIds, existingMessageFingerprints };
    } catch (error) {
      if (required) {
        throw error;
      }

      console.log(
        `[OTP_MODE] mail.tm API unavailable for fallback: ${String(error)}`,
      );
      return {
        mailApi: null,
        existingMessageIds: [],
        existingMessageFingerprints: {},
      };
    }
  }
}

export default new MiraizAuthWorkflow();
