import Link from "next/link";
import Image from "next/image";
import Footer from "./Footer";
import styles from "./PublicInfo.module.css";

export default function PublicInfo({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.page}><header><Link href="/"><Image src="/buy-me-data-mascot.png" alt="" width={36} height={36}/>Buy Me Data</Link><Link href="/signup">Créer ma page ↗</Link></header><main><h1>{title}</h1>{children}</main><Footer/></div>;
}
