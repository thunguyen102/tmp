export type OtpMode = "api" | "ui" | "hybrid";

function readOtpMode(): OtpMode {
  const value = process.env.OTP_MODE?.trim().toLowerCase();

  if (!value) {
    return "hybrid";
  }

  if (value === "api" || value === "ui" || value === "hybrid") {
    return value;
  }

  throw new Error(
    `Invalid OTP_MODE: ${process.env.OTP_MODE}. Expected one of: api, ui, hybrid.`,
  );
}

export const OTP_MODE = readOtpMode();
