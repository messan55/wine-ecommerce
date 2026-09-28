import { redirect } from "next/navigation";
import { AccountSectionNav } from "@/components/account-section-nav";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AccountSpaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/compte/connexion?next=/compte");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-serif text-4xl sm:text-5xl">Compte</h1>
      <p className="mt-3 text-sm text-muted-foreground">{user.email}</p>
      <AccountSectionNav />
      <div className="mt-8">{children}</div>
    </div>
  );
}
