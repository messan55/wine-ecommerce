import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div
      className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="text-sm text-muted-foreground">On sort la bouteille…</p>
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <Skeleton className="h-80" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-11 w-48" />
        </div>
      </div>
    </div>
  );
}
