import { describe, expect, it } from "vitest";
import {
  adminOrderWhere,
  canShipOrder,
  orderStatusLabel,
  parseAdminOrderTab,
} from "@/lib/orders";

describe("parseAdminOrderTab", () => {
  it("prend à expédier par défaut", () => {
    expect(parseAdminOrderTab(undefined)).toBe("expedier");
    expect(parseAdminOrderTab("inconnu")).toBe("expedier");
    expect(parseAdminOrderTab(["expediees"])).toBe("expediees");
  });
});

describe("adminOrderWhere", () => {
  it("filtre la file et les expéditions", () => {
    expect(adminOrderWhere("expedier")).toEqual({
      status: { in: ["placed", "paid"] },
    });
    expect(adminOrderWhere("expediees")).toEqual({ status: "shipped" });
    expect(adminOrderWhere("toutes")).toEqual({});
  });
});

describe("canShipOrder", () => {
  it("n’autorise que placée et payée", () => {
    expect(canShipOrder("placed")).toBe(true);
    expect(canShipOrder("paid")).toBe(true);
    expect(canShipOrder("shipped")).toBe(false);
    expect(canShipOrder("pending")).toBe(false);
  });
});

describe("orderStatusLabel", () => {
  it("libellé français", () => {
    expect(orderStatusLabel("shipped")).toBe("Expédiée");
    expect(orderStatusLabel("placed")).toBe("Placée");
    expect(orderStatusLabel("paid")).toBe("Payée");
  });
});
