import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatBottleCount, formatEur } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/auth";
import { VISIBLE_STATUSES } from "@/lib/checkout";
import { orderStatusLabel } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vos commandes",
  description: "Historique des commandes Cave Solive.",
};

export default async function AccountOrdersPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const orders = await prisma.order.findMany({
    where: { userId: user.id, status: { in: [...VISIBLE_STATUSES] } },
    include: { lines: { orderBy: { name: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  if (orders.length === 0) {
    return (
      <div className="max-w-lg border border-dashed border-border bg-card px-6 py-12">
        <h2 className="font-serif text-3xl">Aucune commande pour l’instant.</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Les commandes passées avec ce compte s’afficheront ici.
        </p>
        <Button asChild className="mt-6 h-10">
          <Link href="/">Retour à la cave</Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border border-y border-border">
      {orders.map((order) => {
        const bottles = order.lines.reduce(
          (sum, line) => sum + line.quantity,
          0,
        );
        const when = order.paidAt ?? order.createdAt;
        return (
          <li key={order.id}>
            <Link
              href={`/compte/commandes/${order.id}`}
              className="flex flex-col gap-1 py-5 hover:text-wine sm:flex-row sm:items-baseline sm:justify-between"
            >
              <div>
                <p className="font-serif text-2xl">{formatDate(when)}</p>
                <p className="mt-1 text-sm text-muted-foreground">
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
  );
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
  }).format(value);
}
