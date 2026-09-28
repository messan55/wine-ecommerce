"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { logoutAction } from "@/app/compte/actions";
import { cn } from "cn";

const itemClass =
  "block w-full px-3.5 py-2 text-left text-sm tracking-wide hover:bg-muted hover:text-wine";

export function AccountMenu({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const onAccount =
    pathname.startsWith("/compte") || pathname.startsWith("/admin");

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onDoc(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        wrapRef.current?.querySelector("a")?.focus();
      }
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={wrapRef} className="group relative">
      <Link
        href="/compte"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        className={cn(
          "text-sm tracking-wide hover:text-wine",
          onAccount ? "text-wine" : "text-foreground",
        )}
        onClick={(event) => {
          const touch =
            window.matchMedia("(hover: none)").matches ||
            window.matchMedia("(max-width: 639px)").matches;
          if (touch) {
            event.preventDefault();
            setOpen((current) => !current);
          }
        }}
      >
        Compte
      </Link>
      <div
        id={menuId}
        role="menu"
        className={cn(
          "absolute right-0 z-50 min-w-48 pt-2",
          "invisible opacity-0 pointer-events-none",
          "group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto",
          "group-focus-within:visible group-focus-within:opacity-100 group-focus-within:pointer-events-auto",
          open && "visible opacity-100 pointer-events-auto",
        )}
      >
        <div className="border border-border bg-card py-1.5 shadow-sm">
          <Link role="menuitem" href="/compte/commandes" className={itemClass}>
            Commandes
          </Link>
          <Link role="menuitem" href="/compte/adresses" className={itemClass}>
            Adresses
          </Link>
          {isAdmin ? (
            <Link role="menuitem" href="/admin" className={itemClass}>
              Administration
            </Link>
          ) : null}
          <form action={logoutAction}>
            <button type="submit" role="menuitem" className={itemClass}>
              Déconnecter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
