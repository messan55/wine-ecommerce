import { notFound } from "next/navigation";
import { updateWineAction } from "@/app/admin/actions";
import { AdminWineForm } from "@/components/admin-wine-form";
import { prisma } from "@/lib/prisma";

export default async function EditWinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const wine = await prisma.wine.findUnique({ where: { id } });
  if (!wine) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
        Administration
      </p>
      <h1 className="mt-2 font-serif text-4xl sm:text-5xl">{wine.name}</h1>
      <AdminWineForm
        action={updateWineAction}
        submitLabel="Enregistrer"
        values={{
          id: wine.id,
          name: wine.name,
          slug: wine.slug,
          region: wine.region,
          appellation: wine.appellation,
          cepage: wine.cepage,
          millesime: wine.millesime == null ? "" : String(wine.millesime),
          formatLabel: wine.formatLabel,
          color: wine.color,
          tastingNote: wine.tastingNote,
          imageSrc: wine.imageSrc,
          price: (wine.priceCents / 100).toFixed(2),
          stock: String(wine.stock),
          position: String(wine.position),
        }}
      />
    </div>
  );
}
