import type { Metadata } from "next";
import { AdminNav } from "@/components/admin-nav";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administration",
  description: "Gérer le catalogue et les commandes de la cave.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return (
    <>
      <AdminNav />
      {children}
    </>
  );
}
