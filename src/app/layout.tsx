import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { AgeGate } from "@/components/age-gate";
import { CartProvider } from "@/components/cart-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-outfit",
  weight: ["400", "500", "600"],
});

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: {
    default: "Cave Solive",
    template: "%s · Cave Solive",
  },
  description:
    "Cave à vins française. Bordeaux, Bourgogne, Loire, Rhône, Alsace et Champagne, choisis bouteille par bouteille.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <html
      lang="fr"
      className={`${outfit.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <CartProvider>
          <SiteHeader
            email={user?.email ?? null}
            isAdmin={Boolean(user?.isAdmin)}
          />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <AgeGate />
        </CartProvider>
      </body>
    </html>
  );
}
