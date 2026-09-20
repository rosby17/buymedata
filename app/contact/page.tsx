import PublicInfo from "@/components/PublicInfo";
export const metadata = { title: "Contact · Buy Me Data" };
export default function ContactPage() {
  return <PublicInfo title="Parlons de votre question."><p>Un problème avec votre compte, une contribution ou votre page de soutien ? Écrivez à Buy Me Data.</p><h2>Notre adresse de contact</h2><p><a href="mailto:bymedata@gmail.com">bymedata@gmail.com</a></p><p><a href="mailto:bymedata@gmail.com?subject=Contact%20Buy%20Me%20Data">Rédiger un e-mail ↗</a></p><p>Ce bouton ouvre votre application de messagerie. Indiquez le lien de votre page et, pour un paiement, la référence de la transaction. Ne transmettez jamais votre mot de passe, votre code de vérification ou vos coordonnées bancaires complètes.</p></PublicInfo>;
}
