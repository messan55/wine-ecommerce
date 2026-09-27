export const REGIONS = [
  "Bordeaux",
  "Bourgogne",
  "Loire",
  "Rhône",
  "Alsace",
  "Champagne",
] as const;

export type Region = (typeof REGIONS)[number];

export const COLORS = [
  { value: "rouge", label: "Rouge" },
  { value: "blanc", label: "Blanc" },
  { value: "rose", label: "Rosé" },
  { value: "effervescent", label: "Effervescent" },
] as const;

export type WineColor = (typeof COLORS)[number]["value"];

export const PRICE_BANDS = [
  { id: "lt20", label: "Moins de 20 €", min: null, max: 1999 },
  { id: "20-40", label: "20 à 40 €", min: 2000, max: 4000 },
  { id: "40-80", label: "40 à 80 €", min: 4001, max: 8000 },
  { id: "gt80", label: "Plus de 80 €", min: 8001, max: null },
] as const;

export type PriceBandId = (typeof PRICE_BANDS)[number]["id"];

export type WineSummary = {
  slug: string;
  name: string;
  region: string;
  appellation: string;
  cepage: string;
  millesime: number | null;
  formatLabel: string;
  color: WineColor;
  tastingNote: string;
  priceCents: number;
  stock: number;
};

export type CatalogFilters = {
  region: Region | null;
  color: WineColor | null;
  price: (typeof PRICE_BANDS)[number] | null;
};

export function parseColor(value: string): WineColor | null {
  return COLORS.find((color) => color.value === value)?.value ?? null;
}

export function colorLabel(color: WineColor) {
  return COLORS.find((item) => item.value === color)?.label ?? color;
}

export function parseFilters(input: {
  region?: string | string[];
  couleur?: string | string[];
  prix?: string | string[];
}): CatalogFilters {
  const regionValue = first(input.region);
  const colorValue = first(input.couleur);
  const priceValue = first(input.prix);

  return {
    region: REGIONS.find((region) => region === regionValue) ?? null,
    color: colorValue ? parseColor(colorValue) : null,
    price: PRICE_BANDS.find((band) => band.id === priceValue) ?? null,
  };
}

export function formatEur(cents: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function formatMillesime(year: number | null) {
  return year == null ? "Non millésimé" : String(year);
}

export function formatBottleCount(count: number) {
  if (count <= 0) return "Aucune bouteille";
  if (count === 1) return "1 bouteille";
  return `${count} bouteilles`;
}

export function stockLabel(stock: number) {
  if (stock <= 0) return "Rupture";
  if (stock <= 6) return `Plus que ${stock} en cave`;
  return "En cave";
}

export const COLOR_BAND: Record<WineColor, string> = {
  rouge: "bg-[#6e2430] text-[#f6efe6]",
  blanc: "bg-[#e4d2a2] text-[#3a2c12]",
  rose: "bg-[#e7b7b0] text-[#4a2428]",
  effervescent: "bg-[#f4e7c4] text-[#3a2c12]",
};

function first(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}
