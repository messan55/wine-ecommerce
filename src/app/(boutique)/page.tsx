import { CatalogFilters } from "@/components/catalog-filters";
import { WineCard } from "@/components/wine-card";
import { Button } from "@/components/ui/button";
import { formatBottleCount, parseFilters } from "@/lib/catalog";
import { listWines } from "@/lib/wines";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const filters = parseFilters({
    q: raw.q,
    region: raw.region,
    couleur: raw.couleur,
    prix: raw.prix,
  });
  const wines = await listWines(filters);
  const filtered = Boolean(
    filters.query || filters.region || filters.color || filters.price,
  );

  return (
    <div>
      <section className="bg-wine-deep text-paper">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
          <div>
            <p className="text-xs font-medium tracking-[0.28em] text-gold uppercase">
              Paris 4e · Sélection de cave
            </p>
            <h1 className="mt-4 max-w-xl font-serif text-4xl leading-[1.05] font-medium text-balance sm:text-6xl">
              Douze bouteilles, choisies pour la table.
            </h1>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-paper/85 sm:text-base">
            Bordeaux, Bourgogne, Loire, Rhône, Alsace, Champagne. On goûte, on
            écarte, on ne garde que ce qu’on servirait chez nous.
          </p>
        </div>
        <div className="h-px bg-gold/70" />
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <CatalogFilters
          q={filters.query}
          region={filters.region ?? ""}
          couleur={filters.color ?? ""}
          prix={filters.price?.id ?? ""}
        />

        <div className="mt-8 flex items-baseline justify-between gap-4">
          <h2 className="font-serif text-3xl">La cave</h2>
          <p className="text-sm text-muted-foreground">
            {formatBottleCount(wines.length)}
          </p>
        </div>

        {wines.length === 0 ? (
          <div className="mt-8 max-w-lg border border-dashed border-border bg-card px-6 py-12">
            <h3 className="font-serif text-3xl">
              Aucune bouteille pour cette sélection.
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Élargissez la recherche, la région, la couleur ou le prix.
            </p>
            <Button asChild className="mt-6 h-10" variant="outline">
              <Link href="/">Effacer les filtres</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {wines.map((wine) => (
              <li key={wine.slug}>
                <WineCard wine={wine} />
              </li>
            ))}
          </ul>
        )}

        {filtered && wines.length > 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            {[
              filters.query ? `« ${filters.query} »` : null,
              filters.region,
              filters.color === "rose"
                ? "Rosé"
                : filters.color === "rouge"
                  ? "Rouge"
                  : filters.color === "blanc"
                    ? "Blanc"
                    : filters.color === "effervescent"
                      ? "Effervescent"
                      : null,
              filters.price?.label,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
