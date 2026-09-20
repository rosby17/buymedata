import Image from "next/image";
import Link from "next/link";
import styles from "@/app/landing.module.css";

export default function LandingExperience() {
  return <section className={styles.demoSection} id="demo">
    <p className={styles.eyebrow}>ACHÈTE-MOI DE LA DATA POUR QUE JE CONTINUE À CRÉER</p>
    <h2>Votre communauté peut financer<br/>ce qui vous <em>connecte.</em></h2>
    <p className={styles.intro}>Le coût d’internet peut freiner un créateur bien avant ses premiers revenus. Un Buy Me Data, c’est une contribution pour acheter des données mobiles et continuer à publier.</p>
    <div className={styles.supportPreview}>
      <p className={styles.note}>Aperçu d’une page de soutien · exemple</p>
      <article className={styles.realSupportCard}>
        <div className={styles.supportCover}/>
        <div className={styles.supportContent}>
          <Image src="/buy-me-data-mascot.png" alt="Mascotte Buy Me Data" width={100} height={100} className={styles.supportAvatar}/>
          <h3>Soutenir votre création</h3>
          <p>Vos Buy Me Data m’aident à financer ma connexion pour publier mes vidéos, partager mes idées et rester en contact avec vous.</p>
          <Link href="/signup" className={styles.cta}>Faire un Buy Me Data</Link>
          <p className={styles.note}>Créez votre page pour recevoir vos premiers soutiens.</p>
        </div>
      </article>
    </div>
    <p className={styles.intro}>Personnalisez votre photo et votre présentation, puis partagez votre lien. Vos abonnés choisissent leur contribution depuis votre page de soutien.</p>
    <Link href="/signup" className={styles.textLink}>Créer ma page de soutien ↗</Link>
  </section>;
}
