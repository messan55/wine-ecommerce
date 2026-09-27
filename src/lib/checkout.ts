import {
  addressFromStripe,
  type ShippingAddress,
} from "@/lib/address";
import { formatMillesime } from "@/lib/catalog";
import {
  CheckoutError,
  type CheckoutLineInput,
} from "@/lib/checkout-lines";
import { sendOrderConfirmation } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { shippingCents, shippingUnits } from "@/lib/shipping";
import { getStripe, paymentIntentId } from "@/lib/stripe";
import type Stripe from "stripe";

export {
  CheckoutError,
  parseCheckoutLines,
  type CheckoutLineInput,
} from "@/lib/checkout-lines";

export type PreparedLine = {
  wineId: string;
  slug: string;
  name: string;
  description: string;
  quantity: number;
  unitCents: number;
  formatLabel: string;
};

export async function prepareCheckoutLines(
  inputs: CheckoutLineInput[],
): Promise<PreparedLine[]> {
  const wines = await prisma.wine.findMany({
    where: { slug: { in: inputs.map((line) => line.slug) } },
    select: {
      id: true,
      slug: true,
      name: true,
      appellation: true,
      millesime: true,
      formatLabel: true,
      priceCents: true,
      stock: true,
    },
  });
  const bySlug = new Map(wines.map((wine) => [wine.slug, wine]));

  return inputs.map((input) => {
    const wine = bySlug.get(input.slug);
    if (!wine || wine.stock < input.quantity) {
      throw new CheckoutError(
        "stock",
        "Le stock a changé. Revenez au panier pour ajuster les quantités.",
      );
    }

    return {
      wineId: wine.id,
      slug: wine.slug,
      name: wine.name,
      description: `${wine.appellation} · ${formatMillesime(wine.millesime)} · ${wine.formatLabel}`,
      quantity: input.quantity,
      unitCents: wine.priceCents,
      formatLabel: wine.formatLabel,
    };
  });
}

export async function createCheckoutSession(
  lines: PreparedLine[],
  origin: string,
  user: { id: string; email: string },
  address: ShippingAddress,
) {
  const subtotalCents = lines.reduce(
    (sum, line) => sum + line.unitCents * line.quantity,
    0,
  );
  const units = lines.reduce(
    (sum, line) => sum + shippingUnits(line.formatLabel, line.quantity),
    0,
  );
  const deliveryCents = shippingCents(subtotalCents, units);
  const totalCents = subtotalCents + deliveryCents;

  const order = await reserveOrder(
    lines,
    totalCents,
    deliveryCents,
    user,
    address,
  );
  const stripe = getStripe();
  if (!stripe) {
    await mailOrder(order.id);
    return {
      url: `${origin}/commande/succes?commande=${order.id}`,
      orderId: order.id,
    };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "fr",
      client_reference_id: order.id,
      metadata: {
        orderId: order.id,
        userId: user.id,
      },
      customer_email: user.email,
      shipping_address_collection: {
        allowed_countries: ["FR"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: deliveryCents, currency: "eur" },
            display_name:
              deliveryCents === 0
                ? "Livraison offerte — France métropolitaine"
                : "Livraison — France métropolitaine",
          },
        },
      ],
      success_url: `${origin}/commande/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/commande/succes?commande=${order.id}&reglement=interrompu`,
      line_items: lines.map((line) => ({
        quantity: line.quantity,
        price_data: {
          currency: "eur",
          unit_amount: line.unitCents,
          product_data: {
            name: line.name,
            description: line.description,
          },
        },
      })),
    });

    if (!session.url) {
      throw new CheckoutError("unknown", "Stripe n’a pas renvoyé d’adresse.");
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });
    await mailOrder(order.id);

    return { url: session.url, orderId: order.id };
  } catch (error) {
    await releaseOrder(order.id, "canceled");
    if (error instanceof CheckoutError) throw error;
    throw new CheckoutError(
      "unknown",
      "Le paiement n’a pas pu démarrer. Réessayez.",
    );
  }
}

export async function confirmPaidSession(sessionId: string) {
  const stripe = getStripe();
  if (!stripe) return null;

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["collected_information.shipping_details"],
  });
  if (session.payment_status !== "paid") {
    return getOrderBySession(sessionId);
  }

  return markOrderPaid(session);
}

export async function cancelCheckoutSession(sessionId: string) {
  const stripe = getStripe();
  const order = await getOrderBySession(sessionId);
  if (!order || (order.status !== "pending" && order.status !== "placed")) {
    return;
  }

  if (!stripe) return;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid") {
      await confirmPaidSession(sessionId);
      return;
    }
    if (session.status === "open") {
      await stripe.checkout.sessions.expire(sessionId);
    }
  } catch {
    // La commande reste écrite ; on ne remet pas le stock.
  }
}

export async function handleStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status === "paid") {
        await markOrderPaid(session);
      }
      return;
    }
    case "checkout.session.expired":
    case "checkout.session.async_payment_failed": {
      return;
    }
  }
}

async function reserveOrder(
  lines: PreparedLine[],
  totalCents: number,
  deliveryCents: number,
  user: { id: string; email: string },
  address: ShippingAddress,
) {
  return prisma.$transaction(async (tx) => {
    for (const line of lines) {
      const updated = await tx.wine.updateMany({
        where: { id: line.wineId, stock: { gte: line.quantity } },
        data: { stock: { decrement: line.quantity } },
      });
      if (updated.count !== 1) {
        throw new CheckoutError(
          "stock",
          "Le stock a changé. Revenez au panier pour ajuster les quantités.",
        );
      }
    }

    return tx.order.create({
      data: {
        status: "placed",
        totalCents,
        shippingCents: deliveryCents,
        userId: user.id,
        email: user.email,
        shipName: address.name,
        shipLine1: address.line1,
        shipLine2: address.line2,
        shipPostal: address.postal,
        shipCity: address.city,
        shipCountry: address.country,
        shipPhone: address.phone,
        lines: {
          create: lines.map((line) => ({
            wineId: line.wineId,
            slug: line.slug,
            name: line.name,
            quantity: line.quantity,
            unitCents: line.unitCents,
          })),
        },
      },
    });
  });
}

async function markOrderPaid(session: Stripe.Checkout.Session) {
  const order = await findOrderForSession(session);
  if (!order) return null;
  if (order.status === "paid") return order;

  const email = normalizeOrderEmail(
    session.customer_details?.email ?? session.customer_email ?? order.email,
  );
  const intent = paymentIntentId(session.payment_intent);
  const userId =
    order.userId ??
    session.metadata?.userId ??
    (email
      ? (await prisma.user.findUnique({
          where: { email },
          select: { id: true },
        }))?.id
      : null);

  const fromStripe = !order.shipLine1 ? addressFromStripe(session) : null;

  await prisma.order.updateMany({
    where: { id: order.id, status: { in: ["pending", "placed"] } },
    data: {
      status: "paid",
      paidAt: new Date(),
      email: email ?? order.email,
      userId: userId ?? order.userId,
      stripeSessionId: session.id,
      stripePaymentIntentId: intent ?? order.stripePaymentIntentId,
      ...(fromStripe
        ? {
            shipName: fromStripe.name ?? "",
            shipLine1: fromStripe.line1 ?? "",
            shipLine2: fromStripe.line2 ?? "",
            shipPostal: fromStripe.postal ?? "",
            shipCity: fromStripe.city ?? "",
            shipCountry: fromStripe.country ?? "FR",
          }
        : {}),
    },
  });

  const paid = await prisma.order.findUnique({
    where: { id: order.id },
    include: { lines: { orderBy: { name: "asc" } } },
  });
  if (paid) await mailOrder(paid.id);
  return paid;
}

async function mailOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { lines: { orderBy: { name: "asc" } } },
  });
  if (!order || order.mailedAt) return;

  try {
    const sent = await sendOrderConfirmation(order);
    if (sent) {
      await prisma.order.update({
        where: { id: order.id },
        data: { mailedAt: new Date() },
      });
    }
  } catch {
    // Le checkout ne dépend pas du courrier.
  }
}

async function releaseOrder(
  orderId: string,
  status: "canceled" | "expired",
) {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { lines: true },
    });
    if (!order || (order.status !== "pending" && order.status !== "placed")) {
      return;
    }

    const updated = await tx.order.updateMany({
      where: { id: orderId, status: { in: ["pending", "placed"] } },
      data: { status },
    });
    if (updated.count !== 1) return;

    for (const line of order.lines) {
      await tx.wine.update({
        where: { id: line.wineId },
        data: { stock: { increment: line.quantity } },
      });
    }
  });
}

async function findOrderForSession(session: Stripe.Checkout.Session) {
  const bySession = await getOrderBySession(session.id);
  if (bySession) return bySession;

  const orderId = session.metadata?.orderId ?? session.client_reference_id;
  if (!orderId) return null;

  return prisma.order.findUnique({
    where: { id: orderId },
    include: { lines: { orderBy: { name: "asc" } } },
  });
}

function normalizeOrderEmail(value: string | null | undefined) {
  const email = value?.trim().toLowerCase();
  return email && email.length > 0 ? email : null;
}

export async function getOrderBySession(sessionId: string) {
  return prisma.order.findUnique({
    where: { stripeSessionId: sessionId },
    include: { lines: { orderBy: { name: "asc" } } },
  });
}

const VISIBLE_STATUSES = ["placed", "paid", "pending"] as const;

export async function getVisibleOrder(orderId: string, userId: string) {
  return prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
      status: { in: [...VISIBLE_STATUSES] },
    },
    include: { lines: { orderBy: { name: "asc" } } },
  });
}

export async function getLastShippingAddress(userId: string) {
  const order = await prisma.order.findFirst({
    where: { userId, shipLine1: { not: "" } },
    orderBy: { createdAt: "desc" },
    select: {
      shipName: true,
      shipLine1: true,
      shipLine2: true,
      shipPostal: true,
      shipCity: true,
      shipPhone: true,
    },
  });
  if (!order) return null;
  return {
    name: order.shipName,
    line1: order.shipLine1,
    line2: order.shipLine2,
    postal: order.shipPostal,
    city: order.shipCity,
    phone: order.shipPhone,
  };
}

export { VISIBLE_STATUSES };
