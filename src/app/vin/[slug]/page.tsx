import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { Badge } from "@/components/ui/badge";
import { WineImage } from "@/components/wine-image";
import {
  colorLabel,
  formatEur,
  formatMillesime,
  stockLabel,
} from "@/lib/catalog";
import { bottleImageAlt } from "@/lib/wine-image";
import { getWineBySlug } from "@/lib/wines";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const wine = await getWineBySlug(slug);
  if (!wine) {
    return { title: "Bouteille introuvable" };
  }
  return {
    title: wine.name,
    description: `${wine.appellation}, ${formatMillesime(wine.millesime)}. ${wine.tastingNote}`,
  };
}

export default async function WinePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const wine = await getWineBySlug(slug);
  if (!wine) notFound();

  const facts = [
    ["Région", wine.region],
    ["Appellation", wine.appellation],
    ["Cépage", wine.cepage],
    ["Millésime", formatMillesime(wine.millesime)],
    ["Format", wine.formatLabel],
    ["Stock", stockLabel(wine.stock)],
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          La cave
        </Link>
        <span aria-hidden="true"> / </span>
        <Link
          href={`/?region=${encodeURIComponent(wine.region)}`}
          className="hover:text-foreground"
        >
          {wine.region}
        </Link>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
        <WineImage
          src={wine.imageSrc}
          alt={bottleImageAlt(wine.name)}
          color={wine.color}
          sizes="(min-width: 1024px) 36vw, 90vw"
          className="min-h-80 aspect-[3/4] sm:min-h-[28rem]"
          badge={`${colorLabel(wine.color)} · ${wine.formatLabel}`}
        />

        <div>
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
            {wine.region}
          </p>
          <h1 className="mt-2 font-serif text-4xl leading-tight text-balance sm:text-5xl">
            {wine.name}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground italic">
            {wine.appellation}
          </p>

          <p className="mt-6 font-serif text-3xl">{formatEur(wine.priceCents)}</p>
          <p className="mt-1 text-xs tracking-wide text-muted-foreground uppercase">
            Prix TTC
          </p>

          <dl className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {facts.map(([label, value]) => (
              <div key={label} className="border-t border-border pt-3">
                <dt className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
                  {label}
                </dt>
                <dd className="mt-1 text-sm">{value}</dd>
              </div>
            ))}
          </dl>

          <blockquote className="mt-8 border-l-2 border-gold pl-4 text-base leading-relaxed">
            {wine.tastingNote}
          </blockquote>

          <div className="mt-8 flex items-center gap-3">
            <Badge variant={wine.stock > 0 ? "secondary" : "outline"}>
              {stockLabel(wine.stock)}
            </Badge>
          </div>

          <div className="mt-6 max-w-sm">
            <AddToCart slug={wine.slug} name={wine.name} stock={wine.stock} />
          </div>
        </div>
      </div>
    </div>
  );
}
