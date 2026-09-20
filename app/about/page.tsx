import PublicInfo from "@/components/PublicInfo";
import Link from "next/link";
export const metadata = { title: "À propos · Buy Me Data" };
export default function AboutPage() {
  return <PublicInfo title="La connexion ne devrait pas arrêter la création.">
    <p>Buy Me Data est une plateforme de soutien aux créateurs de contenu. Notre point de départ est simple : pour publier une vidéo, partager un tutoriel ou lancer un live, il faut une connexion internet. Et cette connexion a un coût, même quand le contenu ne rapporte encore rien.</p>
    <h2>Pourquoi « Buy Me Data » ?</h2>
    <p>« Achète-moi de la data » : une façon concrète de dire à sa communauté ce qui permet de continuer à créer. Les personnes qui apprécient un contenu peuvent contribuer au budget de données mobiles de son auteur, sans attendre qu’une plateforme le monétise.</p>
    <h2>Un lien entre le créateur et sa communauté</h2>
    <p>Le créateur personnalise sa page et partage son lien. Ses abonnés peuvent envoyer un Buy Me Data, choisir un montant et laisser un message. Pour un objectif précis, une cagnotte permet d’expliquer le projet et d’en suivre la progression.</p>
    <h2>Ce que votre soutien finance</h2>
    <p>Les contributions sont des paiements au bénéfice du créateur. Buy Me Data ne livre pas automatiquement un forfait mobile et ne garantit pas un nombre de gigaoctets : le créateur utilise son soutien pour financer sa connexion ou le projet présenté.</p>
    <h2>Accessible sans monétisation</h2>
    <p>Notre ambition est de donner aux créateurs un moyen de recevoir le soutien de leur audience, y compris lorsqu’ils ne remplissent pas les conditions de monétisation des réseaux sociaux. Un soutien n’achète pas une audience : il aide un créateur à poursuivre son travail.</p>
    <p><Link href="/signup">Créer ma page</Link> · <Link href="/contact">Nous contacter</Link></p>
  </PublicInfo>;
}
