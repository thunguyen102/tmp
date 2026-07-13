import { Locator, expect, Page } from "@playwright/test";

import { BasePage } from "@/pages/base/base.page";
import { safeClick, safeFill, safeGoto } from "@/utils/dom-helper";
import { extractOtp } from "@/utils/email/otp";
import { ORIGINS, TIMEOUT, URLS } from "@/constants";
import { MailTmSelectors as Sel } from "@/selectors/mail/mail-tm.selectors";

const SWITCH_ACCOUNT_ATTEMPTS = 3;
const MAIL_AD_HANDLER_KEY = "__mailTmAdHandlerInstalled";

export interface MailUiOtpSnapshot {
  code: string;
  marker: string;
}

export class MailTmPage extends BasePage {
  constructor(page: Page) {
    super(page);
    this.installBlockingUiListener();
  }

  async gotoMailHome(): Promise<void> {
    this.installBlockingUiListener();
    await safeGoto(this.page, URLS.MAIL_TM.BASE, undefined, {
      navTimeout: TIMEOUT.PAGE_LOAD,
    });
    await this.dismissBlockingUi();
  }

  async ensureLoggedIn(email: string, password: string): Promise<void> {
    await this.gotoMailHome();

    console.log(`[mail.tm] Ensuring logged in as: ${email}`);

    for (let attempt = 1; attempt <= SWITCH_ACCOUNT_ATTEMPTS; attempt++) {
      try {
        console.log(`[mail.tm] Login attempt ${attempt}/${SWITCH_ACCOUNT_ATTEMPTS}`);
        await this.switchAccount(email, password);

        const isCorrectAccount = await this.isSignedInAs(email).catch((error) => {
          console.warn(
            `[mail.tm] Failed to check account at attempt ${attempt}: ${String(error)}`,
          );
          return false;
        });

        if (isCorrectAccount) {
          console.log(`[mail.tm] Successfully logged in as ${email}`);
          return;
        }

        console.log(
          `[mail.tm] Account mismatch at attempt ${attempt}, will retry...`,
        );
      } catch (error) {
        console.warn(
          `[mail.tm] Switch account failed at attempt ${attempt}: ${String(error)}`,
        );

        if (attempt < SWITCH_ACCOUNT_ATTEMPTS) {
          console.log(`[mail.tm] Retrying after error...`);
          await this.page.waitForTimeout(TIMEOUT.SHORT_WAIT);
          continue;
        }
      }
    }

    throw new Error(
      `mail.tm did not switch to account ${email} after ${SWITCH_ACCOUNT_ATTEMPTS} attempts`,
    );
  }

  async focusInbox(): Promise<void> {
    console.log("[mail.tm] Focusing inbox");
    await this.gotoMailHome();
    await this.returnToInboxIfNeeded();
    await this.dismissBlockingUi();

    try {
      await Sel.getMessageCandidates(this.page)
        .first()
        .waitFor({ state: "visible", timeout: TIMEOUT.MAIL_INBOX_LOAD });
      console.log("[mail.tm] Found message candidate in inbox");
    } catch (messageError) {
      console.log("[mail.tm] No message visible, waiting for inbox heading instead");
      try {
        await Sel.getInboxHeading(this.page).waitFor({
          state: "visible",
          timeout: TIMEOUT.MAIL_INBOX_LOAD,
        });
        console.log("[mail.tm] Found inbox heading");
      } catch (headingError) {
        console.warn(
          "[mail.tm] Failed to find both message and inbox heading. Page might be loading or empty.",
        );
        console.warn(`  Message error: ${String(messageError).split("\n")[0]}`);
        console.warn(`  Heading error: ${String(headingError).split("\n")[0]}`);
        // Don't throw - continue and let waitForCodeFromUi handle it
      }
    }

    console.log("[mail.tm] Inbox focused successfully");
  }

  async refreshInbox(): Promise<void> {
    console.log("[mail.tm] Refreshing inbox");
    await this.returnToInboxIfNeeded();
    await this.dismissBlockingUi();
    await safeClick(this.page, Sel.getRefreshButton(this.page));
    await this.dismissBlockingUi();
    await this.page.waitForTimeout(TIMEOUT.MAIL_REFRESH_WAIT);
  }

  async waitForCodeFromUi(options: {
    timeoutMs?: number;
    previousCode?: string;
    previousMarker?: string;
    minReceivedAtMs?: number;
  } = {}): Promise<string> {
    const timeoutMs = options.timeoutMs ?? TIMEOUT.MAIL_NEW_EMAIL_WAIT;
    let code = "";
    let marker = "";

    console.log("[waitForCodeFromUi] Starting to wait for OTP code with timeout", timeoutMs);

    try {
      await expect(async () => {
        await this.refreshInbox();
        const snapshot = options.previousMarker
          ? await this.tryReadOtpFromNewestChangedMessage(options.previousMarker)
          : await this.tryReadOtpFromNewestVisibleMessage();
        code = snapshot.code;
        marker = snapshot.marker;

        if (!code) {
          throw new Error("No OTP code found in mail.tm UI yet");
        }

        if (options.previousMarker && marker === options.previousMarker) {
          throw new Error(`Still reading old OTP message ${marker}`);
        }

        if (
          options.previousCode &&
          code === options.previousCode &&
          !options.previousMarker
        ) {
          throw new Error(`Still reading old OTP code ${code}`);
        }
      }).toPass({ timeout: timeoutMs, intervals: [2_000, 3_000, 5_000] });
    } catch (error) {
      console.error(
        `[waitForCodeFromUi] Failed to get OTP code after ${timeoutMs}ms: ${String(error).split("\n")[0]}`,
      );
      throw error;
    }

    console.log("[waitForCodeFromUi] Successfully extracted OTP code");
    return code;
  }

  private async tryReadOtpFromNewestVisibleMessage(): Promise<MailUiOtpSnapshot> {
    this.installBlockingUiListener();
    await this.returnToInboxIfNeeded();
    await this.dismissBlockingUi();

    const messages = Sel.getMessageCandidates(this.page);
    const count = await messages.count().catch(() => 0);

    console.log(`[tryReadOtpFromNewestVisibleMessage] Found ${count} message(s)`);

    if (count === 0) {
      console.warn("[tryReadOtpFromNewestVisibleMessage] No messages in inbox, will retry...");
      return { code: "", marker: "" };
    }

    const firstMessage = messages.first();
    const marker = await this.buildMessageMarker(firstMessage);
    console.log("[tryReadOtpFromNewestVisibleMessage] Opening newest visible message at row 1");
    const code = await this.openMessageAndExtractOtp(firstMessage, 0, count);

    if (!code) {
      console.warn(
        "[tryReadOtpFromNewestVisibleMessage] Opened message but failed to extract OTP, will retry...",
      );
    } else {
      console.log(`[tryReadOtpFromNewestVisibleMessage] Successfully extracted code: ${code}`);
    }

    return { code, marker };
  }

  private async tryReadOtpFromNewestChangedMessage(
    previousMarker: string,
  ): Promise<MailUiOtpSnapshot> {
    this.installBlockingUiListener();
    await this.returnToInboxIfNeeded();
    await this.dismissBlockingUi();

    const messages = Sel.getMessageCandidates(this.page);
    const count = await messages.count().catch(() => 0);

    console.log(`[tryReadOtpFromNewestChangedMessage] Found ${count} message(s)`);

    if (count === 0) {
      return { code: "", marker: "" };
    }

    const firstMessage = messages.first();
    const currentMarker = await this.buildMessageMarker(firstMessage);

    if (currentMarker === previousMarker) {
      console.log("[tryReadOtpFromNewestChangedMessage] Newest message has not changed yet");
      return { code: "", marker: currentMarker };
    }

    console.log("[tryReadOtpFromNewestChangedMessage] Newest message changed, opening row 1");
    const code = await this.openMessageAndExtractOtp(firstMessage, 0, count);
    return { code, marker: currentMarker };
  }

  private async buildMessageMarker(message: Locator): Promise<string> {
    const href = await message.getAttribute("href").catch(() => "");
    const summaryText = await message.innerText().catch(() => "");
    return `${href ?? ""}|${summaryText.trim()}`;
  }

  private async openMessageAndExtractOtp(
    message: Locator,
    index: number,
    count: number,
  ): Promise<string> {
    this.installBlockingUiListener();
    await this.dismissBlockingUi();

    const href = await message.getAttribute("href").catch(() => "");
    const messageUrl = href
      ? href.startsWith("http")
        ? href
        : `${ORIGINS.MAIL_TM}${href}`
      : "";

    // Prefer the in-app (SPA) click over a hard navigation: mail.tm reloads
    // its whole ad/tracker stack (Google, Criteo, Freestar, TradeDesk, ...)
    // on every full page load, which can burn most of the retry budget
    // before the message body ever renders. Only fall back to a hard
    // navigation if the click did not actually route to the message.
    let opened = await message
      .click({ timeout: TIMEOUT.SHORT_WAIT })
      .then(() => true)
      .catch(() => false);

    if (opened && messageUrl) {
      opened = await this.page
        .waitForURL(messageUrl, { timeout: TIMEOUT.SHORT_WAIT })
        .then(() => true)
        .catch(() => false);
    }

    if (!opened && messageUrl) {
      await safeGoto(this.page, messageUrl, undefined, {
        navTimeout: TIMEOUT.PAGE_LOAD,
      });
    }

    await this.dismissBlockingUi();
    console.log(
      `[openMessageAndExtractOtp] Clicked message ${index + 1}/${count}, waiting for content...`,
    );

    const mainContent = this.page.locator("main").first();
    await expect(mainContent).toBeVisible({ timeout: TIMEOUT.MAIL_INBOX_LOAD });

    const messageFrame = Sel.getMessageViewFrame(this.page);
    await messageFrame
      .waitFor({ state: "attached", timeout: TIMEOUT.MAIL_INBOX_LOAD })
      .catch(() => {});

    let visibleText = "";

    const combinedMessageText = await this.readCombinedMessageText(mainContent);
    if (combinedMessageText) {
      try {
        const code = extractOtp(combinedMessageText);
        console.log(`[openMessageAndExtractOtp] Extracted code from combined message DOM: ${code}`);
        return code;
      } catch {
        visibleText = combinedMessageText;
      }
    }

    const codeFromFrame = await this.tryExtractOtpFromMessageFrame(messageFrame);
    if (codeFromFrame) {
      console.log(
        `[openMessageAndExtractOtp] Extracted code from message iframe: ${codeFromFrame}`,
      );
      return codeFromFrame;
    }

    const contentSelectors = [
      "main",
      "div[data-message-body]",
      "div.message-body",
      "article",
      ".email-body",
      ".message-content",
      "body",
    ];

    for (const selector of contentSelectors) {
      const elem = this.page.locator(selector).first();
      const text = await elem.innerText({ timeout: TIMEOUT.SHORT_WAIT }).catch(() => "");

      if (!text.trim()) {
        continue;
      }

      try {
        const code = extractOtp(text);
        console.log(
          `[openMessageAndExtractOtp] Extracted code from selector ${selector}: ${code}`,
        );
        return code;
      } catch {
        if (text.length > visibleText.length) {
          visibleText = text;
        }
      }
    }

    const frameText = await this.readMessageFrameText(messageFrame);
    if (frameText.length > visibleText.length) {
      visibleText = frameText;
    }

    const frameSrcDoc = await messageFrame.getAttribute("srcdoc").catch(() => "");
    if (frameSrcDoc) {
      try {
        const code = extractOtp(frameSrcDoc);
        console.log(`[openMessageAndExtractOtp] Extracted code from iframe srcdoc: ${code}`);
        return code;
      } catch {
        if (frameSrcDoc.length > visibleText.length) {
          visibleText = frameSrcDoc;
        }
      }
    }

    if (!visibleText) {
      visibleText = await this.page
        .locator("body")
        .innerText({ timeout: TIMEOUT.MAIL_INBOX_LOAD })
        .catch(() => "");
    }

    console.log(`[openMessageAndExtractOtp] Got text, length: ${visibleText.length}`);
    const preview = visibleText.substring(0, 800).replace(/\n/g, " ");
    console.log(
      `[openMessageAndExtractOtp] Text preview: ${preview.substring(0, 200)}...`,
    );

    try {
      const code = extractOtp(visibleText);
      console.log(`[openMessageAndExtractOtp] Extracted code: ${code}`);
      return code;
    } catch {
      console.log("[openMessageAndExtractOtp] Text extract failed, trying HTML...");
    }

    try {
      const htmlContent = await this.page.content();
      const code = extractOtp(htmlContent);
      console.log(`[openMessageAndExtractOtp] Extracted code from HTML: ${code}`);
      return code;
    } catch (htmlError) {
      console.log(`[openMessageAndExtractOtp] HTML extract also failed: ${htmlError}`);
    }

    return "";
  }

  private async tryExtractOtpFromMessageFrame(
    messageFrame: Locator,
  ): Promise<string> {
    const frameText = await this.readMessageFrameText(messageFrame);
    if (!frameText) {
      return "";
    }

    try {
      return extractOtp(frameText);
    } catch {
      return "";
    }
  }

  private async readMessageFrameText(messageFrame: Locator): Promise<string> {
    const deadline = Date.now() + TIMEOUT.MAIL_INBOX_LOAD;
    let longestText = "";

    while (Date.now() < deadline) {
      const frameHandle = await messageFrame.elementHandle().catch(() => null);
      const frame = await frameHandle?.contentFrame().catch(() => null);

      if (!frame) {
        await this.page.waitForTimeout(TIMEOUT.QUICK_ACTION);
        continue;
      }

      await frame
        .locator("body")
        .waitFor({ state: "visible", timeout: TIMEOUT.SHORT_WAIT })
        .catch(() => {});

      const frameText = await frame.locator("body").innerText().catch(() => "");
      if (frameText.length > longestText.length) {
        longestText = frameText;
      }

      if (frameText.trim()) {
        return frameText;
      }
    }

    return longestText;
  }

  private async readCombinedMessageText(mainContent: Locator): Promise<string> {
    return await mainContent
      .evaluate((container: Element) => {
        const chunks: string[] = [];

        const pushText = (value: string | null | undefined) => {
          if (value && value.trim()) {
            chunks.push(value.trim());
          }
        };

        const visit = (node: Element) => {
          pushText((node as HTMLElement).innerText);

          for (const frame of node.querySelectorAll("iframe")) {
            try {
              // Prefer the rendered, human-visible text first: it is what
              // the real OTP looks like. The raw srcdoc markup is kept only
              // as a last resort because it also contains every tracking
              // URL/CSS value from the email template, which can spuriously
              // match the 6-digit OTP shape before the real code is reached.
              pushText(frame.contentDocument?.body?.innerText);
              pushText(frame.contentDocument?.documentElement?.textContent);
              pushText(frame.getAttribute("srcdoc"));
            } catch {
              // Ignore cross-origin or not-yet-ready iframe reads.
            }
          }
        };

        visit(container);
        return chunks.join("\n");
      })
      .catch(() => "");
  }
  private async returnToInboxIfNeeded(): Promise<void> {
    const backLink = Sel.getBackToInboxLink(this.page);
    const canGoBack = await backLink.isVisible().catch(() => false);

    if (!canGoBack) {
      return;
    }

    await safeClick(this.page, backLink, TIMEOUT.SHORT_WAIT);
    await Sel.getMessageCandidates(this.page)
      .first()
      .waitFor({ state: "visible", timeout: TIMEOUT.MAIL_INBOX_LOAD })
      .catch(() => {});
  }

  private installBlockingUiListener(): void {
    if (Reflect.get(this.page, MAIL_AD_HANDLER_KEY) === true) {
      return;
    }

    Reflect.set(this.page, MAIL_AD_HANDLER_KEY, true);

    const closeAdButtonById = Sel.getCloseAdButtonById(this.page);
    const closeAdButtonByAria = Sel.getCloseAdButtonByAria(this.page);
    const stickyCloseAdButton = Sel.getStickyCloseAdButton(this.page);
    const skipAdButton = Sel.getSkipAdButton(this.page);

    void this.page.addLocatorHandler(closeAdButtonById, async () => {
      await this.dismissBlockingUi();
    });

    void this.page.addLocatorHandler(stickyCloseAdButton, async () => {
      await this.dismissBlockingUi();
    });

    void this.page.addLocatorHandler(closeAdButtonByAria, async () => {
      await this.dismissBlockingUi();
    });

    void this.page.addLocatorHandler(skipAdButton, async () => {
      await this.dismissBlockingUi();
    });
  }

  private async dismissBlockingUi(): Promise<void> {
    const dismissibleButtons = [
      Sel.getCloseAdButtonById(this.page),
      Sel.getStickyCloseAdButton(this.page),
      Sel.getCloseAdButton(this.page),
      Sel.getSkipAdButton(this.page),
      Sel.getCloseAdButtonByAria(this.page),
    ];

    for (const button of dismissibleButtons) {
      const isVisible = await button.isVisible().catch(() => false);
      if (!isVisible) {
        continue;
      }

      await button.click({ force: true }).catch(async () => {
        await button
          .evaluate((element: Element) => {
            (element as HTMLElement).click();
          })
          .catch(() => {});
      });
    }

    await this.dismissNestedAdPopups();

    await this.page
      .evaluate((containerSelector) => {
        const selectors = containerSelector
          .split(",")
          .map((selector) => selector.trim())
          .filter(Boolean);

        for (const selector of selectors) {
          for (const element of document.querySelectorAll<HTMLElement>(selector)) {
            element.style.setProperty("display", "none", "important");
            element.style.setProperty("visibility", "hidden", "important");
            element.style.setProperty("pointer-events", "none", "important");
          }
        }
      }, Sel.adContainerSelectors)
      .catch(() => {});
  }

  /**
   * Some interstitial ad creatives (e.g. the "Close ad" card with a
   * countdown progress bar) are rendered inside a nested ad iframe rather
   * than the top-level document, so `page.locator(...)` never finds them.
   * Walk every frame on the page and dismiss the same close/skip buttons
   * wherever they actually live.
   */
  private async dismissNestedAdPopups(): Promise<void> {
    const mainFrame = this.page.mainFrame();
    const selector = [
      Sel.closeAdButtonId,
      Sel.closeAdButtonAria,
      Sel.stickyCloseAdButton,
    ].join(", ");

    for (const frame of this.page.frames()) {
      if (frame === mainFrame || frame.isDetached()) {
        continue;
      }

      const closeButton = frame.locator(selector).first();
      const isVisible = await closeButton.isVisible().catch(() => false);
      if (!isVisible) {
        continue;
      }

      console.log("[mail.tm] Dismissing ad popup found inside a nested iframe");

      // These buttons are frequently inert until a short countdown (visible
      // progress bar) finishes, so poll-click instead of firing once and
      // giving up while the button is still arming.
      const deadline = Date.now() + TIMEOUT.SHORT_WAIT * 3;
      while (Date.now() < deadline) {
        const stillVisible = await closeButton.isVisible().catch(() => false);
        if (!stillVisible) {
          break;
        }

        await closeButton
          .click({ force: true, timeout: TIMEOUT.QUICK_ACTION })
          .catch(async () => {
            await closeButton
              .evaluate((element: Element) => {
                (element as HTMLElement).click();
              })
              .catch(() => {});
          });

        await this.page.waitForTimeout(TIMEOUT.QUICK_ACTION);
      }
    }
  }

  private async switchAccount(email: string, password: string): Promise<void> {
    await this.dismissBlockingUi();
    await safeClick(this.page, Sel.getAccountButton(this.page), TIMEOUT.MAIL_INBOX_LOAD);
    await safeClick(this.page, Sel.getLoginLink(this.page));

    await safeFill(this.page, Sel.getEmailInput(this.page), email);
    await safeFill(this.page, Sel.getPasswordInput(this.page), password);
    await safeClick(this.page, Sel.getLoginSubmitButton(this.page));

    await Promise.race([
      Sel.getLoginModalHeading(this.page).waitFor({
        state: "hidden",
        timeout: TIMEOUT.MAIL_INBOX_LOAD,
      }),
      Sel.getLoginErrorMessage(this.page).waitFor({
        state: "visible",
        timeout: TIMEOUT.MAIL_INBOX_LOAD,
      }),
    ]).catch(() => {});
  }

  private async isSignedInAs(email: string): Promise<boolean> {
    await safeClick(this.page, Sel.getAccountButton(this.page));

    const addressText = Sel.getAccountAddressText(this.page);
    const visible = await addressText
      .waitFor({ state: "visible", timeout: TIMEOUT.SHORT_WAIT })
      .then(() => true)
      .catch(() => false);

    if (!visible) {
      return false;
    }

    await addressText.click().catch(() => {});
    await this.page.waitForTimeout(TIMEOUT.QUICK_ACTION);
    const value = await addressText.innerText().catch(() => "");
    await this.page.keyboard.press("Escape").catch(() => {});

    // Extract email from text and remove trailing semicolons/whitespace
    const emailMatch = value.match(Sel.emailAddressPattern);
    const extractedEmail = emailMatch ? emailMatch[0] : value.trim();

    const isMatch = extractedEmail === email;
    if (!isMatch) {
      console.log(
        `[mail.tm] Account mismatch: expected "${email}", got "${extractedEmail}"`,
      );
    }

    return isMatch;
  }

}


