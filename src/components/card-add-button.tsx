"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/button";

export function CardAddButton({
  slug,
  name,
  stock,
}: {
  slug: string;
  name: string;
  stock: number;
}) {
  const { add } = useCart();
  const [notice, setNotice] = useState<string | null>(null);

  if (stock <= 0) return null;

  return (
    <div className="px-4 pb-4">
      <Button
        type="button"
        className="h-10 w-full"
        aria-label={`Ajouter ${name} au panier`}
        onClick={() => {
          const result = add(slug, 1, stock);
          if (result.added === 0) {
            setNotice("Déjà le stock dans le panier.");
            return;
          }
          setNotice(
            result.capped
              ? "Ajouté, dans la limite du stock."
              : "Ajouté au panier.",
          );
        }}
      >
        Ajouter
      </Button>
      {notice ? (
        <p role="status" className="mt-2 text-sm">
          {notice}
        </p>
      ) : null}
    </div>
  );
}
