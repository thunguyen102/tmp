/** Test account credentials for real Miraiz and Mail.tm environments, loaded via .env (see playwright.config.ts). */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Set it in .env (see .env.example).`,
    );
  }
  return value;
}

export const CREDENTIALS = {
  MIRAIZ: {
    EMAIL: requireEnv("MIRAIZ_LOGIN_EMAIL"),
    PASSWORD: requireEnv("MIRAIZ_LOGIN_PASSWORD"),
  },
  MAIL_TM: {
    EMAIL: requireEnv("MAILTM_EMAIL"),
    PASSWORD: requireEnv("MAILTM_PASSWORD"),
  },
};
