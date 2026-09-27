"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { cn } from "cn";

export function SiteHeader({
  email,
  isAdmin = false,
}: {
  email: string | null;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const { count, ready } = useCart();
  const onCart = pathname === "/panier";
  const onAccount = pathname.startsWith("/compte");
  const onAdmin = pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="group min-w-0">
          <span className="block font-serif text-2xl leading-none tracking-tight text-wine-deep">
            Cave Solive
          </span>
          <span className="mt-1 hidden text-[0.68rem] tracking-[0.18em] text-muted-foreground uppercase sm:block">
            Vins de France
          </span>
        </Link>
        <form
          action="/"
          method="get"
          className="hidden min-w-0 flex-1 justify-center md:flex"
        >
          <label className="sr-only" htmlFor="header-q">
            Rechercher une bouteille
          </label>
          <input
            id="header-q"
            name="q"
            type="search"
            placeholder="Rechercher…"
            className="h-9 w-full max-w-xs rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </form>
        <nav className="flex items-center gap-2 sm:gap-5">
          <Link
            href="/"
            className={cn(
              "hidden text-sm tracking-wide hover:text-wine lg:inline",
              pathname === "/" ? "text-wine" : "text-foreground",
            )}
          >
            La cave
          </Link>
          {isAdmin ? (
            <Link
              href="/admin"
              className={cn(
                "text-sm tracking-wide hover:text-wine",
                onAdmin ? "text-wine" : "text-foreground",
              )}
            >
              Admin
            </Link>
          ) : null}
          <Link
            href={email ? "/compte" : "/compte/connexion"}
            className={cn(
              "text-sm tracking-wide hover:text-wine",
              onAccount ? "text-wine" : "text-foreground",
            )}
          >
            {email ? "Compte" : "Connexion"}
          </Link>
          <Link
            href="/panier"
            aria-label={
              ready && count > 0
                ? `Panier, ${count} ${count > 1 ? "bouteilles" : "bouteille"}`
                : "Panier"
            }
            className={cn(
              "inline-flex items-center gap-2 text-sm tracking-wide hover:text-wine",
              onCart ? "text-wine" : "text-foreground",
            )}
          >
            <ShoppingBag className="size-4" aria-hidden />
            <span>Panier</span>
            {ready && count > 0 ? (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-wine px-1.5 text-xs text-paper">
                {count}
              </span>
            ) : null}
          </Link>
        </nav>
      </div>
    </header>
  );
}
