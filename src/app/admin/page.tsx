import Link from "next/link";
import { DeleteWineButton } from "@/components/delete-wine-button";
import { Button } from "@/components/ui/button";
import { WineImage } from "@/components/wine-image";
import {
  colorLabel,
  formatEur,
  formatMillesime,
  parseColor,
  stockLabel,
} from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { bottleImageAlt } from "@/lib/wine-image";
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const erreur = first((await searchParams).erreur);
  const wines = await prisma.wine.findMany({
    orderBy: { position: "asc" },
    include: { _count: { select: { orderLines: true } } },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
            Administration
          </p>
          <h1 className="mt-2 font-serif text-4xl sm:text-5xl">La cave</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {wines.length} cuvée{wines.length > 1 ? "s" : ""}.
          </p>
        </div>
        <Button asChild className="h-10">
          <Link href="/admin/vins/nouveau">Ajouter une bouteille</Link>
        </Button>
      </div>

      {erreur === "commandee" ? (
        <p className="mt-6 text-sm" role="status">
          Cette cuvée a déjà été commandée. Mettez le stock à zéro plutôt que de
          la retirer.
        </p>
      ) : null}
      {erreur === "retrait" ? (
        <p className="mt-6 text-sm text-destructive" role="alert">
          Le retrait a échoué.
        </p>
      ) : null}

      {wines.length === 0 ? (
        <div className="mt-10 max-w-lg border border-dashed border-border bg-card px-6 py-12">
          <h2 className="font-serif text-3xl">La cave est vide.</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Ajoutez une première bouteille.
          </p>
        </div>
      ) : (
        <ul className="mt-10 divide-y divide-border border-y border-border">
          {wines.map((wine) => (
            <li
              key={wine.id}
              className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-4">
                <WineImage
                  src={wine.imageSrc}
                  alt={bottleImageAlt(wine.name)}
                  color={parseColor(wine.color) ?? "rouge"}
                  sizes="64px"
                  className="h-16 w-12 shrink-0"
                />
                <div>
                <p className="font-serif text-2xl">{wine.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {wine.region} · {wine.appellation} ·{" "}
                  {formatMillesime(wine.millesime)} ·{" "}
                  {colorLabel(parseColor(wine.color) ?? "rouge")}
                </p>
                <p className="mt-1 text-sm">
                  {formatEur(wine.priceCents)} · {stockLabel(wine.stock)}
                </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Button asChild variant="outline" className="h-9">
                  <Link href={`/admin/vins/${wine.id}`}>Modifier</Link>
                </Button>
                {wine._count.orderLines === 0 ? (
                  <DeleteWineButton id={wine.id} name={wine.name} />
                ) : (
                  <p className="text-sm text-muted-foreground">Déjà commandée</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function first(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}
