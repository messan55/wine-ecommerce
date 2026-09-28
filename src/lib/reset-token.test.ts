import { describe, expect, it } from "vitest";
import {
  createResetToken,
  hashResetToken,
  isResetExpired,
  resetExpiresAt,
} from "@/lib/reset-token";

describe("reset token", () => {
  it("hache le secret sans le laisser en clair", () => {
    const { token, tokenHash } = createResetToken();
    expect(tokenHash).toBe(hashResetToken(token));
    expect(tokenHash).not.toBe(token);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("expire après une heure", () => {
    const now = Date.parse("2026-09-27T20:00:00Z");
    const expires = resetExpiresAt(now);
    expect(isResetExpired(expires, now)).toBe(false);
    expect(isResetExpired(expires, now + 60 * 60 * 1000 + 1)).toBe(true);
  });
});
