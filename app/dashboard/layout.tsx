import DashboardShell from "@/components/DashboardShell";
import { currentUserId } from "@/lib/auth";
import { query } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const userId = await currentUserId();
  if (!userId) redirect("/login?next=/dashboard");
  const result = await query<{ id: string; email: string; full_name: string; role: "creator" | "supporter"; username: string | null; avatar_url: string | null; bio: string | null; category: string | null }>("SELECT id, email, full_name, role, username, avatar_url, bio, category FROM profiles WHERE id=$1", [userId]);
  if (!result.rows[0]) redirect("/login?next=/dashboard");
  return <DashboardShell profile={result.rows[0]}>{children}</DashboardShell>;
}
