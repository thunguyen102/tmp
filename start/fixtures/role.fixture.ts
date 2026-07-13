import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import {
  type Browser,
  type BrowserContext,
  type BrowserContextOptions,
  expect,
  type Page,
  type TestInfo,
  test as base,
} from "@playwright/test";

import type { MailPageHandle } from "@/workflows/miraiz/auth.workflow";
import { MIRAIZ_STORAGE_STATE_PATH, OTP_MODE, REUSE_SESSION } from "@/constants";

type RoleFixtures = {
  miraizPage: Page;
  mailPage: MailPageHandle;
};

type VideoMode =
  | "off"
  | "on"
  | "retain-on-failure"
  | "on-first-retry"
  | "on-all-retries"
  | "retain-on-first-failure"
  | "retain-on-failure-and-retries";

type VideoOption =
  | VideoMode
  | "retry-with-video"
  | {
      mode: VideoMode;
      size?: { width: number; height: number };
    };

function resolveRecordVideo(
  video: VideoOption,
  testInfo: TestInfo,
): BrowserContextOptions["recordVideo"] | undefined {
  if (!video || video === "off") {
    return undefined;
  }

  const mode = typeof video === "string" ? video : video.mode;
  const shouldRecord =
    mode === "on" ||
    mode === "retain-on-failure" ||
    mode === "retain-on-first-failure" ||
    mode === "retain-on-failure-and-retries" ||
    (mode === "on-first-retry" && testInfo.retry === 1) ||
    (mode === "on-all-retries" && testInfo.retry > 0) ||
    (mode === "retry-with-video" && testInfo.retry === 1);

  if (!shouldRecord) {
    return undefined;
  }

  return {
    dir: testInfo.outputPath(""),
    size: typeof video === "object" ? video.size : undefined,
  };
}

/**
 * Only loads a saved Miraiz session when REUSE_SESSION is enabled and a
 * saved storage state file actually exists on disk. Otherwise the context
 * is created empty, forcing the normal step-by-step login flow.
 */
function resolveMiraizContextOptions(): BrowserContextOptions | undefined {
  if (!REUSE_SESSION) {
    return undefined;
  }

  if (!existsSync(MIRAIZ_STORAGE_STATE_PATH)) {
    return undefined;
  }

  return { storageState: MIRAIZ_STORAGE_STATE_PATH };
}

async function createPage(
  browser: Browser,
  testInfo: TestInfo,
  video: VideoOption,
  contextOptions?: BrowserContextOptions,
  options?: BrowserContextOptions,
): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({
    ...contextOptions,
    recordVideo: resolveRecordVideo(video, testInfo),
    ...options,
  });
  const page = await context.newPage();
  return { context, page };
}

async function findRecordedVideoPath(outputDir: string): Promise<string> {
  const files = await readdir(outputDir).catch(() => []);
  const videoFile = files.find((file) => file.endsWith(".webm")) ?? "";
  return videoFile ? `${outputDir}\\${videoFile}` : "";
}

async function closeContextAndAttachVideo(
  page: Page,
  context: BrowserContext,
  testInfo: TestInfo,
  attachmentName: string,
): Promise<void> {
  const video = page.video();
  const outputDir = testInfo.outputPath("");
  await context.close().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    if (/Target page, context or browser has been closed/i.test(message)) {
      return;
    }

    throw error;
  });

  const attachmentPath = testInfo.outputPath(`${attachmentName}.webm`);

  if (video) {
    const saved = await video
      .saveAs(attachmentPath)
      .then(() => true)
      .catch(() => false);

    if (saved) {
      await testInfo.attach(attachmentName, {
        path: attachmentPath,
        contentType: "video/webm",
      });
      return;
    }
  }

  const fallbackVideoPath = await findRecordedVideoPath(outputDir);

  if (!fallbackVideoPath) {
    console.warn(
      `[video] No video file found for attachment "${attachmentName}"`,
    );
    return;
  }

  await testInfo.attach(attachmentName, {
    path: fallbackVideoPath,
    contentType: "video/webm",
  });
}

export const test = base.extend<RoleFixtures>({
  miraizPage: async (
    { browser, contextOptions, video },
    use,
    testInfo,
  ) => {
    const { context, page } = await createPage(
      browser,
      testInfo,
      video,
      contextOptions as BrowserContextOptions,
      resolveMiraizContextOptions(),
    );
    await use(page);
    await closeContextAndAttachVideo(page, context, testInfo, "miraiz-video");
  },

  mailPage: async (
    { browser, contextOptions, video },
    use,
    testInfo,
  ) => {
    let created: Promise<{ context: BrowserContext; page: Page }> | undefined;
    const ensureCreated = (): Promise<{ context: BrowserContext; page: Page }> => {
      created ??= createPage(
        browser,
        testInfo,
        video,
        contextOptions as BrowserContextOptions,
      );
      return created;
    };

    // OTP_MODE=api resolves OTPs via the API first and only needs a real
    // mail.tm tab if that call fails, so defer opening it until then. Every
    // other mode drives mail.tm from the start, so keep creating it eagerly.
    if (OTP_MODE !== "api") {
      await ensureCreated();
    }

    await use({ get: async () => (await ensureCreated()).page });

    if (created) {
      const { context, page } = await created;
      await closeContextAndAttachVideo(page, context, testInfo, "mail-video");
    }
  },
});

export { expect };
