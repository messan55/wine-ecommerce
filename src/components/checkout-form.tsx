"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatBottleCount, formatEur, type WineSummary } from "@/lib/catalog";
import { shippingCents, shippingHint, shippingUnits } from "@/lib/shipping";

export function CheckoutForm({
  wines,
  lastAddress,
}: {
  wines: WineSummary[];
  lastAddress: {
    name: string;
    line1: string;
    line2: string;
    postal: string;
    city: string;
    phone: string;
  } | null;
}) {
  const { ready, lines, clear } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitting = useRef(false);
  const bySlug = new Map(wines.map((wine) => [wine.slug, wine]));

  if (!ready) {
    return (
      <p className="text-sm text-muted-foreground">On reprend le panier…</p>
    );
  }

  const rows = lines
    .map((line) => {
      const wine = bySlug.get(line.slug);
      if (!wine || wine.stock <= 0) return null;
      const quantity = Math.min(line.quantity, wine.stock);
      return { wine, quantity };
    })
    .filter((row) => row !== null);

  if (rows.length === 0) {
    return (
      <div className="max-w-lg border border-dashed border-border bg-card px-6 py-12">
        <h2 className="font-serif text-3xl">Le panier est vide.</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Ajoutez une bouteille avant d’indiquer l’adresse.
        </p>
        <Button asChild className="mt-6 h-10">
          <Link href="/">Retour à la cave</Link>
        </Button>
      </div>
    );
  }

  const subtotal = rows.reduce(
    (sum, row) => sum + row.wine.priceCents * row.quantity,
    0,
  );
  const units = rows.reduce(
    (sum, row) => sum + shippingUnits(row.wine.formatLabel, row.quantity),
    0,
  );
  const deliveryCents = shippingCents(subtotal, units);
  const totalCents = subtotal + deliveryCents;
  const bottles = rows.reduce((sum, row) => sum + row.quantity, 0);

  async function submit(formData: FormData) {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: rows.map((row) => ({
            slug: row.wine.slug,
            quantity: row.quantity,
          })),
          address: {
            name: String(formData.get("name") ?? ""),
            line1: String(formData.get("line1") ?? ""),
            line2: String(formData.get("line2") ?? ""),
            postal: String(formData.get("postal") ?? ""),
            city: String(formData.get("city") ?? ""),
            phone: String(formData.get("phone") ?? ""),
          },
        }),
      });
      const data: unknown = await response.json();
      const url =
        data &&
        typeof data === "object" &&
        "url" in data &&
        typeof data.url === "string"
          ? data.url
          : null;
      const message =
        data &&
        typeof data === "object" &&
        "error" in data &&
        typeof data.error === "string"
          ? data.error
          : "La commande n’a pas pu partir. Réessayez.";
      if (!response.ok || !url) {
        submitting.current = false;
        setError(message);
        return;
      }
      clear();
      window.location.assign(url);
    } catch {
      submitting.current = false;
      setError("Impossible de joindre la cave. Réessayez.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start"
      action={(formData) => {
        void submit(formData);
      }}
    >
      <div>
        <h2 className="font-serif text-2xl">Adresse de livraison</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          France métropolitaine uniquement.
        </p>
        <div className="mt-6 grid max-w-xl gap-4">
          <Field label="Nom" htmlFor="name">
            <Input
              id="name"
              name="name"
              required
              autoComplete="name"
              defaultValue={lastAddress?.name ?? ""}
              className="h-10"
            />
          </Field>
          <Field label="Rue" htmlFor="line1">
            <Input
              id="line1"
              name="line1"
              required
              autoComplete="address-line1"
              defaultValue={lastAddress?.line1 ?? ""}
              className="h-10"
            />
          </Field>
          <Field label="Complément" htmlFor="line2">
            <Input
              id="line2"
              name="line2"
              autoComplete="address-line2"
              defaultValue={lastAddress?.line2 ?? ""}
              className="h-10"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-[8rem_minmax(0,1fr)]">
            <Field label="Code postal" htmlFor="postal">
              <Input
                id="postal"
                name="postal"
                required
                inputMode="numeric"
                autoComplete="postal-code"
                defaultValue={lastAddress?.postal ?? ""}
                className="h-10"
              />
            </Field>
            <Field label="Ville" htmlFor="city">
              <Input
                id="city"
                name="city"
                required
                autoComplete="address-level2"
                defaultValue={lastAddress?.city ?? ""}
                className="h-10"
              />
            </Field>
          </div>
          <Field label="Téléphone" htmlFor="phone">
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              defaultValue={lastAddress?.phone ?? ""}
              className="h-10"
            />
          </Field>
        </div>
      </div>

      <aside className="border border-border bg-card p-5">
        <h2 className="font-serif text-2xl">Récapitulatif</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {formatBottleCount(bottles)}
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          {rows.map((row) => (
            <li key={row.wine.slug} className="flex justify-between gap-3">
              <span>
                {row.quantity} × {row.wine.name}
              </span>
              <span>{formatEur(row.wine.priceCents * row.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between gap-3 text-sm">
          <span>Sous-total TTC</span>
          <span>{formatEur(subtotal)}</span>
        </div>
        <div className="mt-2 flex justify-between gap-3 text-sm">
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
          {shippingHint(subtotal, deliveryCents)} Un e-mail de confirmation
          partira à votre adresse de compte.
        </p>
        {error ? (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="mt-5 h-11 w-full" disabled={busy}>
          {busy ? "Enregistrement…" : "Confirmer la commande"}
        </Button>
        <Button asChild type="button" variant="ghost" className="mt-2 w-full">
          <Link href="/panier">Retour au panier</Link>
        </Button>
      </aside>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
