"use client";
import {useState} from "react";
import Link from "next/link";
import styles from "@/components/AuthForm.module.css";
export default function VerifyEmail(){
 const [message,setMessage]=useState(""),[busy,setBusy]=useState(false),[done,setDone]=useState(false);
 async function verify(){const token=new URLSearchParams(location.hash.slice(1)).get("token")||"";setBusy(true);try{const r=await fetch("/api/auth/verify",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({token})});const d=await r.json();if(!r.ok)throw new Error(d.error);setDone(true);history.replaceState(null,"",location.pathname);setMessage("Votre adresse est confirmée. Vous pouvez vous connecter.");}catch(e){setMessage(e instanceof Error?e.message:"Veuillez réessayer.");}finally{setBusy(false);}}
 return <main className={styles.page}><section className={styles.card}><Link href="/" className={styles.brand}>Buy Me Data</Link><h1>Confirmez votre adresse</h1><p>Validez votre e-mail pour accéder à votre espace créateur.</p>{message&&<p role="status">{message}</p>}{!done&&<button className={styles.primary} disabled={busy} onClick={verify}>{busy?"Vérification…":"Confirmer mon adresse"}</button>}<p><Link href="/login">Se connecter</Link> · <Link href="/signup">Créer ma page</Link></p></section></main>;
}
