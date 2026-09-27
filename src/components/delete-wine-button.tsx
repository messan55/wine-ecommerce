"use client";

import { deleteWineAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export function DeleteWineButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  return (
    <form
      action={deleteWineAction}
      onSubmit={(event) => {
        if (!window.confirm(`Retirer « ${name} » de la cave ?`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="ghost" className="px-0">
        Retirer
      </Button>
    </form>
  );
}
