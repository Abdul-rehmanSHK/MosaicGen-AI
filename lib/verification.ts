import crypto from "crypto";

const getSecret = (): string =>
  process.env.AUTH_SECRET || "ai-mosaic-luxury-studio-secret-key-2026-super-secure";

/**
 * Creates a tamper-proof HMAC verification token for an email address.
 * Format: cleanEmail:timestamp:hmacSignature
 */
export function createEmailVerificationToken(email: string): string {
  const clean = email.toLowerCase().trim();
  const timestamp = Date.now();
  const payload = `${clean}:${timestamp}`;
  const hmac = crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${payload}:${hmac}`;
}

/**
 * Validates whether an email verification token is valid, matches the target email,
 * and has not expired (7 days validity).
 */
export function verifyEmailToken(token: string, expectedEmail: string): boolean {
  try {
    if (!token || !expectedEmail) return false;
    const parts = token.split(":");
    if (parts.length !== 3) return false;

    const [tokenEmail, timestampStr, hmac] = parts;
    if (tokenEmail.toLowerCase().trim() !== expectedEmail.toLowerCase().trim()) {
      return false;
    }

    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return false;

    // Token valid for 7 days (7 * 24 * 60 * 60 * 1000 ms)
    const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > MAX_AGE_MS) {
      return false;
    }

    const expectedHmac = crypto
      .createHmac("sha256", getSecret())
      .update(`${tokenEmail}:${timestampStr}`)
      .digest("hex");

    const hmacBuf = Buffer.from(hmac);
    const expectedBuf = Buffer.from(expectedHmac);
    if (hmacBuf.length !== expectedBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(hmacBuf, expectedBuf);
  } catch {
    return false;
  }
}
