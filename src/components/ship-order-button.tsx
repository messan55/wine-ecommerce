"use client";

import { shipOrderAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export function ShipOrderButton({ id }: { id: string }) {
  return (
    <form
      action={shipOrderAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            "Marquer cette commande comme expédiée ? Un e-mail partira au client.",
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" className="h-10">
        Expédiée
      </Button>
    </form>
  );
}
