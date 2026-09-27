import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div className="bg-wine-deep">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <Skeleton className="h-3 w-40 bg-white/15" />
          <Skeleton className="mt-5 h-14 w-full max-w-xl bg-white/15" />
          <p className="mt-6 text-sm text-paper/80">On ouvre la cave…</p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-80" />
          ))}
        </div>
      </div>
    </div>
  );
}
