import { describe, expect, it } from "vitest";
import {
  AddressError,
  addressFromStripe,
  formatAddress,
  parseShippingAddress,
} from "@/lib/address";

const valid = {
  name: "Marie Cave",
  line1: "14 rue des Archives",
  line2: "",
  postal: "75004",
  city: "Paris",
  phone: "01 42 78 00 00",
};

describe("parseShippingAddress", () => {
  it("accepte une adresse française", () => {
    expect(parseShippingAddress({ ...valid, postal: "75 004" })).toEqual({
      ...valid,
      postal: "75004",
      country: "FR",
    });
  });

  it("refuse un code postal hors cinq chiffres", () => {
    expect(() => parseShippingAddress({ ...valid, postal: "7500" })).toThrow(
      AddressError,
    );
  });

  it("refuse un destinataire trop court", () => {
    expect(() => parseShippingAddress({ ...valid, name: "M" })).toThrow(
      /destinataire/,
    );
  });
});

describe("formatAddress", () => {
  it("renvoie null sans rue", () => {
    expect(
      formatAddress({
        shipName: "Marie",
        shipLine1: "",
        shipLine2: "",
        shipPostal: "75004",
        shipCity: "Paris",
        shipCountry: "FR",
        shipPhone: "",
      }),
    ).toBeNull();
  });

  it("compose les lignes", () => {
    const formatted = formatAddress({
      shipName: "Marie Cave",
      shipLine1: "14 rue des Archives",
      shipLine2: "Bâtiment A",
      shipPostal: "75004",
      shipCity: "Paris",
      shipCountry: "FR",
      shipPhone: "0142780000",
    });
    expect(formatted?.lines).toEqual([
      "14 rue des Archives",
      "Bâtiment A",
      "75004 Paris",
      "France",
    ]);
  });
});

describe("addressFromStripe", () => {
  it("lit collected_information en priorité", () => {
    expect(
      addressFromStripe({
        collected_information: {
          shipping_details: {
            name: "Marie Cave",
            address: {
              line1: "14 rue des Archives",
              postal_code: "75004",
              city: "Paris",
            },
          },
        },
      }),
    ).toMatchObject({
      name: "Marie Cave",
      line1: "14 rue des Archives",
      city: "Paris",
      country: "FR",
    });
  });

  it("ignore une session sans rue", () => {
    expect(addressFromStripe({})).toBeNull();
  });
});
