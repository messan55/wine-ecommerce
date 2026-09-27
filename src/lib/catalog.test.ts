import { describe, expect, it } from "vitest";
import {
  formatBottleCount,
  formatEur,
  formatMillesime,
  parseColor,
  parseFilters,
  stockLabel,
} from "@/lib/catalog";
import { catalogHref } from "@/lib/catalog-url";

describe("parseFilters", () => {
  it("lit la recherche et les filtres", () => {
    expect(
      parseFilters({
        q: "  Sancerre  ",
        region: "Loire",
        couleur: "blanc",
        prix: "20-40",
      }),
    ).toEqual({
      query: "Sancerre",
      region: "Loire",
      color: "blanc",
      price: expect.objectContaining({ id: "20-40" }),
    });
  });

  it("prend le premier élément d’un tableau et ignore l’inconnu", () => {
    expect(
      parseFilters({
        q: ["pinot", "syrah"],
        region: "Texas",
        couleur: "orange",
        prix: "abc",
      }),
    ).toEqual({
      query: "pinot",
      region: null,
      color: null,
      price: null,
    });
  });

  it("tronque la recherche à 80 caractères", () => {
    expect(parseFilters({ q: "a".repeat(100) }).query).toHaveLength(80);
  });
});

describe("libellés", () => {
  it("formate les euros, le millésime et le stock", () => {
    expect(formatEur(2300)).toMatch(/23,00/);
    expect(formatEur(2300)).toMatch(/€/);
    expect(formatMillesime(null)).toBe("Non millésimé");
    expect(formatMillesime(2022)).toBe("2022");
    expect(formatBottleCount(0)).toBe("Aucune bouteille");
    expect(formatBottleCount(1)).toBe("1 bouteille");
    expect(formatBottleCount(12)).toBe("12 bouteilles");
    expect(stockLabel(0)).toBe("Rupture");
    expect(stockLabel(4)).toBe("Plus que 4 en cave");
    expect(stockLabel(12)).toBe("En cave");
    expect(parseColor("rose")).toBe("rose");
    expect(parseColor("nope")).toBeNull();
  });
});

describe("catalogHref", () => {
  it("construit l’URL ou revient à la cave", () => {
    expect(catalogHref({})).toBe("/");
    expect(catalogHref({ q: "sancerre", region: "Loire" })).toBe(
      "/?q=sancerre&region=Loire",
    );
  });
});
