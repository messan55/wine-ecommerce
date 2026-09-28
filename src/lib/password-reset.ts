import { headers } from "next/headers";
import { mailConfigured, sendPasswordReset } from "@/lib/mail";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import {
  createResetToken,
  hashResetToken,
  isResetExpired,
  resetExpiresAt,
} from "@/lib/reset-token";

export async function requestPasswordReset(email: string) {
  if (!mailConfigured()) return { sent: false as const, configured: false };

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  });
  if (!user) return { sent: true as const, configured: true };

  const { token, tokenHash } = createResetToken();
  await prisma.$transaction([
    prisma.passwordReset.deleteMany({ where: { userId: user.id } }),
    prisma.passwordReset.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: resetExpiresAt(),
      },
    }),
  ]);

  const sent = await sendPasswordReset({
    email: user.email,
    url: `${await requestOrigin()}/compte/mot-de-passe-oublie/${token}`,
  });
  return { sent, configured: true };
}

export async function consumePasswordReset(token: string, password: string) {
  const tokenHash = hashResetToken(token);
  const reset = await prisma.passwordReset.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true, expiresAt: true },
  });
  if (!reset || isResetExpired(reset.expiresAt)) return null;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: reset.userId },
      data: { passwordHash: await hashPassword(password) },
    }),
    prisma.passwordReset.deleteMany({ where: { userId: reset.userId } }),
  ]);

  return reset.userId;
}

export async function resetTokenIsValid(token: string) {
  const reset = await prisma.passwordReset.findUnique({
    where: { tokenHash: hashResetToken(token) },
    select: { expiresAt: true },
  });
  return Boolean(reset && !isResetExpired(reset.expiresAt));
}

async function requestOrigin() {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  if (!host) return "http://localhost:3000";
  const proto = headerStore.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}
