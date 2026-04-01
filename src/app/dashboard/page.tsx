import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "./dashboard-content";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard — ChatPulse",
};

export default async function DashboardPage(): Promise<React.ReactNode> {
  const supabase = await createClient();

  // Get real counts from Supabase
  const [convResult, msgResult, qResult, memberResult] = await Promise.all([
    supabase.from("conversations").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("messages").select("id", { count: "exact", head: true }).is("deleted_at", null).gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    supabase.from("questions").select("id", { count: "exact", head: true }).eq("answered", false),
    supabase.from("members").select("id", { count: "exact", head: true }),
  ]);

  const stats = {
    totalConversations: convResult.count ?? 0,
    messagesToday: msgResult.count ?? 0,
    unansweredQuestions: qResult.count ?? 0,
    teamMembers: memberResult.count ?? 0,
  };

  return <DashboardContent stats={stats} />;
}
