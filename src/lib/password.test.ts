import { describe, expect, it } from "vitest";
import {
  hashPassword,
  isValidEmail,
  normalizeEmail,
  verifyPassword,
} from "@/lib/password";

describe("e-mail", () => {
  it("normalise et valide", () => {
    expect(normalizeEmail("  Marie.Cave@Example.COM ")).toBe(
      "marie.cave@example.com",
    );
    expect(isValidEmail("marie.cave@example.com")).toBe(true);
    expect(isValidEmail("pas-un-mail")).toBe(false);
    expect(isValidEmail(`${"a".repeat(251)}@b.c`)).toBe(false);
  });
});

describe("mot de passe", () => {
  it("vérifie le hash et refuse le mauvais secret", async () => {
    const stored = await hashPassword("cave-secrete");
    expect(await verifyPassword("cave-secrete", stored)).toBe(true);
    expect(await verifyPassword("autre", stored)).toBe(false);
    expect(await verifyPassword("cave-secrete", "invalide")).toBe(false);
  });
});
