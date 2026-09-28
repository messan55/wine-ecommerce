import type { Metadata } from "next";
import Link from "next/link";
import { formatBottleCount, formatEur } from "@/lib/catalog";
import {
  adminOrderWhere,
  orderStatusLabel,
  parseAdminOrderTab,
} from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { cn } from "cn";

export const metadata: Metadata = {
  title: "Commandes",
  description: "Suivre les ventes de la cave.",
};

const TABS = [
  { id: "expedier", label: "À expédier", href: "/admin/commandes" },
  { id: "expediees", label: "Expédiées", href: "/admin/commandes?vue=expediees" },
  { id: "toutes", label: "Toutes", href: "/admin/commandes?vue=toutes" },
] as const;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const tab = parseAdminOrderTab((await searchParams).vue);
  const orders = await prisma.order.findMany({
    where: adminOrderWhere(tab),
    include: { lines: true, user: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
        Administration
      </p>
      <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Commandes</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {orders.length} commande{orders.length > 1 ? "s" : ""}.
      </p>

      <nav className="mt-8 flex flex-wrap gap-4 text-sm">
        {TABS.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "tracking-wide hover:text-wine",
              tab === item.id ? "text-wine" : "text-muted-foreground",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {orders.length === 0 ? (
        <div className="mt-10 max-w-lg border border-dashed border-border bg-card px-6 py-12">
          <h2 className="font-serif text-3xl">
            {tab === "expedier"
              ? "Rien à expédier."
              : tab === "expediees"
                ? "Aucune expédition pour l’instant."
                : "Aucune commande."}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Les ventes s’affichent ici dès qu’un client confirme.
          </p>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {orders.map((order) => {
            const bottles = order.lines.reduce(
              (sum, line) => sum + line.quantity,
              0,
            );
            return (
              <li key={order.id}>
                <Link
                  href={`/admin/commandes/${order.id}`}
                  className="flex flex-col gap-1 py-5 hover:text-wine sm:flex-row sm:items-baseline sm:justify-between"
                >
                  <div>
                    <p className="font-serif text-2xl">
                      {formatDate(order.createdAt)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {order.email ?? order.user?.email ?? "Sans e-mail"} ·{" "}
                      {formatBottleCount(bottles)} · {formatEur(order.totalCents)}
                    </p>
                  </div>
                  <p className="text-sm tracking-wide uppercase">
                    {orderStatusLabel(order.status)}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
  }).format(value);
}
