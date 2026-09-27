import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { readSessionUserId, signSession } from "@/lib/session";

const SECRET = "test-auth-secret";

function token(userId: string, exp: number) {
  const payload = `${userId}.${exp}`;
  const sig = createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

describe("session", () => {
  it("signe et relit un identifiant", () => {
    const signed = signSession("user-42");
    expect(readSessionUserId(signed)).toBe("user-42");
  });

  it("refuse une signature altérée ou un jeton expiré", () => {
    const signed = signSession("user-42");
    const tampered = `${signed.slice(0, -2)}xx`;
    expect(readSessionUserId(tampered)).toBeNull();
    expect(readSessionUserId(token("user-42", 1))).toBeNull();
    expect(readSessionUserId("pas-un-jeton")).toBeNull();
    expect(readSessionUserId(undefined)).toBeNull();
  });
});
