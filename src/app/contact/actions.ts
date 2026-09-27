"use server";

import { sendContactMessage } from "@/lib/mail";
import { isValidEmail, normalizeEmail } from "@/lib/password";

export type ContactState = {
  error?: string;
  sent?: boolean;
} | null;

export async function contactAction(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = String(formData.get("name") ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const message = String(formData.get("message") ?? "").trim().slice(0, 2000);

  if (name.length < 2) return { error: "Indiquez votre nom." };
  if (!isValidEmail(email)) return { error: "Indiquez un e-mail valable." };
  if (message.length < 10) {
    return { error: "Écrivez quelques mots, au moins dix caractères." };
  }

  try {
    const sent = await sendContactMessage({ name, email, message });
    if (!sent) {
      return {
        error:
          "Le courrier n’est pas configuré sur ce serveur. Réessayez plus tard, ou écrivez au 14 rue des Archives, 75004 Paris.",
      };
    }
    return { sent: true };
  } catch {
    return { error: "Le message n’est pas parti. Réessayez." };
  }
}
