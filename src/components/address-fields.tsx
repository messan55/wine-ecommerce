import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BookAddress } from "@/lib/address";

export function AddressFields({
  defaults,
}: {
  defaults?: BookAddress | null;
}) {
  return (
    <div className="grid max-w-xl gap-4">
      <Field label="Nom" htmlFor="name">
        <Input
          id="name"
          name="name"
          required
          autoComplete="name"
          defaultValue={defaults?.name ?? ""}
          className="h-10"
        />
      </Field>
      <Field label="Rue" htmlFor="line1">
        <Input
          id="line1"
          name="line1"
          required
          autoComplete="address-line1"
          defaultValue={defaults?.line1 ?? ""}
          className="h-10"
        />
      </Field>
      <Field label="Complément" htmlFor="line2">
        <Input
          id="line2"
          name="line2"
          autoComplete="address-line2"
          defaultValue={defaults?.line2 ?? ""}
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
            defaultValue={defaults?.postal ?? ""}
            className="h-10"
          />
        </Field>
        <Field label="Ville" htmlFor="city">
          <Input
            id="city"
            name="city"
            required
            autoComplete="address-level2"
            defaultValue={defaults?.city ?? ""}
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
          defaultValue={defaults?.phone ?? ""}
          className="h-10"
        />
      </Field>
    </div>
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
