import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
  description: "Recevoir un lien pour changer le mot de passe Cave Solive.",
};

export default async function ForgotPasswordPage() {
  const user = await getCurrentUser();
  if (user) redirect("/compte");

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
        Compte
      </p>
      <h1 className="mt-2 font-serif text-4xl sm:text-5xl">
        Mot de passe oublié
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Indiquez l’e-mail du compte. Un lien partira, valable une heure.
      </p>
      <ForgotPasswordForm />
    </div>
  );
}
