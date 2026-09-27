import type { Metadata } from "next";
import Link from "next/link";
import { LegalArticle, LegalSection } from "@/components/legal-article";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Éditeur, hébergement et contact de Cave Solive.",
};

export default function MentionsPage() {
  return (
    <LegalArticle title="Mentions légales">
      <p>Mise à jour : septembre 2026.</p>
      <LegalSection title="Éditeur">
        <p>
          Cave Solive, boutique de vente de vins en ligne, 14 rue des Archives,
          75004 Paris. Directeur de la publication : la cave.
        </p>
        <p>
          Contact :{" "}
          <Link href="/contact" className="underline underline-offset-4">
            le formulaire
          </Link>
          , ou par courrier à l’adresse ci-dessus.
        </p>
      </LegalSection>
      <LegalSection title="Hébergement">
        <p>
          Le site est servi depuis la machine qui fait tourner l’application
          Next.js. En local, c’est votre ordinateur.
        </p>
      </LegalSection>
      <LegalSection title="Vente d’alcool">
        <p>
          La vente d’alcool est interdite aux mineurs. Un contrôle de majorité
          précède l’accès à la cave. L’abus d’alcool est dangereux pour la
          santé, à consommer avec modération.
        </p>
      </LegalSection>
      <LegalSection title="Propriété">
        <p>
          Les textes, la sélection et les photos de bouteilles sont ceux de Cave
          Solive. Les noms de domaines viticoles cités dans le catalogue sont
          des cuvées de la boutique.
        </p>
      </LegalSection>
    </LegalArticle>
  );
}
