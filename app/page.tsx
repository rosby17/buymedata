import Link from "next/link";
import Footer from "@/components/Footer";
import Image from "next/image";
import LandingExperience from "@/components/LandingExperience";
import styles from "./landing.module.css";

export default function HomePage() {
  return <div className={styles.landing}>
    <header className={styles.nav}>
      <Link href="/" className={styles.brand}><Image src="/buy-me-data-mascot.png" alt="" width={36} height={36}/>Buy Me Data</Link>
      <nav aria-label="Navigation principale"><a href="#demo">Comment ça marche</a><a href="#tarifs">Tarifs</a><Link href="/login">Se connecter <span aria-hidden="true">↗</span></Link></nav>
    </header>
    <main>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>LA DATA FAIT VIVRE VOS CRÉATIONS</p>
        <h1>Vous avez le talent.<br/>Ils vous offrent <em>la data.</em></h1>
        <p className={styles.intro}>Publier une vidéo, partager un tuto, lancer un live : tout commence par une connexion internet. Avec Buy Me Data, votre communauté vous aide à la financer, même si votre contenu n’est pas encore monétisé.</p>
        <Link href="/signup" className={styles.cta}>Créer ma page <span aria-hidden="true">↗</span></Link>
        <p className={styles.note}>Créez votre page. Partagez votre lien. Recevez du soutien pour votre connexion.</p>
      </section>
      <LandingExperience />
      <section className={styles.campaign}>
        <p className={styles.eyebrow}>LES CAGNOTTES</p>
        <h2>Votre prochain mois de création<br/>commence par <em>une connexion.</em></h2>
        <p className={styles.intro}>Préparez une série de vidéos ou vos prochains lives avec une cagnotte dédiée à votre budget internet. Votre communauté voit l’objectif et participe à sa réalisation.</p>
        <article className={styles.project}>
          <div className={styles.projectArt} aria-hidden="true"><span>CONNEXION · PUBLICATION · PARTAGE</span><Image src="/buy-me-data-mascot.png" alt="" width={100} height={100}/><strong>DE LA DATA.<br/>DU CONTENU.<br/>DU LIEN.</strong></div>
          <div><p className={styles.eyebrow}>EXEMPLE DE CAGNOTTE</p><h3>Un mois de connexion pour mes tutos</h3><p>Mon objectif : financer ma connexion pour mettre en ligne mes prochaines vidéos et répondre à vos questions.</p><div className={styles.progress}><span/></div><p>12 000 / 20 000 FCFA · illustration</p><Link href="/signup" className={styles.textLink}>Créer ma cagnotte ↗</Link></div>
        </article>
      </section>
      <section className={styles.pricing} id="tarifs">
        <p className={styles.eyebrow}>DES TARIFS SIMPLES</p>
        <h2>Votre soutien revient<br/><em>aux créateurs.</em></h2>
        <p className={styles.intro}>Jusqu’à 90 % des revenus sont reversés directement aux créateurs. Les 10 % restants servent uniquement à faire fonctionner le service et à assurer les retraits.</p>
        <div className={styles.pricingCard}>
          <div><strong>90 %</strong><span>reversés au créateur</span></div>
          <div><strong>10 %</strong><span>service et retraits sécurisés</span></div>
        </div>
      </section>
      <section className={styles.closing}><p className={styles.eyebrow}>BUY ME DATA, TOUT SIMPLEMENT</p><h2>« Offre-moi de la data.<br/>Je m’occupe de <em>créer.</em> »</h2><p className={styles.intro}>Vos abonnés aiment votre contenu. Donnez-leur un moyen de vous aider à continuer à le partager.</p><Link href="/signup" className={styles.cta}>Créer ma page ↗</Link></section>
    </main>
    <Footer />
  </div>;
}
