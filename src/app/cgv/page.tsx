import type { Metadata } from "next";
import Link from "next/link";
import { LegalArticle, LegalSection } from "@/components/legal-article";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description: "Commande, livraison, paiement et rétractation chez Cave Solive.",
};

export default function CgvPage() {
  return (
    <LegalArticle title="Conditions générales de vente">
      <p>Mise à jour : septembre 2026. Vente réservée aux majeurs.</p>
      <LegalSection title="Objet">
        <p>
          Ces conditions régissent les ventes de vins conclues sur le site Cave
          Solive, 14 rue des Archives, 75004 Paris. Commander suppose de les
          avoir lues.
        </p>
      </LegalSection>
      <LegalSection title="Compte et commande">
        <p>
          Un compte est nécessaire pour passer commande. Les bouteilles du
          panier restent sur l’appareil jusqu’à la confirmation. À la
          confirmation, la commande est écrite, le stock est retiré, un e-mail
          part à l’adresse du compte.
        </p>
        <p>
          Les prix sont indiqués TTC, en euros. Les frais de livraison France
          métropolitaine sont de 8 € jusqu’à 5 bouteilles, 12 € à partir de 6,
          offerts dès 80 € de vin. Un magnum compte pour deux.
        </p>
      </LegalSection>
      <LegalSection title="Paiement">
        <p>
          Le règlement se fait par carte, via Stripe. Tant que le paiement n’est
          pas confirmé, la commande reste enregistrée et le stock retenu.
        </p>
      </LegalSection>
      <LegalSection title="Livraison">
        <p>
          Livraison en France métropolitaine uniquement, à l’adresse indiquée
          lors de la commande. Les délais dépendent du transporteur ; la cave
          prévient si une bouteille manque.
        </p>
      </LegalSection>
      <LegalSection title="Rétractation">
        <p>
          Vous disposez de 14 jours après réception pour vous rétracter, si les
          bouteilles n’ont pas été ouvertes et que les étiquettes sont intactes.
          Les frais de retour sont à votre charge. Écrivez via la page{" "}
          <Link href="/contact" className="underline underline-offset-4">
            Contact
          </Link>
          .
        </p>
      </LegalSection>
      <LegalSection title="Litiges">
        <p>
          Le droit français s’applique. En cas de litige, vous pouvez saisir un
          médiateur de la consommation ; les coordonnées sont communiquées sur
          demande.
        </p>
      </LegalSection>
    </LegalArticle>
  );
}
