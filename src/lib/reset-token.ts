import { createHash, randomBytes } from "node:crypto";

export const RESET_TTL_SEC = 60 * 60;

export function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createResetToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashResetToken(token) };
}

export function resetExpiresAt(now = Date.now()) {
  return new Date(now + RESET_TTL_SEC * 1000);
}

export function isResetExpired(expiresAt: Date, now = Date.now()) {
  return expiresAt.getTime() <= now;
}
