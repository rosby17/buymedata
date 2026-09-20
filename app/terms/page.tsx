import PublicInfo from "@/components/PublicInfo";
import Link from "next/link";
export const metadata = { title: "Conditions d’utilisation · Buy Me Data" };
export default function TermsPage() {
  return <PublicInfo title="Conditions d’utilisation">
    <h2>Le service</h2><p>Buy Me Data permet aux créateurs de publier une page de soutien et des cagnottes. Les contributions financent le créateur ou le projet présenté ; elles ne constituent pas l’achat automatique d’un forfait internet, d’un volume de data ou d’un rendement financier.</p>
    <h2>Votre compte</h2><p>Le parcours d’inscription est destiné aux créateurs. Vous devez fournir des informations exactes, confirmer votre adresse lorsque cela est demandé et protéger vos identifiants. Il n’est pas nécessaire de créer un compte pour effectuer une contribution.</p>
    <h2>Pages et contenus</h2><p>Vous êtes responsable des textes, images et objectifs que vous publiez et des droits nécessaires pour les utiliser. L’usurpation d’identité, la fraude, les contenus illicites et les présentations trompeuses sont interdits. Les abus peuvent être signalés via la <Link href="/contact">page Contact</Link>.</p>
    <h2>Paiements et retraits</h2><p>Les paiements sont traités par des prestataires externes. Une tentative en attente ou échouée n’est pas un revenu reçu. Les frais et le montant net applicables aux retraits sont présentés dans votre espace avant la demande. Une confirmation de paiement n’implique pas qu’un retrait ait déjà été versé sur votre compte.</p>
    <h2>Questions et contestations</h2><p>En cas d’erreur ou de contestation, contactez-nous avec la référence du paiement. Toute demande est examinée selon son statut, les règles du prestataire et le droit applicable. Ces conditions ne suppriment aucun droit impératif dont vous bénéficiez.</p>
    <h2>Données personnelles</h2><p>Consultez notre <Link href="/privacy">politique de confidentialité</Link> pour comprendre les informations utilisées et les moyens d’exercer vos droits.</p>
  </PublicInfo>;
}
