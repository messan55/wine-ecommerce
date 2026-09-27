import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { redirect } from "next/navigation";
import { isConfiguredAdmin } from "@/lib/admin-email";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WineFormError } from "@/lib/wine-form";

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/compte/connexion?next=/admin");
  }
  if (user.isAdmin || isConfiguredAdmin(user.email)) {
    if (!user.isAdmin) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isAdmin: true },
      });
    }
    return { ...user, isAdmin: true as const };
  }
  redirect("/");
}

export {
  COLORS,
  REGIONS,
  WineFormError,
  parseWineForm,
  slugify,
  type WineFormInput,
} from "@/lib/wine-form";

const IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export async function saveUploadedBottleImage(slug: string, file: File | null) {
  if (!file || file.size === 0) return null;
  const ext = IMAGE_TYPES.get(file.type);
  if (!ext) {
    throw new WineFormError("L’image doit être un JPEG, un PNG ou un WebP.");
  }
  if (file.size > 2_000_000) {
    throw new WineFormError("L’image dépasse 2 Mo.");
  }

  const dir = path.join(process.cwd(), "public", "bottles");
  await mkdir(dir, { recursive: true });
  const filename = `${slug}.${ext}`;
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return `/bottles/${filename}`;
}
