import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Écrire à Cave Solive, 14 rue des Archives, Paris 4e.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
        La cave
      </p>
      <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Contact</h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
        14 rue des Archives, 75004 Paris. Du mardi au samedi, 11 h – 19 h.
        Pour une commande déjà passée, indiquez la référence.
      </p>
      <ContactForm />
    </div>
  );
}
