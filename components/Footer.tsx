import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.row}>
        <Link href="/" className={styles.brand}>© Buy Me Data</Link>
        <nav className={styles.links} aria-label="Pied de page">
          <details className={styles.menu}>
            <summary>À propos <span aria-hidden="true">⌃</span></summary>
            <div className={styles.panel}>
              <p>Buy Me Data permet aux créateurs de partager une page de soutien et de créer des cagnottes pour leurs projets.</p>
              <Link href="/signup">Créer ma page ↗</Link>
            </div>
          </details>
          <details className={styles.menu}>
            <summary>Légal <span aria-hidden="true">⌃</span></summary>
            <div className={styles.panel}>
              <p>Pour une question juridique ou relative à vos données personnelles :</p>
              <a href="mailto:bymedata@gmail.com">bymedata@gmail.com</a>
            </div>
          </details>
        </nav>
        <a className={styles.contact} href="mailto:bymedata@gmail.com">Contact <span aria-hidden="true">↗</span></a>
      </div>
    </footer>
  );
}
