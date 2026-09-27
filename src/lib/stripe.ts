import Stripe from "stripe";

export function getStripe() {
  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secret) return null;
  return new Stripe(secret);
}

export function paymentIntentId(
  value: string | Stripe.PaymentIntent | null | undefined,
) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}
