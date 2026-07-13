import { expect, test } from "@/fixtures/role.fixture";

import { MiraizLoginPage } from "@/pages/miraiz/login.page";
import MiraizAuthWorkflow from "@/workflows/miraiz/auth.workflow";
import { CREDENTIALS, TIMEOUT } from "@/constants";
import { MiraizLoginSelectors as Sel } from "@/selectors/miraiz/login.selectors";

test.describe("Flow 1: Miraiz login with mail.tm OTP", () => {
  test("login, read OTP from mail.tm, verify success, then logout", async ({
    miraizPage,
    mailPage,
  }) => {
    await test.step("Step 1: [Arrange] Navigate to login page", async () => {
      const loginPage = new MiraizLoginPage(miraizPage);
      await loginPage.goto();
      await loginPage.waitForLoginFormReady();
    });

    await test.step("Step 2: [Arrange] Enter credentials and submit login form, verify via mail.tm OTP", async () => {
      await MiraizAuthWorkflow.ensureAuthenticatedSession(
        miraizPage,
        mailPage,
        {
          email: CREDENTIALS.MIRAIZ.EMAIL,
          password: CREDENTIALS.MIRAIZ.PASSWORD,
        },
        {
          email: CREDENTIALS.MAIL_TM.EMAIL,
          password: CREDENTIALS.MAIL_TM.PASSWORD,
        },
      );
    });

    await test.step("Step 3: [Assert] Verify logged in (logout text only appears when authenticated)", async () => {
      const loginPage = new MiraizLoginPage(miraizPage);
      await expect
        .poll(async () => await loginPage.hasAuthenticatedEvidence(), {
          timeout: TIMEOUT.LOGIN_SUBMIT_WAIT,
        })
        .toBe(true);
      await expect(miraizPage).toHaveURL(/miraiz-persol\.jp/, {
        timeout: TIMEOUT.LOGIN_SUBMIT_WAIT,
      });
    });

    await test.step("Step 4: [Assert] Logout and verify back at login form", async () => {
      const loginPage = new MiraizLoginPage(miraizPage);
      await loginPage.logout();
      await expect(Sel.getPageBody(miraizPage)).toContainText(
        Sel.loginButtonName,
        {
          timeout: TIMEOUT.DEFAULT_WAIT,
        },
      );
    });
  });
});
