import { describe, expect, it } from "vitest";
import {
  shippingCents,
  shippingHint,
  shippingUnits,
} from "@/lib/shipping";

describe("shippingUnits", () => {
  it("compte une bouteille 75 cl pour une unité", () => {
    expect(shippingUnits("75 cl", 3)).toBe(3);
  });

  it("compte un magnum pour deux unités", () => {
    expect(shippingUnits("150 cl", 1)).toBe(2);
    expect(shippingUnits("Magnum", 2)).toBe(4);
  });
});

describe("shippingCents", () => {
  it("revient à zéro si le panier est vide", () => {
    expect(shippingCents(2000, 0)).toBe(0);
  });

  it("facture 8 € jusqu’à 5 unités", () => {
    expect(shippingCents(2000, 1)).toBe(800);
    expect(shippingCents(2000, 5)).toBe(800);
  });

  it("facture 12 € à partir de 6 unités", () => {
    expect(shippingCents(2000, 6)).toBe(1200);
  });

  it("offre la livraison dès 80 € de vin", () => {
    expect(shippingCents(8000, 2)).toBe(0);
    expect(shippingCents(12000, 8)).toBe(0);
  });
});

describe("shippingHint", () => {
  it("rappelle le reste avant l’offre", () => {
    expect(shippingHint(5000, 800)).toMatch(/encore/);
    expect(shippingHint(5000, 800)).toMatch(/30,00/);
  });

  it("annonce l’offre à 80 €", () => {
    expect(shippingHint(8000, 0)).toMatch(/offerte/i);
  });
});
