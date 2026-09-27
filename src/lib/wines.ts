import { cache } from "react";
import {
  parseColor,
  type CatalogFilters,
  type WineColor,
  type WineSummary,
} from "@/lib/catalog";
import { prisma } from "@/lib/prisma";

const wineSelect = {
  slug: true,
  name: true,
  region: true,
  appellation: true,
  cepage: true,
  millesime: true,
  formatLabel: true,
  color: true,
  tastingNote: true,
  imageSrc: true,
  priceCents: true,
  stock: true,
} as const;

type WineRow = {
  slug: string;
  name: string;
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
};

function toSummary(wine: WineRow): WineSummary {
  const color: WineColor = parseColor(wine.color) ?? "rouge";
  return { ...wine, color };
}

export async function listWines(filters: CatalogFilters) {
  const wines = await prisma.wine.findMany({
    where: {
      ...searchWhere(filters.query),
      ...(filters.region ? { region: filters.region } : {}),
      ...(filters.color ? { color: filters.color } : {}),
      ...(filters.price
        ? {
            priceCents: {
              ...(filters.price.min != null ? { gte: filters.price.min } : {}),
              ...(filters.price.max != null ? { lte: filters.price.max } : {}),
            },
          }
        : {}),
    },
    select: wineSelect,
    orderBy: { position: "asc" },
  });

  return wines.map(toSummary);
}

function searchWhere(query: string) {
  if (!query) return {};
  const year = Number(query);
  return {
    OR: [
      { name: { contains: query, mode: "insensitive" as const } },
      { appellation: { contains: query, mode: "insensitive" as const } },
      { region: { contains: query, mode: "insensitive" as const } },
      { cepage: { contains: query, mode: "insensitive" as const } },
      { tastingNote: { contains: query, mode: "insensitive" as const } },
      ...(Number.isInteger(year) && year >= 1900 && year <= 2100
        ? [{ millesime: year }]
        : []),
    ],
  };
}

export const getWineBySlug = cache(async (slug: string) => {
  const wine = await prisma.wine.findUnique({
    where: { slug },
    select: wineSelect,
  });
  return wine ? toSummary(wine) : null;
});

export async function listWineCatalog() {
  const wines = await prisma.wine.findMany({
    select: wineSelect,
    orderBy: { position: "asc" },
  });
  return wines.map(toSummary);
}
