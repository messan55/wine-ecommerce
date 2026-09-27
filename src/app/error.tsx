"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 sm:px-6">
      <h1 className="font-serif text-4xl leading-tight">La cave ne répond pas</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Impossible de charger les bouteilles. Réessayez dans un instant.
      </p>
      <Button type="button" className="mt-6 h-10" onClick={() => reset()}>
        Réessayer
      </Button>
    </div>
  );
}
