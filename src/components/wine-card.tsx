import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  COLOR_BAND,
  colorLabel,
  formatEur,
  formatMillesime,
  stockLabel,
  type WineSummary,
} from "@/lib/catalog";

export function WineCard({ wine }: { wine: WineSummary }) {
  return (
    <article className="flex h-full flex-col border border-border bg-card shadow-[0_1px_0_rgba(61,20,28,0.04)]">
      <Link href={`/vin/${wine.slug}`} className="group flex h-full flex-col">
        <div
          className={`flex h-28 flex-col justify-between px-4 py-3 ${COLOR_BAND[wine.color]}`}
        >
          <span className="text-[0.68rem] tracking-[0.2em] uppercase">
            {colorLabel(wine.color)}
          </span>
          <span className="font-serif text-3xl leading-none">
            {formatMillesime(wine.millesime)}
          </span>
        </div>
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
            <span className="text-muted-foreground"> · {wine.formatLabel}</span>
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
