import {query} from "@/lib/db";
export async function GET(request:Request){
 const url=new URL(request.url),offset=Math.floor(Math.max(0,Math.min(100000,Number(url.searchParams.get("offset"))||0)));
 const status=url.searchParams.get("status")==="completed"?"completed":"active";
 const search=(url.searchParams.get("q")||"").trim().slice(0,100);
 try{
 const result=await query(`SELECT c.id,c.slug,c.title,c.description,c.cover_url,c.target_amount,c.collected_amount,c.status,p.username,p.full_name AS creator_name
 FROM campaigns c JOIN profiles p ON p.id=c.creator_id
 WHERE c.status=$1 AND ($2='' OR c.title ILIKE '%'||$2||'%' OR c.description ILIKE '%'||$2||'%')
 ORDER BY c.created_at DESC,c.id LIMIT 25 OFFSET $3`,[status,search,offset]);
 return Response.json({campaigns:result.rows.slice(0,24),hasMore:result.rows.length>24});
 }catch{return Response.json({error:"Les cagnottes sont momentanément indisponibles."},{status:503});}
}
