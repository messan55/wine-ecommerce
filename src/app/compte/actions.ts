"use server";

import { redirect } from "next/navigation";
import { attachOrdersToUser, promoteConfiguredAdmin } from "@/lib/auth";
import { hashPassword, isValidEmail, normalizeEmail, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { clearSessionCookie, setSessionCookie } from "@/lib/session";

export type AuthState = {
  error: string;
} | null;

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
