function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getEnv(name: string, defaultValue?: string): string {
  return process.env[name] || defaultValue || '';
}

export const EnvConfig = {
  APP_BASE_URL: getEnv('APP_BASE_URL', 'http://localhost:3000'),
  BROWSER: getEnv('BROWSER', 'chromium'),
  HEADLESS: getEnv('HEADLESS', 'false') === 'true',
  LOG_LEVEL: getEnv('LOG_LEVEL', 'info'),
  CI: getEnv('CI', 'false') === 'true',

  CREDENTIALS: {
    USERNAME: getEnv('APP_LOGIN_USERNAME', 'testuser@example.com'),
    PASSWORD: getEnv('APP_LOGIN_PASSWORD', 'TestPassword@123'),
    ADMIN_USERNAME: getEnv('APP_ADMIN_USERNAME', 'admin@example.com'),
    ADMIN_PASSWORD: getEnv('APP_ADMIN_PASSWORD', 'AdminPassword@123'),
  },
};

export { requireEnv, getEnv };
