import type { Metadata } from "next";
import Link from "next/link";
import { LegalArticle, LegalSection } from "@/components/legal-article";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Données collectées par Cave Solive et vos droits.",
};

export default function PrivacyPage() {
  return (
    <LegalArticle title="Politique de confidentialité">
      <p>Mise à jour : septembre 2026.</p>
      <LegalSection title="Ce que nous gardons">
        <p>
          Pour un compte : l’e-mail et le mot de passe chiffré. Pour une
          commande : les bouteilles, le montant, l’adresse de livraison, le
          téléphone s’il est donné, et les références Stripe du paiement.
        </p>
        <p>
          Le panier et le contrôle de majorité restent dans votre navigateur
          (localStorage). Ils ne sont pas envoyés à la cave tant que vous ne
          commandez pas.
        </p>
      </LegalSection>
      <LegalSection title="À quoi ça sert">
        <p>
          Servir la commande, retirer le stock, envoyer l’e-mail de
          confirmation, et, si vous écrivez via{" "}
          <Link href="/contact" className="underline underline-offset-4">
            Contact
          </Link>
          , vous répondre.
        </p>
      </LegalSection>
      <LegalSection title="Prestataires">
        <p>
          Le paiement passe par Stripe. Le courrier part par le serveur SMTP
          configuré (en local, Mailpit). Ils ne voient que ce qui leur est
          nécessaire.
        </p>
      </LegalSection>
      <LegalSection title="Durée et droits">
        <p>
          Les commandes sont conservées pour la comptabilité et le suivi. Vous
          pouvez demander l’accès, la correction ou l’effacement de votre
          compte, dans la limite des pièces que la loi nous demande de garder.
        </p>
        <p>
          Écrivez-nous depuis la page Contact. Vous pouvez aussi saisir la
          CNIL.
        </p>
      </LegalSection>
    </LegalArticle>
  );
}
