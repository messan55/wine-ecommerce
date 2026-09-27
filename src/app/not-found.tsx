import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 sm:px-6">
      <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
        404
      </p>
      <h1 className="mt-3 font-serif text-4xl leading-tight">
        Cette page n’existe pas.
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Le chemin ne mène nulle part dans la cave.
      </p>
      <Button asChild className="mt-6 h-10">
        <Link href="/">Retour à la cave</Link>
      </Button>
    </div>
  );
}
