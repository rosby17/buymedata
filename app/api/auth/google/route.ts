import crypto from "node:crypto";
import { cookies } from "next/headers";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { withTransaction } from "@/lib/db";
import { createSession, sessionCookie, cookieOptions } from "@/lib/auth";
import { signPayload, readPayload, safeEqual, validUsername } from "@/lib/auth-security";
const keys=createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
export async function GET(request:Request){
 const origin=process.env.NEXT_PUBLIC_SITE_URL||new URL(request.url).origin;
 const redirectUri=process.env.GOOGLE_REDIRECT_URI||origin+"/api/auth/google";
 const url=new URL(request.url),jar=await cookies();
 const fail=(reason:string)=>Response.redirect(origin+"/login?error="+encodeURIComponent(reason));
 if(!process.env.GOOGLE_CLIENT_ID||!process.env.GOOGLE_CLIENT_SECRET)return fail("La connexion Google n’est pas encore configurée.");
 try{
 if(!url.searchParams.has("code")&&!url.searchParams.has("error")){
 const intent=url.searchParams.get("intent")==="signup"?"signup":"login",username=url.searchParams.get("username")||"";
 if(intent==="signup"&&!validUsername(username))return fail("Choisissez d’abord un username valide.");
 const state=crypto.randomBytes(32).toString("hex"),nonce=crypto.randomBytes(32).toString("hex"),verifier=crypto.randomBytes(32).toString("base64url");
 jar.set("google_oauth_state",signPayload({state,nonce,verifier,intent,username,issued:Date.now()}),{...cookieOptions,maxAge:600});
 const params=new URLSearchParams({client_id:process.env.GOOGLE_CLIENT_ID,redirect_uri:redirectUri,response_type:"code",response_mode:"query",scope:"openid email profile",state,nonce,prompt:"select_account",code_challenge:crypto.createHash("sha256").update(verifier).digest("base64url"),code_challenge_method:"S256"});
 return Response.redirect("https://accounts.google.com/o/oauth2/v2/auth?"+params);
 }
 const saved=readPayload(jar.get("google_oauth_state")?.value);jar.delete("google_oauth_state");
 if(!saved||typeof saved.state!=="string"||!safeEqual(saved.state,url.searchParams.get("state")||"")||typeof saved.issued!=="number"||saved.issued>Date.now()||Date.now()-saved.issued>600000)return fail("La session Google a expiré. Recommencez.");
 if(url.searchParams.has("error"))return fail("Connexion Google annulée.");
 const r=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({code:url.searchParams.get("code")!,client_id:process.env.GOOGLE_CLIENT_ID,client_secret:process.env.GOOGLE_CLIENT_SECRET,redirect_uri:redirectUri,grant_type:"authorization_code",code_verifier:String(saved.verifier)}),signal:AbortSignal.timeout(15000)});
 if(!r.ok)return fail("Google n’a pas pu confirmer cette connexion.");
 const tokens=await r.json();
 const {payload}=await jwtVerify(tokens.id_token,keys,{issuer:["https://accounts.google.com","accounts.google.com"],audience:process.env.GOOGLE_CLIENT_ID});
 if(payload.nonce!==saved.nonce||payload.email_verified!==true||typeof payload.email!=="string"||!payload.sub)return fail("Une adresse Google vérifiée est nécessaire.");
 const email=payload.email.toLowerCase();
 const userId=await withTransaction(async client=>{
 const existing=await client.query("SELECT id,google_sub FROM profiles WHERE google_sub=$1 OR lower(email)=$2 FOR UPDATE",[payload.sub,email]);
 if(saved.intent==="signup"){
 if(existing.rowCount)throw new Error("Ce compte existe déjà. Connectez-vous ou choisissez un autre compte Google.");
 if(typeof saved.username!=="string"||!validUsername(saved.username))throw new Error("Username invalide.");
 const id=crypto.randomUUID();
 await client.query("INSERT INTO profiles(id,email,full_name,username,role,google_sub,email_verified_at) VALUES($1,$2,$3,$4,'creator',$5,now())",[id,email,saved.username,saved.username,payload.sub]);return id;
 }
 const linked=existing.rows.find(row=>row.google_sub===payload.sub);
 if(linked)return linked.id;
 // Only migrate Google-only accounts after fresh proof, never password accounts by matching email.
 const legacy=existing.rows.find(row=>!row.google_sub);
 if(legacy){
 const credential=await client.query("SELECT user_id FROM auth_credentials WHERE user_id=$1",[legacy.id]);
 if(credential.rowCount)throw new Error("Cette adresse possède un compte avec mot de passe. Utilisez votre adresse et votre mot de passe.");
 await client.query("UPDATE profiles SET google_sub=$1,email_verified_at=now() WHERE id=$2",[payload.sub,legacy.id]);return legacy.id;
 }
 throw new Error("Aucun compte Google associé. Créez d’abord votre page.");
 });
 jar.set(sessionCookie,createSession(userId),cookieOptions);
 return Response.redirect(origin+"/dashboard");
 }catch(error){
 if((error as {code?:string}).code==="23505")return fail("Cette adresse ou ce username est déjà utilisé.");
 const message=error instanceof Error?error.message:"";
 const allowed=["Ce compte existe déjà.","Cette adresse possède","Aucun compte Google associé.","Username invalide."];
 return fail(allowed.some(prefix=>message.startsWith(prefix))?message:"Connexion Google impossible. Veuillez réessayer.");
 }
}
