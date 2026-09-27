"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { QuantityField } from "@/components/quantity-field";
import { Button } from "@/components/ui/button";

export function AddToCart({
  slug,
  name,
  stock,
}: {
  slug: string;
  name: string;
  stock: number;
}) {
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState<string | null>(null);

  if (stock <= 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Rupture de stock. Cette cuvée reviendra si la cave la reprend.
      </p>
    );
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const result = add(slug, quantity, stock);
        if (result.added === 0) {
          setNotice("Le stock disponible est déjà dans le panier.");
          return;
        }
        setNotice(
          result.capped
            ? "Ajouté au panier, dans la limite du stock."
            : "Ajouté au panier.",
        );
      }}
    >
      <QuantityField
        value={quantity}
        max={stock}
        onChange={setQuantity}
        label={`Quantité pour ${name}`}
      />
      <Button type="submit" className="h-11 px-5 text-base">
        Ajouter au panier
      </Button>
      {notice ? (
        <p role="status" className="text-sm">
          {notice}{" "}
          <Link href="/panier" className="underline underline-offset-4">
            Voir le panier
          </Link>
        </p>
      ) : null}
    </form>
  );
}
