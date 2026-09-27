import { NextRequest } from "next/server";
import { handleStripeEvent } from "@/lib/checkout";
import { getStripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!stripe || !secret) {
    return new Response("Webhook Stripe non configuré.", { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Signature Stripe absente.", { status: 400 });
  }

  const payload = await request.text();

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, secret);
    await handleStripeEvent(event);
    return new Response("ok", { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook Stripe invalide.";
    return new Response(message, { status: 400 });
  }
}
