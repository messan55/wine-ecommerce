"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WineActionState } from "@/app/admin/actions";
import type { ReactNode } from "react";
import { COLORS, REGIONS } from "@/lib/catalog";

export type AdminWineValues = {
  id?: string;
  name: string;
  slug: string;
  region: string;
  appellation: string;
  cepage: string;
  millesime: string;
  formatLabel: string;
  color: string;
  tastingNote: string;
  imageSrc: string;
  price: string;
  stock: string;
  position: string;
};

export function AdminWineForm({
  action,
  values,
  submitLabel,
}: {
  action: (state: WineActionState, formData: FormData) => Promise<WineActionState>;
  values: AdminWineValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="mt-8 grid max-w-xl gap-4">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      <Field label="Nom" htmlFor="name">
        <Input id="name" name="name" required defaultValue={values.name} className="h-10" />
      </Field>
      <Field label="Slug" htmlFor="slug">
        <Input id="slug" name="slug" defaultValue={values.slug} className="h-10" />
        <p className="text-xs text-muted-foreground">
          Vide : il sera formé d’après le nom.
        </p>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Région" htmlFor="region">
          <select
            id="region"
            name="region"
            required
            defaultValue={values.region}
            className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="">Choisir</option>
            {REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Couleur" htmlFor="color">
          <select
            id="color"
            name="color"
            required
            defaultValue={values.color}
            className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="">Choisir</option>
            {COLORS.map((color) => (
              <option key={color.value} value={color.value}>
                {color.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Appellation" htmlFor="appellation">
        <Input
          id="appellation"
          name="appellation"
          required
          defaultValue={values.appellation}
          className="h-10"
        />
      </Field>
      <Field label="Cépage" htmlFor="cepage">
        <Input id="cepage" name="cepage" required defaultValue={values.cepage} className="h-10" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Millésime" htmlFor="millesime">
          <Input
            id="millesime"
            name="millesime"
            inputMode="numeric"
            defaultValue={values.millesime}
            className="h-10"
            placeholder="Vide si non millésimé"
          />
        </Field>
        <Field label="Format" htmlFor="formatLabel">
          <Input
            id="formatLabel"
            name="formatLabel"
            required
            defaultValue={values.formatLabel}
            className="h-10"
          />
        </Field>
      </div>
      <Field label="Photo de la bouteille" htmlFor="image">
        {values.imageSrc ? (
          <img
            src={values.imageSrc}
            alt=""
            className="h-36 w-auto border border-border bg-[#f3ece0] object-contain"
          />
        ) : null}
        <Input
          id="image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="h-10"
        />
        <Input
          id="imageSrc"
          name="imageSrc"
          defaultValue={values.imageSrc}
          placeholder="/bottles/ma-cuvee.jpg"
          className="h-10"
        />
        <p className="text-xs text-muted-foreground">
          JPEG, PNG ou WebP, 2 Mo max. Sinon un chemin dans /bottles/.
        </p>
      </Field>
      <Field label="Note de dégustation" htmlFor="tastingNote">
        <textarea
          id="tastingNote"
          name="tastingNote"
          required
          rows={4}
          defaultValue={values.tastingNote}
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Prix TTC (€)" htmlFor="price">
          <Input
            id="price"
            name="price"
            required
            inputMode="decimal"
            defaultValue={values.price}
            className="h-10"
          />
        </Field>
        <Field label="Stock" htmlFor="stock">
          <Input
            id="stock"
            name="stock"
            required
            inputMode="numeric"
            defaultValue={values.stock}
            className="h-10"
          />
        </Field>
        <Field label="Position" htmlFor="position">
          <Input
            id="position"
            name="position"
            inputMode="numeric"
            defaultValue={values.position}
            className="h-10"
          />
        </Field>
      </div>
      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" className="h-11" disabled={pending}>
          {pending ? "Enregistrement…" : submitLabel}
        </Button>
        <Button asChild type="button" variant="outline" className="h-11">
          <Link href="/admin">Annuler</Link>
        </Button>
      </div>
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
