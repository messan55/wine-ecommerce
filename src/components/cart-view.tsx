"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { QuantityField } from "@/components/quantity-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  formatBottleCount,
  formatEur,
  formatMillesime,
  type WineSummary,
} from "@/lib/catalog";

export function CartView({ wines }: { wines: WineSummary[] }) {
  const { ready, lines, setQuantity, remove, clear } = useCart();
  const [paymentOpen, setPaymentOpen] = useState(false);
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
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm">Sous-total TTC</span>
          <span className="font-serif text-2xl">{formatEur(subtotal)}</span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          La livraison n’est pas encore calculée. Le paiement viendra ensuite.
        </p>
        <Button
          type="button"
          className="mt-5 h-11 w-full"
          onClick={() => setPaymentOpen(true)}
        >
          Commander
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="mt-2 w-full"
          onClick={clear}
        >
          Vider le panier
        </Button>
      </aside>

      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              Pas de paiement pour l’instant
            </DialogTitle>
            <DialogDescription className="leading-relaxed text-foreground/80">
              Le règlement par carte viendra ensuite. Rien n’est débité, et ce
              panier n’est pas transmis : ce n’est pas une commande.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" onClick={() => setPaymentOpen(false)}>
              Compris
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
