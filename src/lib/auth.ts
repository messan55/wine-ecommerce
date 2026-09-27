import { isConfiguredAdmin } from "@/lib/admin-email";
import { prisma } from "@/lib/prisma";
import { readSessionToken, readSessionUserId } from "@/lib/session";

export async function getCurrentUser() {
  try {
    const userId = readSessionUserId(await readSessionToken());
    if (!userId) return null;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, isAdmin: true },
    });
    if (!user) return null;
    return {
      ...user,
      isAdmin: user.isAdmin || isConfiguredAdmin(user.email),
    };
  } catch {
    return null;
  }
}

export async function promoteConfiguredAdmin(userId: string, email: string) {
  if (!isConfiguredAdmin(email)) return;
  await prisma.user.update({
    where: { id: userId },
    data: { isAdmin: true },
  });
}

export async function attachOrdersToUser(userId: string, email: string) {
  await prisma.order.updateMany({
    where: { email, userId: null },
    data: { userId },
  });
}
