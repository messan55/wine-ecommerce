"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";

const LINKS = [
  {
    href: "/admin/commandes",
    label: "Commandes",
    match: (path: string) => path.startsWith("/admin/commandes"),
  },
  { href: "/admin", label: "La cave", match: (path: string) => path === "/admin" || path.startsWith("/admin/vins") },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border">
      <div className="mx-auto flex h-12 max-w-5xl items-center gap-5 px-4 text-sm sm:px-6">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "tracking-wide hover:text-wine",
              link.match(pathname) ? "text-wine" : "text-foreground",
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
