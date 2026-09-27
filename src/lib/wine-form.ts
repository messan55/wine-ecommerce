import { COLORS, REGIONS, parseColor } from "@/lib/catalog";
import { parseBottleImageSrc } from "@/lib/wine-image";

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export type WineFormInput = {
  name: string;
  slug: string;
  region: string;
  appellation: string;
  cepage: string;
  millesime: number | null;
  formatLabel: string;
  color: string;
  tastingNote: string;
  imageSrc: string;
  priceCents: number;
  stock: number;
  position: number;
};

export class WineFormError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WineFormError";
  }
}

export function parseWineForm(formData: FormData): WineFormInput {
  const name = String(formData.get("name") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const region = String(formData.get("region") ?? "").trim();
  const appellation = String(formData.get("appellation") ?? "").trim();
  const cepage = String(formData.get("cepage") ?? "").trim();
  const millesimeRaw = String(formData.get("millesime") ?? "").trim();
  const formatLabel = String(formData.get("formatLabel") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim();
  const tastingNote = String(formData.get("tastingNote") ?? "").trim();
  const imageSrc = parseBottleImageSrc(String(formData.get("imageSrc") ?? ""));
  const priceRaw = String(formData.get("price") ?? "").trim().replace(",", ".");
  const stockRaw = String(formData.get("stock") ?? "").trim();
  const positionRaw = String(formData.get("position") ?? "").trim();

  if (!name) throw new WineFormError("Indiquez le nom de la cuvée.");
  const slug = slugify(slugRaw || name);
  if (!slug) throw new WineFormError("Le slug est vide.");
  if (!REGIONS.includes(region as (typeof REGIONS)[number])) {
    throw new WineFormError("Choisissez une région.");
  }
  if (!appellation) throw new WineFormError("Indiquez l’appellation.");
  if (!cepage) throw new WineFormError("Indiquez le cépage.");
  if (!formatLabel) throw new WineFormError("Indiquez le format.");
  if (!parseColor(color)) throw new WineFormError("Choisissez une couleur.");
  if (!tastingNote) throw new WineFormError("Ajoutez une note de dégustation.");
  if (imageSrc === null) {
    throw new WineFormError("Le chemin de l’image doit commencer par /bottles/.");
  }

  const euros = Number(priceRaw);
  if (!Number.isFinite(euros) || euros < 0) {
    throw new WineFormError("Le prix n’est pas valable.");
  }
  const stock = Number(stockRaw);
  if (!Number.isInteger(stock) || stock < 0) {
    throw new WineFormError("Le stock doit être un entier positif ou nul.");
  }
  const position = Number(positionRaw || "0");
  if (!Number.isInteger(position) || position < 0) {
    throw new WineFormError("La position doit être un entier positif ou nul.");
  }

  let millesime: number | null = null;
  if (millesimeRaw) {
    const year = Number(millesimeRaw);
    if (!Number.isInteger(year) || year < 1900 || year > 2100) {
      throw new WineFormError("Le millésime n’est pas valable.");
    }
    millesime = year;
  }

  return {
    name,
    slug,
    region,
    appellation,
    cepage,
    millesime,
    formatLabel,
    color,
    tastingNote,
    imageSrc,
    priceCents: Math.round(euros * 100),
    stock,
    position,
  };
}

export { COLORS, REGIONS };
