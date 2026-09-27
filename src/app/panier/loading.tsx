import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div
      className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="text-sm text-muted-foreground">On reprend le panier…</p>
      <Skeleton className="mt-4 h-12 w-64" />
      <div className="mt-8 space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full max-w-xs" />
      </div>
    </div>
  );
}
