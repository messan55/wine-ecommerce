import { describe, expect, it } from "vitest";
import { CheckoutError, parseCheckoutLines } from "@/lib/checkout-lines";

describe("parseCheckoutLines", () => {
  it("fusionne les slugs et plafonne à 99", () => {
    expect(
      parseCheckoutLines({
        lines: [
          { slug: "riveclaire-sancerre-2023", quantity: 2 },
          { slug: "riveclaire-sancerre-2023", quantity: 3 },
          { slug: "chateau-larmont-2018", quantity: 1 },
        ],
      }),
    ).toEqual([
      { slug: "riveclaire-sancerre-2023", quantity: 5 },
      { slug: "chateau-larmont-2018", quantity: 1 },
    ]);

    expect(
      parseCheckoutLines({
        lines: [{ slug: "bellecour-brut", quantity: 80 }],
      }),
    ).toEqual([{ slug: "bellecour-brut", quantity: 80 }]);

    expect(
      parseCheckoutLines({
        lines: [
          { slug: "bellecour-brut", quantity: 80 },
          { slug: "bellecour-brut", quantity: 40 },
        ],
      }),
    ).toEqual([{ slug: "bellecour-brut", quantity: 99 }]);
  });

  it("ignore les lignes invalides et refuse un panier vide", () => {
    expect(() => parseCheckoutLines(null)).toThrow(CheckoutError);
    expect(() => parseCheckoutLines({ lines: [] })).toThrow(/vide/);
    expect(() =>
      parseCheckoutLines({
        lines: [{ slug: "x", quantity: 0 }, { slug: "", quantity: 2 }],
      }),
    ).toThrow(/vide/);
  });

  it("refuse trop de références distinctes", () => {
    const lines = Array.from({ length: 31 }, (_, index) => ({
      slug: `cuvee-${index}`,
      quantity: 1,
    }));
    expect(() => parseCheckoutLines({ lines })).toThrow(/Trop de lignes/);
  });
});
