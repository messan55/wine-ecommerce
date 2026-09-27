import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const LINKS = [
  { href: "/contact", label: "Contact" },
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/cgv", label: "CGV" },
  { href: "/confidentialite", label: "Confidentialité" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
          <p className="font-serif text-lg text-foreground">Cave Solive</p>
          <p>14 rue des Archives, 75004 Paris</p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Separator />
        <p className="max-w-2xl leading-relaxed">
          L’abus d’alcool est dangereux pour la santé, à consommer avec
          modération. Vente interdite aux mineurs. Le règlement se fait par
          carte, via Stripe. Livraison en France métropolitaine, offerte dès
          80 €.
        </p>
      </div>
    </footer>
  );
}
