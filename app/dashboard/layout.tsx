import DashboardShell from "@/components/DashboardShell";
import { currentUserId } from "@/lib/auth";
import { query } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const userId = await currentUserId();
  if (!userId) redirect("/login?next=/dashboard");
  const result = await query<{ email: string; name: string; username: string | null; avatar_url: string | null }>("SELECT email, full_name AS name, username, avatar_url FROM profiles WHERE id=$1", [userId]);
  if (!result.rows[0]) redirect("/login?next=/dashboard");
  return <DashboardShell profile={result.rows[0]}>{children}</DashboardShell>;
}
