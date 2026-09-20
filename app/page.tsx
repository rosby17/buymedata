import Link from "next/link";
import LandingExperience from "@/components/LandingExperience";
import styles from "./landing.module.css";

export default function HomePage() {
  return <div className={styles.landing}>
    <header className={styles.nav}>
      <Link href="/" className={styles.brand}>Buy Me Data<span aria-hidden="true">✳</span></Link>
      <nav aria-label="Navigation principale"><a href="#demo">Comment ça marche</a><Link href="/login">Se connecter <span aria-hidden="true">↗</span></Link></nav>
    </header>
    <main>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>POUR CEUX QUI ONT QUELQUE CHOSE À PARTAGER</p>
        <h1>Vos idées méritent<br/>de rester <em>en ligne.</em></h1>
        <p className={styles.intro}>Une communauté. Un lien. Un coup de pouce.<br/>Recevez des Buy Me Data et donnez vie à vos prochains projets.</p>
        <Link href="/signup" className={styles.cta}>Créer ma page <span aria-hidden="true">↗</span></Link>
        <p className={styles.note}>Votre page, votre univers, votre communauté.</p>
      </section>
      <LandingExperience />
      <section className={styles.campaign}>
        <p className={styles.eyebrow}>LES CAGNOTTES</p>
        <h2>Un prochain projet ?<br/>Faites-en une aventure <em>collective.</em></h2>
        <p className={styles.intro}>Une connexion, du matériel, une nouvelle série.<br/>Donnez un objectif concret à votre communauté.</p>
        <article className={styles.project}>
          <div className={styles.projectArt} aria-hidden="true"><span>REC ●</span><strong>LA SUITE<br/>S’ÉCRIT<br/>ENSEMBLE.</strong><span>IMAGE · SON · CRÉATION</span></div>
          <div><p className={styles.eyebrow}>EXEMPLE DE CAGNOTTE</p><h3>Mon prochain court-métrage</h3><p>Du premier scénario à la dernière prise, embarquez votre communauté dans les coulisses.</p><div className={styles.progress}><span/></div><p>60 000 / 100 000 FCFA · exemple</p><Link href="/signup" className={styles.textLink}>Créer mon projet ↗</Link></div>
        </article>
      </section>
      <section className={styles.closing}><p className={styles.eyebrow}>À VOUS DE JOUER</p><h2>Vous créez.<br/>Ils vous <em>soutiennent.</em></h2><Link href="/signup" className={styles.cta}>Créer ma page ↗</Link></section>
    </main>
    <footer className={styles.footer}><div><Link href="/" className={styles.brand}>Buy Me Data ✳</Link><p>Un peu de data. Beaucoup de possibles.</p></div><nav aria-label="Pied de page"><a href="#demo">Découvrir le fonctionnement</a><Link href="/signup">Créer ma page</Link><Link href="/login">Mon compte</Link></nav><small>© {new Date().getFullYear()} Buy Me Data</small></footer>
  </div>;
}
