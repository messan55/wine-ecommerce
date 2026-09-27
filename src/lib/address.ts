export type ShippingAddress = {
  name: string;
  line1: string;
  line2: string;
  postal: string;
  city: string;
  phone: string;
  country: "FR";
};

export class AddressError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AddressError";
  }
}

export function parseShippingAddress(raw: unknown): ShippingAddress {
  if (!raw || typeof raw !== "object") {
    throw new AddressError("Indiquez l’adresse de livraison.");
  }
  const input = raw as Record<string, unknown>;
  const name = clean(input.name, 80);
  const line1 = clean(input.line1, 120);
  const line2 = clean(input.line2, 120);
  const postal = clean(input.postal, 10).replace(/\s/g, "");
  const city = clean(input.city, 80);
  const phone = clean(input.phone, 20);

  if (name.length < 2) throw new AddressError("Indiquez le nom du destinataire.");
  if (line1.length < 3) throw new AddressError("Indiquez la rue.");
  if (!/^\d{5}$/.test(postal)) {
    throw new AddressError("Le code postal doit faire cinq chiffres.");
  }
  if (city.length < 2) throw new AddressError("Indiquez la ville.");
  if (phone && !/^[0-9 +().-]{6,20}$/.test(phone)) {
    throw new AddressError("Le téléphone n’est pas valable.");
  }

  return { name, line1, line2, postal, city, phone, country: "FR" };
}

export function formatAddress(address: {
  shipName: string;
  shipLine1: string;
  shipLine2: string;
  shipPostal: string;
  shipCity: string;
  shipCountry: string;
  shipPhone: string;
}) {
  if (!address.shipLine1) return null;
  return {
    name: address.shipName,
    lines: [
      address.shipLine1,
      address.shipLine2,
      `${address.shipPostal} ${address.shipCity}`.trim(),
      address.shipCountry === "FR" ? "France" : address.shipCountry,
    ].filter(Boolean),
    phone: address.shipPhone,
  };
}

export function addressFromStripe(session: {
  collected_information?: {
    shipping_details?: {
      name?: string | null;
      address?: StripeLikeAddress | null;
    } | null;
  } | null;
  shipping_details?: {
    name?: string | null;
    address?: StripeLikeAddress | null;
  } | null;
}): Partial<ShippingAddress> | null {
  const details =
    session.collected_information?.shipping_details ?? session.shipping_details;
  const address = details?.address;
  if (!address?.line1 || !address.city) return null;
  return {
    name: details?.name?.trim() || "",
    line1: address.line1.trim(),
    line2: address.line2?.trim() || "",
    postal: address.postal_code?.trim() || "",
    city: address.city.trim(),
    phone: "",
    country: "FR",
  };
}

type StripeLikeAddress = {
  line1?: string | null;
  line2?: string | null;
  postal_code?: string | null;
  city?: string | null;
};

function clean(value: unknown, max: number) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}
