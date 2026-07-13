import { expect, test } from "@/fixtures/role.fixture";

import { MiraizLoginPage } from "@/pages/miraiz/login.page";
import MiraizAuthWorkflow from "@/workflows/miraiz/auth.workflow";
import { CREDENTIALS, REUSE_SESSION, TIMEOUT } from "@/constants";

const REUSE_LOG_MARKER = "Found existing session, reusing it";
const FRESH_LOGIN_LOG_MARKER = "[Miraiz] Submitting login form";

/**
 * Wraps a call to ensureAuthenticatedSession and captures the workflow's own
 * console.log lines (emitted in the Node test process, not the page) so we
 * can assert on the *actual* branch taken (reuse vs fresh login) instead of
 * inferring it from timing or UI state.
 */
async function authenticateAndCaptureLogs(
  miraizPage: Parameters<typeof MiraizAuthWorkflow.ensureAuthenticatedSession>[0],
  mailPage: Parameters<typeof MiraizAuthWorkflow.ensureAuthenticatedSession>[1],
): Promise<string[]> {
  const logs: string[] = [];
  const originalLog = console.log;
  console.log = (...args: unknown[]): void => {
    logs.push(args.map(String).join(" "));
    originalLog(...args);
  };

  try {
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
  } finally {
    console.log = originalLog;
  }

  return logs;
}

// Runs against the REUSE_SESSION value the process was started with (it is
// read once from .env at module-load time, see constants/session.ts). To
// cover both true and false, and the true -> false switch, run this spec
// twice with different REUSE_SESSION values (see README note in PR/spec).
test.describe.serial(`Flow: reuse session (REUSE_SESSION=${REUSE_SESSION})`, () => {
  test("attempt 1: authenticates successfully", async ({
    miraizPage,
    mailPage,
  }) => {
    const logs = await authenticateAndCaptureLogs(miraizPage, mailPage);

    const loginPage = new MiraizLoginPage(miraizPage);
    await expect
      .poll(async () => await loginPage.hasAuthenticatedEvidence(), {
        timeout: TIMEOUT.LOGIN_SUBMIT_WAIT,
      })
      .toBe(true);

    if (!REUSE_SESSION) {
      // REUSE_SESSION=false must ALWAYS perform a fresh login, even if a
      // session file was persisted on disk by an earlier REUSE_SESSION=true
      // run. This is the "switch true -> false resets login" guarantee.
      expect(logs.some((line) => line.includes(FRESH_LOGIN_LOG_MARKER))).toBe(
        true,
      );
      expect(logs.some((line) => line.includes(REUSE_LOG_MARKER))).toBe(
        false,
      );
    }
  });

  test("attempt 2: honors REUSE_SESSION on a second run", async ({
    miraizPage,
    mailPage,
  }) => {
    const logs = await authenticateAndCaptureLogs(miraizPage, mailPage);

    const loginPage = new MiraizLoginPage(miraizPage);
    await expect
      .poll(async () => await loginPage.hasAuthenticatedEvidence(), {
        timeout: TIMEOUT.LOGIN_SUBMIT_WAIT,
      })
      .toBe(true);

    if (REUSE_SESSION) {
      // By now attempt 1 has guaranteed a valid persisted session exists
      // (it either found one already, or just logged in and saved one).
      // A second run MUST reuse it, never re-submit the login form.
      expect(logs.some((line) => line.includes(REUSE_LOG_MARKER))).toBe(true);
      expect(logs.some((line) => line.includes(FRESH_LOGIN_LOG_MARKER))).toBe(
        false,
      );
    } else {
      // REUSE_SESSION=false must keep forcing fresh logins every single time.
      expect(logs.some((line) => line.includes(FRESH_LOGIN_LOG_MARKER))).toBe(
        true,
      );
      expect(logs.some((line) => line.includes(REUSE_LOG_MARKER))).toBe(
        false,
      );
    }
  });
});
