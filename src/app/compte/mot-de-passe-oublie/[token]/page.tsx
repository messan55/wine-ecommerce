import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { resetTokenIsValid } from "@/lib/password-reset";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nouveau mot de passe",
  description: "Choisir un nouveau mot de passe Cave Solive.",
};

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/compte");

  const { token } = await params;
  const valid = token ? await resetTokenIsValid(token) : false;

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
        Compte
      </p>
      <h1 className="mt-2 font-serif text-4xl sm:text-5xl">
        Nouveau mot de passe
      </h1>
      {valid ? (
        <>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Au moins huit caractères. Vous serez connecté ensuite.
          </p>
          <ResetPasswordForm token={token} />
        </>
      ) : (
        <>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Ce lien n’est plus valable. Demandez-en un autre.
          </p>
          <Button asChild className="mt-8 h-10" variant="outline">
            <Link href="/compte/mot-de-passe-oublie">Renvoyer un lien</Link>
          </Button>
        </>
      )}
    </div>
  );
}
