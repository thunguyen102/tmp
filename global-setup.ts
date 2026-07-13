export default async function globalSetup(): Promise<void> {
  const testEnv = process.env.TEST_ENV ?? "production";

  console.log(`Running against real environment: ${testEnv}`);
}
