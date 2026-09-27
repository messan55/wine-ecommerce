import { NextRequest } from "next/server";
import { AddressError, parseShippingAddress } from "@/lib/address";
import { getCurrentUser } from "@/lib/auth";
import {
  CheckoutError,
  createCheckoutSession,
  parseCheckoutLines,
  prepareCheckoutLines,
} from "@/lib/checkout";

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Le panier est vide." }, { status: 400 });
    }
    const user = await getCurrentUser();
    if (!user) {
      return Response.json(
        { error: "Connectez-vous ou créez un compte pour payer." },
        { status: 401 },
      );
    }
    const address = parseShippingAddress(
      body && typeof body === "object" && "address" in body
        ? body.address
        : null,
    );
    const lines = await prepareCheckoutLines(parseCheckoutLines(body));
    const origin = request.nextUrl.origin;
    const session = await createCheckoutSession(lines, origin, user, address);
    return Response.json({ url: session.url });
  } catch (error) {
    if (error instanceof AddressError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof CheckoutError) {
      const status =
        error.code === "empty"
          ? 400
          : error.code === "stock"
            ? 409
            : error.code === "config"
              ? 503
              : 500;
      return Response.json({ error: error.message }, { status });
    }

    return Response.json(
      { error: "Le paiement n’a pas pu démarrer. Réessayez." },
      { status: 500 },
    );
  }
}
