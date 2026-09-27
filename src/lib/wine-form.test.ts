import { describe, expect, it } from "vitest";
import { WineFormError, parseWineForm, slugify } from "@/lib/wine-form";
import { parseBottleImageSrc } from "@/lib/wine-image";
import { isConfiguredAdmin } from "@/lib/admin-email";

describe("slugify", () => {
  it("ôte les accents et resserre les tirets", () => {
    expect(slugify(" Domaine Riveclaire — Sancerre ")).toBe(
      "domaine-riveclaire-sancerre",
    );
    expect(slugify("Côtes-du-Rhône")).toBe("cotes-du-rhone");
  });
});

describe("parseWineForm", () => {
  function form(overrides: Record<string, string> = {}) {
    const data = new FormData();
    const fields = {
      name: "Domaine Riveclaire",
      region: "Loire",
      appellation: "Sancerre",
      cepage: "Sauvignon Blanc",
      millesime: "2023",
      formatLabel: "75 cl",
      color: "blanc",
      tastingNote: "Agrumes, pierre à fusil.",
      imageSrc: "/bottles/riveclaire-sancerre-2023.jpg",
      price: "23,00",
      stock: "12",
      position: "3",
      ...overrides,
    };
    for (const [key, value] of Object.entries(fields)) {
      data.set(key, value);
    }
    return data;
  }

  it("convertit le prix en centimes et déduit le slug", () => {
    expect(parseWineForm(form())).toMatchObject({
      slug: "domaine-riveclaire",
      priceCents: 2300,
      millesime: 2023,
      stock: 12,
      color: "blanc",
    });
  });

  it("refuse une région ou une image hors cave", () => {
    expect(() => parseWineForm(form({ region: "Texas" }))).toThrow(
      WineFormError,
    );
    expect(() => parseWineForm(form({ imageSrc: "/etc/passwd" }))).toThrow(
      /image/,
    );
  });
});

describe("parseBottleImageSrc", () => {
  it("garde un chemin de cave et refuse la traversée", () => {
    expect(parseBottleImageSrc(" /bottles/cuvee.jpg ")).toBe(
      "/bottles/cuvee.jpg",
    );
    expect(parseBottleImageSrc("")).toBe("");
    expect(parseBottleImageSrc("/bottles/../secret.jpg")).toBeNull();
    expect(parseBottleImageSrc("/bottles/foo//bar.jpg")).toBeNull();
  });
});

describe("isConfiguredAdmin", () => {
  it("compare l’e-mail configuré, sans casse", () => {
    const previous = process.env.ADMIN_EMAIL;
    process.env.ADMIN_EMAIL = "Cave@Example.com";
    expect(isConfiguredAdmin("cave@example.com")).toBe(true);
    expect(isConfiguredAdmin("autre@example.com")).toBe(false);
    process.env.ADMIN_EMAIL = previous;
  });
});
