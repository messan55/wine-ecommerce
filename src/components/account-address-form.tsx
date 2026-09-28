"use client";

import { useActionState } from "react";
import {
  saveAccountAddressAction,
  type AddressState,
} from "@/app/compte/actions";
import { AddressFields } from "@/components/address-fields";
import { Button } from "@/components/ui/button";
import type { BookAddress } from "@/lib/address";

export function AccountAddressForm({
  address,
  addressId,
}: {
  address?: BookAddress | null;
  addressId?: string;
}) {
  const [state, save, saving] = useActionState(
    saveAccountAddressAction,
    null as AddressState,
  );

  return (
    <form action={save}>
      {addressId ? <input type="hidden" name="id" value={addressId} /> : null}
      <AddressFields defaults={address} />
      {state?.error ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" className="mt-6 h-10" disabled={saving}>
        {saving ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
