import AuthForm from "@/components/AuthForm";
export default async function Login({searchParams}:{searchParams:Promise<{error?:string}>}){const params=await searchParams;return <AuthForm initialError={typeof params.error==="string"?params.error:""}/>;}
