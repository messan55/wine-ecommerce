"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";

const LINKS = [
  {
    href: "/compte/commandes",
    label: "Commandes",
    match: (path: string) =>
      path === "/compte" || path.startsWith("/compte/commandes"),
  },
  {
    href: "/compte/adresses",
    label: "Adresses",
    match: (path: string) => path.startsWith("/compte/adresses"),
  },
];

export function AccountSectionNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 flex gap-5 border-b border-border text-sm">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "-mb-px border-b-2 pb-2 tracking-wide hover:text-wine",
            link.match(pathname)
              ? "border-wine text-wine"
              : "border-transparent text-foreground",
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
