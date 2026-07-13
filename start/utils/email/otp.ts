export function extractOtp(text: string): string {
  const normalized = text.replace(/[０-９]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0xff10 + 0x30),
  );

  // Miraiz OTPs are six digits. Prefer that exact shape so we do not pick up
  // unrelated numbers from ads, timestamps, or IP addresses embedded in mail UIs.
  const match =
    normalized.match(/(?<!\d)\d{6}(?!\d)/) ??
    normalized.match(/(?<!\d)\d{4,8}(?!\d)/);

  if (!match) {
    throw new Error(`OTP code was not found in text: ${normalized.slice(0, 500)}`);
  }

  return match[0];
}
