import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OpenAuthOnMount } from "@/components/open-auth";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Inscription",
  description: "Créer un compte pour retrouver vos commandes.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();
  const raw = await searchParams;
  const next = first(raw.next) ?? "/compte";
  if (user) redirect(safeNext(next));

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
        Compte
      </p>
      <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Inscription</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Indiquez votre e-mail dans le panneau. S’il est déjà connu, on ouvre le
        compte ; sinon on en crée un.
      </p>
      <OpenAuthOnMount next={safeNext(next)} email={first(raw.email)} />
    </div>
  );
}

function first(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function safeNext(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) return "/compte";
  return value;
}
