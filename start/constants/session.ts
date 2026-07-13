function readReuseSession(): boolean {
  const value = process.env.REUSE_SESSION?.trim().toLowerCase();

  if (!value) {
    return false;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw new Error(
    `Invalid REUSE_SESSION: ${process.env.REUSE_SESSION}. Expected 'true' or 'false'.`,
  );
}

export const REUSE_SESSION = readReuseSession();
