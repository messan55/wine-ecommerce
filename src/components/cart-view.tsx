"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/components/cart-provider";
import { QuantityField } from "@/components/quantity-field";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { WineImage } from "@/components/wine-image";
import {
  formatBottleCount,
  formatEur,
  formatMillesime,
  type WineSummary,
} from "@/lib/catalog";
import { bottleImageAlt } from "@/lib/wine-image";
import { shippingCents, shippingHint, shippingUnits } from "@/lib/shipping";

export function CartView({
  wines,
  canceled = false,
  signedIn = false,
}: {
  wines: WineSummary[];
  canceled?: boolean;
  signedIn?: boolean;
}) {
  const { ready, lines, setQuantity, remove, clear } = useCart();
  const bySlug = new Map(wines.map((wine) => [wine.slug, wine]));

  useEffect(() => {
    if (!ready) return;
    const stockBySlug = new Map(wines.map((wine) => [wine.slug, wine.stock]));
    for (const line of lines) {
      const stock = stockBySlug.get(line.slug);
      if (stock == null || stock <= 0) continue;
      if (line.quantity > stock) {
        setQuantity(line.slug, stock, stock);
      }
    }
  }, [lines, ready, setQuantity, wines]);

  if (!ready) {
    return (
      <p className="text-sm text-muted-foreground">On reprend le panier…</p>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="max-w-lg border border-dashed border-border bg-card px-6 py-12">
        <h2 className="font-serif text-3xl">Le panier est vide.</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Les bouteilles que vous ajoutez restent ici, sur cet appareil.
        </p>
        <Button asChild className="mt-6 h-10">
          <Link href="/">Retour à la cave</Link>
        </Button>
      </div>
    );
  }

  const rows = lines.map((line) => ({
    line,
    wine: bySlug.get(line.slug) ?? null,
  }));

  const subtotal = rows.reduce((sum, row) => {
    if (!row.wine || row.wine.stock <= 0) return sum;
    const quantity = Math.min(row.line.quantity, row.wine.stock);
    return sum + row.wine.priceCents * quantity;
  }, 0);

  const bottleCount = rows.reduce((sum, row) => {
    if (!row.wine || row.wine.stock <= 0) return sum;
    return sum + Math.min(row.line.quantity, row.wine.stock);
  }, 0);

  const units = rows.reduce((sum, row) => {
    if (!row.wine || row.wine.stock <= 0) return sum;
    const quantity = Math.min(row.line.quantity, row.wine.stock);
    return sum + shippingUnits(row.wine.formatLabel, quantity);
  }, 0);
  const deliveryCents = shippingCents(subtotal, units);
  const totalCents = subtotal + deliveryCents;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
      <ul className="divide-y divide-border border-y border-border">
        {rows.map(({ line, wine }) => {
          if (!wine) {
            return (
              <li
                key={line.slug}
                className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-serif text-xl">Cuvée introuvable</p>
                  <p className="text-sm text-muted-foreground">
                    Cette bouteille n’est plus dans la sélection.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => remove(line.slug)}
                >
                  Retirer
                </Button>
              </li>
            );
          }

          const quantity = Math.min(line.quantity, wine.stock);
          const unavailable = wine.stock <= 0;

          return (
            <li key={line.slug} className="flex flex-col gap-4 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-4">
                  <WineImage
                    src={wine.imageSrc}
                    alt={bottleImageAlt(wine.name)}
                    color={wine.color}
                    sizes="80px"
                    className="h-20 w-16 shrink-0"
                  />
                  <div>
                  <Link
                    href={`/vin/${wine.slug}`}
                    className="font-serif text-2xl leading-tight hover:text-wine"
                  >
                    {wine.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {wine.appellation} · {formatMillesime(wine.millesime)} ·{" "}
                    {wine.formatLabel}
                  </p>
                  <p className="mt-1 text-sm">{formatEur(wine.priceCents)}</p>
                  </div>
                </div>
                <p className="font-serif text-xl">
                  {unavailable
                    ? "—"
                    : formatEur(wine.priceCents * quantity)}
                </p>
              </div>
              {unavailable ? (
                <p className="text-sm text-muted-foreground">Rupture de stock.</p>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <QuantityField
                    value={Math.max(quantity, 1)}
                    max={wine.stock}
                    label={`Quantité de ${wine.name}`}
                    onChange={(next) => setQuantity(wine.slug, next, wine.stock)}
                  />
                </div>
              )}
              <div>
                <Button
                  type="button"
                  variant="ghost"
                  className="px-0"
                  onClick={() => remove(wine.slug)}
                >
                  Retirer
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      <aside className="border border-border bg-card p-5">
        <h2 className="font-serif text-2xl">Récapitulatif</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {formatBottleCount(bottleCount)}
        </p>
        <Separator className="my-4" />
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <span>Sous-total TTC</span>
          <span>{formatEur(subtotal)}</span>
        </div>
        <div className="mt-2 flex items-baseline justify-between gap-3 text-sm">
          <span>Livraison</span>
          <span>
            {deliveryCents === 0 ? "Offerte" : formatEur(deliveryCents)}
          </span>
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-3">
          <span className="text-sm">Total TTC</span>
          <span className="font-serif text-2xl">{formatEur(totalCents)}</span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {shippingHint(subtotal, deliveryCents)} Commander écrit la
          commande en cave et retire le stock.
          {signedIn
            ? " Le règlement se fait ensuite par carte, via Stripe."
            : " Un compte est nécessaire avant de commander."}
        </p>
        {canceled ? (
          <p className="mt-3 text-sm" role="status">
            Le paiement a été interrompu. Rien n’a été débité.
          </p>
        ) : null}
        {signedIn ? (
          <Button asChild className="mt-5 h-11 w-full">
            <Link href="/commande">Commander</Link>
          </Button>
        ) : (
          <div className="mt-5 grid gap-2">
            <Button asChild className="h-11 w-full">
              <Link href="/compte/connexion?next=/commande">
                Se connecter pour commander
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 w-full">
              <Link href="/compte/inscription?next=/commande">
                Créer un compte
              </Link>
            </Button>
          </div>
        )}
        <Button
          type="button"
          variant="ghost"
          className="mt-2 w-full"
          onClick={clear}
        >
          Vider le panier
        </Button>
      </aside>
    </div>
  );
}
