import {
  BookOpen,
  MessageSquare,
  HelpCircle,
  Users,
  ArrowRight,
  Rocket,
  MessageCircle,
  FileText,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { ActivityType } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard — ChatPulse",
};

const activityIcons: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  conversation: MessageCircle,
  knowledge: FileText,
  question: HelpCircle,
  team: UserPlus,
};

export default async function DashboardPage(): Promise<React.ReactNode> {
  const supabase = await createClient();

  // Get real counts from Supabase
  const [convResult, msgResult, qResult, memberResult] = await Promise.all([
    supabase.from("conversations").select("id", { count: "exact", head: true }),
    supabase.from("messages").select("id", { count: "exact", head: true }).gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    supabase.from("questions").select("id", { count: "exact", head: true }).eq("answered", false),
    supabase.from("members").select("id", { count: "exact", head: true }),
  ]);

  const stats = {
    totalConversations: convResult.count ?? 0,
    messagesToday: msgResult.count ?? 0,
    unansweredQuestions: qResult.count ?? 0,
    teamMembers: memberResult.count ?? 0,
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Oversikt over din workspace.
        </p>
      </div>

      {/* Onboarding banner */}
      <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 dark:from-primary/10 dark:to-accent/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
              <Rocket className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Kom i gang med ChatPulse</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Sett opp AI-chatboten din i 3 enkle steg: legg til kunnskap, konfigurer boten, og embed widgeten.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/knowledge"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            Legg til kunnskap
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={MessageSquare}
          title="Totale samtaler"
          value={stats.totalConversations}
          href="/dashboard/conversations"
        />
        <StatCard
          icon={MessageCircle}
          title="Meldinger i dag"
          value={stats.messagesToday}
        />
        <StatCard
          icon={HelpCircle}
          title="Ubesvarte spørsmål"
          value={stats.unansweredQuestions}
          href="/dashboard/insights?filter=unanswered"
        />
        <StatCard
          icon={Users}
          title="Team-medlemmer"
          value={stats.teamMembers}
          href="/dashboard/team"
        />
      </div>

      {/* Recent activity + quick actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent activity */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold">Siste aktivitet</h3>
          <div className="mt-4 space-y-3">
            {stats.totalConversations === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Ingen aktivitet ennå. Sett opp chatboten for å komme i gang!
              </p>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Aktivitetslogg kommer snart.
              </p>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold">Hurtighandlinger</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <QuickAction
              icon={BookOpen}
              title="Kunnskapsbase"
              description="Legg til artikler"
              href="/dashboard/knowledge"
            />
            <QuickAction
              icon={MessageSquare}
              title="Samtaler"
              description="Se samtalelogg"
              href="/dashboard/conversations"
            />
            <QuickAction
              icon={HelpCircle}
              title="Innsikt"
              description="Se topp-spørsmål"
              href="/dashboard/insights"
            />
            <QuickAction
              icon={Users}
              title="Team"
              description="Inviter medlemmer"
              href="/dashboard/team"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: number;
  href?: string;
}): React.ReactNode {
  const content = (
    <div className="group rounded-xl border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm text-muted-foreground">{title}</span>
      </div>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

function QuickAction({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
}): React.ReactNode {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg border p-3 transition-all duration-150 hover:bg-muted/50 hover:shadow-sm"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min siden`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}t siden`;
  const days = Math.floor(hours / 24);
  return `${days}d siden`;
}
