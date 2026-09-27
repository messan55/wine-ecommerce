import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { loginAction } from "@/app/compte/actions";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Accéder à votre compte Cave Solive.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();
  const next = first((await searchParams).next) ?? "/compte";
  if (user) redirect(safeNext(next));

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
        Compte
      </p>
      <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Connexion</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Retrouvez vos commandes payées sur cet e-mail.
      </p>
      <AuthForm
        action={loginAction}
        submitLabel="Se connecter"
        pendingLabel="Connexion…"
        next={safeNext(next)}
        switchHref={`/compte/inscription?next=${encodeURIComponent(safeNext(next))}`}
        switchLabel="Pas encore de compte ? S’inscrire"
      />
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
