import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div
      className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="text-sm text-muted-foreground">On ouvre la cave…</p>
      <Skeleton className="mt-4 h-12 w-64" />
      <Skeleton className="mt-8 h-24 w-full" />
    </div>
  );
}
