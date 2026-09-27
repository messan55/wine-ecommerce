import type { Metadata } from "next";
import Link from "next/link";
import { ClearPaidCart } from "@/components/clear-paid-cart";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { OrderAddress } from "@/components/order-address";
import { OrderAmounts } from "@/components/order-amounts";
import { formatBottleCount, formatEur } from "@/lib/catalog";
import { confirmPaidSession, getVisibleOrder } from "@/lib/checkout";
import { mailConfigured } from "@/lib/mail";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Commande enregistrée",
  description: "Confirmation de votre sélection Cave Solive.",
};

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const sessionId = first(raw.session_id);
  const orderId = first(raw.commande);
  const interrupted = first(raw.reglement) === "interrompu";
  const user = await getCurrentUser();
  const order = sessionId
    ? await confirmPaidSession(sessionId)
    : orderId && user
      ? await getVisibleOrder(orderId, user.id)
      : null;
  const recorded =
    order?.status === "paid" ||
    order?.status === "placed" ||
    order?.status === "pending";

  if (!recorded || !order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 sm:px-6">
        <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
          Commande
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight">
          La commande n’est pas confirmée.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Si vous avez réglé, attendez un instant puis rechargez cette page. Sinon
          le panier est toujours là.
        </p>
        <Button asChild className="mt-6 h-10">
          <Link href="/panier">Retour au panier</Link>
        </Button>
      </div>
    );
  }

  const bottles = order.lines.reduce((sum, line) => sum + line.quantity, 0);
  const paid = order.status === "paid";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <ClearPaidCart />
      <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
        Commande
      </p>
      <h1 className="mt-2 font-serif text-4xl sm:text-5xl">
        {paid ? "C’est payé." : "C’est noté."}
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
        {formatBottleCount(bottles)} · {formatEur(order.totalCents)} TTC
        {order.shippingCents === 0 ? ", livraison offerte" : ""}. Le stock a
        été retiré de la cave.
        {interrupted
          ? " Le règlement par carte n’a pas abouti ; la commande reste enregistrée."
          : order.email && (order.mailedAt || mailConfigured())
            ? ` Un e-mail de confirmation part à ${order.email}.`
            : order.email
              ? ` L’e-mail n’est pas encore configuré ; la commande est à ${order.email}.`
              : " Elle figure dans votre historique."}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Référence {order.id}.
      </p>

      <ul className="mt-8 divide-y divide-border border-y border-border">
        {order.lines.map((line) => (
          <li
            key={line.id}
            className="flex items-baseline justify-between gap-4 py-4"
          >
            <div>
              <p className="font-serif text-xl">{line.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {line.quantity} × {formatEur(line.unitCents)}
              </p>
            </div>
            <p className="font-serif text-xl">
              {formatEur(line.unitCents * line.quantity)}
            </p>
          </li>
        ))}
      </ul>
      <OrderAddress order={order} />
      <OrderAmounts
        subtotalCents={order.totalCents - order.shippingCents}
        shippingCents={order.shippingCents}
      />

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild className="h-10">
          <Link href="/">Retour à la cave</Link>
        </Button>
        {user ? (
          <Button asChild variant="outline" className="h-10">
            <Link href="/compte">Voir l’historique</Link>
          </Button>
        ) : (
          <Button asChild variant="outline" className="h-10">
            <Link
              href={`/compte/inscription?email=${encodeURIComponent(order.email ?? "")}&next=/compte`}
            >
              Créer un compte
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

function first(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}
