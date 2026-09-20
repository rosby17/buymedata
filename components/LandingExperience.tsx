"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "@/app/landing.module.css";

const examples = [
  { name: "Le prochain épisode", type: "PODCAST", quote: "Une voix, des histoires, et vous au rendez-vous.", symbol: "◉", color: "#e5e0f3" },
  { name: "Créer sans pause", type: "ILLUSTRATION", quote: "Des idées plein le carnet. Une communauté pour la suite.", symbol: "✳", color: "#f4d9ce" },
  { name: "Partager le savoir", type: "TUTORIELS", quote: "Le prochain déclic commence par une nouvelle vidéo.", symbol: "↗", color: "#dfe7ce" },
  { name: "Faire vibrer", type: "MUSIQUE", quote: "Du premier accord à la prochaine sortie.", symbol: "♫", color: "#f4e5a8" },
];

export default function LandingExperience() {
  const [paused, setPaused] = useState(false);
  const [amount, setAmount] = useState(1000);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  return <>
    <section className={styles.gallery} aria-label="Exemples d’univers créateurs">
      <div className={styles.galleryHeading}><p>À chaque univers, sa communauté. <span>Exemples illustratifs</span></p><button onClick={() => setPaused(!paused)} aria-pressed={paused}>{paused ? "Reprendre le défilement" : "Mettre en pause"} <span aria-hidden="true">{paused ? "▶" : "Ⅱ"}</span></button></div>
      <div className={styles.railViewport}><div className={styles.rail} style={{ animationPlayState: paused ? "paused" : "running" }}>
        {[0, 1].map(copy => <div className={styles.railGroup} key={copy} aria-hidden={copy === 1 ? true : undefined}>{examples.map(item => <article className={styles.creator} key={item.type} style={{ background: item.color }}><div className={styles.creatorTop}><span>{item.type}</span><span aria-hidden="true">{item.symbol}</span></div><h3>{item.name}</h3><p>{item.quote}</p><span className={styles.creatorFoot}>Votre communauté, à vos côtés ↗</span></article>)}</div>)}
      </div></div>
      <a className={styles.scrollCue} href="#demo">Découvrez votre future page <span aria-hidden="true">↓</span></a>
    </section>
    <section className={styles.demoSection} id="demo">
      <p className={styles.eyebrow}>LE SOUTIEN, TOUT SIMPLEMENT</p>
      <h2>Un petit geste.<br/>Une grande raison de <em>continuer.</em></h2>
      <p className={styles.intro}>Une page à votre image, un montant au choix et un mot qui compte.<br/>Essayez ci-dessous : c’est une démonstration.</p>
      <div className={styles.demoStage}>
        <div className={styles.demoBrowser}><div className={styles.browserBar}><span aria-hidden="true">● ● ●</span><span>buymedata.tools-cl.com/votre-page</span><span>DÉMO</span></div>
          <div className={styles.cover}><span>LA CRÉATIVITÉ<br/>NOUS CONNECTE.</span><span aria-hidden="true">✳</span></div>
          <div className={styles.demoColumns}><div className={styles.about}><div className={styles.avatar} aria-hidden="true">✳</div><p className={styles.eyebrow}>VOTRE UNIVERS</p><h3>Créer. Partager.<br/>Recommencer.</h3><p>Bienvenue dans les coulisses de mes créations. Chaque Buy Me Data m’aide à préparer la suite.</p><div className={styles.message}><span aria-hidden="true">♡</span><p>{sent && message.trim() ? message : "Un petit mot peut donner beaucoup d’élan."}</p><small>{sent ? "Votre message de démonstration" : "Ici, les encouragements prennent leur place."}</small></div></div>
          <form className={styles.supportForm} onSubmit={event => { event.preventDefault(); setSent(true); }}>
            <h3>Un Buy Me Data ?</h3><p>Choisissez votre coup de pouce.</p>
            <div className={styles.amounts}>{[1000, 2500, 5000].map(value => <button type="button" key={value} aria-pressed={amount === value} onClick={() => { setAmount(value); setSent(false); }}>{value.toLocaleString("fr-FR")}<small>FCFA</small></button>)}</div>
            <label htmlFor="demo-message">Un mot d’encouragement <span>(facultatif)</span></label>
            <textarea id="demo-message" maxLength={240} value={message} onChange={event => { setMessage(event.target.value); setSent(false); }} placeholder="Hâte de découvrir la suite !" rows={3}/>
            <button className={styles.cta} type="submit">Faire un Buy Me Data · {amount.toLocaleString("fr-FR")} F</button>
            <p className={styles.demoNotice} role="status">{sent ? "Merci ! Démonstration réussie, aucun paiement effectué." : "Démo interactive · Aucun paiement réel"}</p>
          </form></div>
        </div>
      </div>
      <Link href="/signup" className={styles.textLink}>À mon tour de créer ma page ↗</Link>
    </section>
  </>;
}
