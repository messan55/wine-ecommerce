import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { WineImage } from "@/components/wine-image";
import {
  colorLabel,
  formatEur,
  formatMillesime,
  stockLabel,
  type WineSummary,
} from "@/lib/catalog";
import { bottleImageAlt } from "@/lib/wine-image";

export function WineCard({ wine }: { wine: WineSummary }) {
  return (
    <article className="flex h-full flex-col border border-border bg-card shadow-[0_1px_0_rgba(61,20,28,0.04)]">
      <Link href={`/vin/${wine.slug}`} className="group flex h-full flex-col">
        <WineImage
          src={wine.imageSrc}
          alt={bottleImageAlt(wine.name)}
          color={wine.color}
          sizes="(min-width: 1024px) 20vw, (min-width: 640px) 40vw, 90vw"
          className="aspect-[4/5]"
          badge={colorLabel(wine.color)}
        />
        <div className="flex flex-1 flex-col gap-2 p-4">
          <p className="text-[0.68rem] tracking-[0.18em] text-muted-foreground uppercase">
            {wine.region}
          </p>
          <h2 className="font-serif text-2xl leading-tight text-balance group-hover:text-wine">
            {wine.name}
          </h2>
          <p className="text-sm text-muted-foreground italic">
            {wine.appellation}
          </p>
          <p className="text-sm leading-relaxed">
            {wine.cepage}
            <span className="text-muted-foreground">
              {" "}
              · {formatMillesime(wine.millesime)} · {wine.formatLabel}
            </span>
          </p>
          <div className="mt-auto flex items-end justify-between gap-3 pt-4">
            <p className="font-serif text-xl">{formatEur(wine.priceCents)}</p>
            <Badge variant="outline">{stockLabel(wine.stock)}</Badge>
          </div>
        </div>
      </Link>
    </article>
  );
}
