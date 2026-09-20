"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./Footer.module.css";

export default function Footer() {
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const outside = (event: PointerEvent) => { if (!menu.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  return <footer className={styles.footer}><div className={styles.row}>
    <Link href="/" className={styles.brand}><Image src="/buy-me-data-mascot.png" alt="" width={30} height={30}/>© Buy Me Data</Link>
    <nav className={styles.links} aria-label="Pied de page">
      <Link href="/about">À propos</Link>
      <div ref={menu} className={styles.menu} onMouseLeave={() => setOpen(false)}
        onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
        onKeyDown={event => { if (event.key === "Escape") { setOpen(false); menu.current?.querySelector("button")?.focus(); } }}>
        <button className={styles.toggle} aria-expanded={open} aria-controls="footer-legal" onClick={() => setOpen(!open)}>Légal <span aria-hidden="true">⌃</span></button>
        {open && <div id="footer-legal" className={styles.panel}><Link href="/privacy" onClick={() => setOpen(false)}>Politique de confidentialité</Link><Link href="/terms" onClick={() => setOpen(false)}>Conditions d’utilisation</Link></div>}
      </div>
    </nav>
    <Link className={styles.contact} href="/contact">Contact <span aria-hidden="true">↗</span></Link>
  </div></footer>;
}
