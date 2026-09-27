import { createWineAction } from "@/app/admin/actions";
import { AdminWineForm } from "@/components/admin-wine-form";

export default function NewWinePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
        Administration
      </p>
      <h1 className="mt-2 font-serif text-4xl sm:text-5xl">
        Nouvelle bouteille
      </h1>
      <AdminWineForm
        action={createWineAction}
        submitLabel="Ajouter à la cave"
        values={{
          name: "",
          slug: "",
          region: "",
          appellation: "",
          cepage: "",
          millesime: "",
          formatLabel: "75 cl",
          color: "",
          tastingNote: "",
          imageSrc: "",
          price: "",
          stock: "12",
          position: "0",
        }}
      />
    </div>
  );
}
