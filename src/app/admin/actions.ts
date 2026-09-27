"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  parseWineForm,
  requireAdmin,
  saveUploadedBottleImage,
  WineFormError,
} from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export type WineActionState = {
  error: string;
} | null;

async function assertUniqueSlug(slug: string, exceptId?: string) {
  const existing = await prisma.wine.findUnique({ where: { slug } });
  if (existing && existing.id !== exceptId) {
    throw new WineFormError("Ce slug est déjà pris.");
  }
}

export async function createWineAction(
  _prev: WineActionState,
  formData: FormData,
): Promise<WineActionState> {
  await requireAdmin();
  try {
    const data = parseWineForm(formData);
    await assertUniqueSlug(data.slug);
    const uploaded = await saveUploadedBottleImage(
      data.slug,
      fileFromForm(formData, "image"),
    );
    await prisma.wine.create({
      data: uploaded ? { ...data, imageSrc: uploaded } : data,
    });
    revalidatePath("/");
    revalidatePath(`/vin/${data.slug}`);
  } catch (error) {
    if (error instanceof WineFormError) return { error: error.message };
    return { error: "La cuvée n’a pas pu être créée." };
  }
  redirect("/admin");
}

export async function updateWineAction(
  _prev: WineActionState,
  formData: FormData,
): Promise<WineActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Cuvée introuvable." };
  try {
    const data = parseWineForm(formData);
    await assertUniqueSlug(data.slug, id);
    const uploaded = await saveUploadedBottleImage(
      data.slug,
      fileFromForm(formData, "image"),
    );
    await prisma.wine.update({
      where: { id },
      data: uploaded ? { ...data, imageSrc: uploaded } : data,
    });
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath(`/vin/${data.slug}`);
  } catch (error) {
    if (error instanceof WineFormError) return { error: error.message };
    return { error: "La cuvée n’a pas pu être enregistrée." };
  }
  redirect("/admin");
}

export async function deleteWineAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin");

  const used = await prisma.orderLine.count({ where: { wineId: id } });
  if (used > 0) {
    redirect("/admin?erreur=commandee");
  }

  try {
    await prisma.wine.delete({ where: { id } });
  } catch {
    redirect("/admin?erreur=retrait");
  }
  revalidatePath("/");
  redirect("/admin");
}

function fileFromForm(formData: FormData, name: string) {
  const value = formData.get(name);
  return value instanceof File ? value : null;
}
