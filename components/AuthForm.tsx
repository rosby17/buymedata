"use client";
import { useState } from "react";
import Link from "next/link";
import { TopUpLogo } from "./Navbar";
import styles from "./AuthForm.module.css";
export default function AuthForm({register=false,initialError=""}:{register?:boolean;initialError?:string}) {
 const [step,setStep]=useState(register?1:2),[username,setUsername]=useState(""),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[confirmation,setConfirmation]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState(initialError),[message,setMessage]=useState("");
 async function submit(e:React.FormEvent){e.preventDefault();setError("");setMessage("");setBusy(true);
 try {
 if(step===1){const response=await fetch("/api/usernames?username="+encodeURIComponent(username));const data=await response.json();if(!response.ok||!data.available)throw new Error(data.error||"Ce username est indisponible.");setStep(2);return;}
 if(register&&password!==confirmation)throw new Error("Les mots de passe ne correspondent pas.");
 const response=await fetch("/api/auth/session",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email,password,username,register})});const data=await response.json();
 if(!response.ok)throw new Error(data.error||"Veuillez réessayer.");
 if(data.verification_required){setMessage(data.message||"Consultez votre e-mail pour confirmer votre adresse.");return;}
 location.assign("/app");
 }catch(err){setError(err instanceof Error?err.message:"Service indisponible.");}finally{setBusy(false);}}
 return <main className={styles.page}><section className={styles.card}><Link href="/" className={styles.brand}><TopUpLogo/>Buy Me Data</Link><h1>{register?"Créez votre page":"Bon retour"}</h1><p>{register?"De la data pour continuer à créer.":"Connectez-vous à votre espace créateur."}</p>
 {error&&<div role="alert" className={styles.notice}>{error}</div>}{message&&<div role="status" className={styles.notice}>{message}</div>}
 <form onSubmit={submit}>
 {step===1?<><label htmlFor="username">Choisissez votre username</label><input id="username" required minLength={3} maxLength={30} pattern="[a-z0-9_-]+" autoComplete="username" value={username} onChange={e=>setUsername(e.target.value.toLowerCase())} placeholder="votre-nom"/><small>Votre lien : buymedata.tools-cl.com/{username||"votre-nom"}</small></>:<>
 {register&&<div className={styles.chosen}>Votre page : /{username}<button type="button" onClick={()=>setStep(1)}>Modifier</button></div>}
 <label htmlFor="email">Adresse e-mail</label><input id="email" type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/>
 <label htmlFor="password">Mot de passe</label><input id="password" type="password" required minLength={8} maxLength={256} autoComplete={register?"new-password":"current-password"} value={password} onChange={e=>setPassword(e.target.value)}/>
 {register&&<><label htmlFor="confirmation">Confirmer le mot de passe</label><input id="confirmation" type="password" required minLength={8} maxLength={256} autoComplete="new-password" value={confirmation} onChange={e=>setConfirmation(e.target.value)}/></>}
 </>}
 <button className={styles.primary} disabled={busy}>{busy?"Veuillez patienter…":step===1?"Continuer":register?"Créer mon compte":"Se connecter"}</button>
 </form>
 {step===2&&<><div className={styles.or}>ou</div><a className={styles.google} href={"/api/auth/google?intent="+(register?"signup&username="+encodeURIComponent(username):"login")}>Continuer avec Google</a></>}
 {register&&<small className={styles.legal}>En créant votre page, vous acceptez nos <Link href="/terms">conditions</Link>. Consultez notre <Link href="/privacy">politique de confidentialité</Link>.</small>}
 <p className={styles.switch}>{register?"Déjà un compte ?":"Pas encore de page ?"} <Link href={register?"/login":"/signup"}>{register?"Se connecter":"Créer ma page"}</Link></p>
 </section></main>;
}
