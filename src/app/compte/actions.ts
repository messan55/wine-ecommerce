"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AddressError, parseShippingAddress } from "@/lib/address";
import { attachOrdersToUser, getCurrentUser, promoteConfiguredAdmin } from "@/lib/auth";
import { hashPassword, isValidEmail, normalizeEmail, verifyPassword } from "@/lib/password";
import {
  consumePasswordReset,
  requestPasswordReset,
} from "@/lib/password-reset";
import { prisma } from "@/lib/prisma";
import { clearSessionCookie, setSessionCookie } from "@/lib/session";
import {
  createUserAddress,
  deleteUserAddress,
  setDefaultAddress,
  updateUserAddress,
} from "@/lib/user-address";

export type AuthState = {
  error: string;
} | null;

export type EmailLookupState = {
  error?: string;
  email?: string;
  exists?: boolean;
} | null;

export async function lookupEmailAction(
  _prev: EmailLookupState,
  formData: FormData,
): Promise<EmailLookupState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  if (!isValidEmail(email)) {
    return { error: "Indiquez une adresse e-mail valable." };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return { email, exists: Boolean(user) };
}

function safeNext(value: unknown) {
  if (typeof value !== "string") return "/compte";
  if (!value.startsWith("/") || value.startsWith("//")) return "/compte";
  return value;
}

export async function registerAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!isValidEmail(email)) {
    return { error: "Indiquez une adresse e-mail valable." };
  }
  if (password.length < 8) {
    return { error: "Le mot de passe doit faire au moins 8 caractères." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Cette adresse a déjà un compte. Connectez-vous." };
  }

  try {
    const user = await prisma.user.create({
      data: { email, passwordHash: await hashPassword(password) },
      select: { id: true, email: true },
    });
    await attachOrdersToUser(user.id, user.email);
    await promoteConfiguredAdmin(user.id, user.email);
    await setSessionCookie(user.id);
  } catch (error) {
    if (error instanceof Error && error.message.includes("AUTH_SECRET")) {
      return { error: "AUTH_SECRET est absent du fichier .env." };
    }
    return { error: "Le compte n’a pas pu être créé. Réessayez." };
  }

  redirect(next);
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!isValidEmail(email) || password.length < 1) {
    return { error: "E-mail ou mot de passe incorrect." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const ok = user ? await verifyPassword(password, user.passwordHash) : false;
  if (!user || !ok) {
    return { error: "E-mail ou mot de passe incorrect." };
  }

  try {
    await attachOrdersToUser(user.id, user.email);
    await promoteConfiguredAdmin(user.id, user.email);
    await setSessionCookie(user.id);
  } catch (error) {
    if (error instanceof Error && error.message.includes("AUTH_SECRET")) {
      return { error: "AUTH_SECRET est absent du fichier .env." };
    }
    return { error: "La connexion a échoué. Réessayez." };
  }

  redirect(next);
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/");
}

export type ResetRequestState = {
  error?: string;
  sent?: boolean;
} | null;

export async function requestResetAction(
  _prev: ResetRequestState,
  formData: FormData,
): Promise<ResetRequestState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  if (!isValidEmail(email)) {
    return { error: "Indiquez une adresse e-mail valable." };
  }

  try {
    const result = await requestPasswordReset(email);
    if (!result.configured) {
      return {
        error:
          "Le courrier n’est pas configuré sur ce serveur. Réessayez plus tard.",
      };
    }
    if (!result.sent) {
      return { error: "Le message n’est pas parti. Réessayez." };
    }
    return { sent: true };
  } catch {
    return { error: "Le lien n’a pas pu être envoyé. Réessayez." };
  }
}

export type ResetPasswordState = {
  error?: string;
} | null;

export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!token) return { error: "Ce lien n’est plus valable." };
  if (password.length < 8) {
    return { error: "Le mot de passe doit faire au moins 8 caractères." };
  }
  if (password !== confirm) {
    return { error: "Les deux mots de passe ne correspondent pas." };
  }

  try {
    const userId = await consumePasswordReset(token, password);
    if (!userId) return { error: "Ce lien n’est plus valable." };
    await setSessionCookie(userId);
  } catch (error) {
    if (error instanceof Error && error.message.includes("AUTH_SECRET")) {
      return { error: "AUTH_SECRET est absent du fichier .env." };
    }
    return { error: "Le mot de passe n’a pas pu être changé." };
  }

  redirect("/compte");
}

export type AddressState = {
  error?: string;
} | null;

export async function saveAccountAddressAction(
  _prev: AddressState,
  formData: FormData,
): Promise<AddressState> {
  const user = await getCurrentUser();
  if (!user) redirect("/compte/connexion?next=/compte/adresses");

  const id = String(formData.get("id") ?? "").trim();

  try {
    const address = parseShippingAddress({
      name: formData.get("name"),
      line1: formData.get("line1"),
      line2: formData.get("line2"),
      postal: formData.get("postal"),
      city: formData.get("city"),
      phone: formData.get("phone"),
    });
    if (id) {
      const ok = await updateUserAddress(user.id, id, address);
      if (!ok) return { error: "Cette adresse n’existe plus." };
    } else {
      await createUserAddress(user.id, address);
    }
  } catch (error) {
    if (error instanceof AddressError) return { error: error.message };
    return { error: "L’adresse n’a pas pu être enregistrée." };
  }

  revalidatePath("/compte/adresses");
  revalidatePath("/commande");
  redirect("/compte/adresses");
}

export async function setDefaultAddressAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/compte/connexion?next=/compte/adresses");
  const id = String(formData.get("id") ?? "").trim();
  if (id) await setDefaultAddress(user.id, id);
  revalidatePath("/compte/adresses");
  revalidatePath("/commande");
}

export async function deleteAddressAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/compte/connexion?next=/compte/adresses");
  const id = String(formData.get("id") ?? "").trim();
  if (id) await deleteUserAddress(user.id, id);
  revalidatePath("/compte/adresses");
  revalidatePath("/commande");
}
