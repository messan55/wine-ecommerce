import { Separator } from "@/components/ui/separator";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <p className="font-serif text-lg text-foreground">Cave Solive</p>
          <p>14 rue des Archives, 75004 Paris</p>
        </div>
        <Separator />
        <p className="max-w-2xl leading-relaxed">
          L’abus d’alcool est dangereux pour la santé, à consommer avec
          modération. Vente interdite aux mineurs. Le paiement en ligne n’est
          pas encore ouvert.
        </p>
      </div>
    </footer>
  );
}
