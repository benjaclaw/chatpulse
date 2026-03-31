"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  MessageSquare,
  HelpCircle,
  Users,
  ArrowRight,
  Rocket,
  MessageCircle,
  Palette,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import { useWorkspace } from "@/contexts/workspace-context";
import { createClient } from "@/lib/supabase/client";

interface DashboardStats {
  totalConversations: number;
  messagesToday: number;
  unansweredQuestions: number;
  teamMembers: number;
}

interface ActivityItem {
  id: string;
  icon: string;
  description: string;
  time: string;
  timestamp: number;
}

function relativeTime(date: Date, t: (key: string) => string): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return t("leads.time.now");
  if (minutes < 60) return `${minutes} ${t("dashboard.time.minAgo")}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${t("dashboard.time.hoursAgo")}`;
  const days = Math.floor(hours / 24);
  return `${days} ${t("dashboard.time.daysAgo")}`;
}

export function DashboardContent({ stats }: { stats: DashboardStats }): React.ReactNode {
  const { t } = useLanguage();
  const workspace = useWorkspace();
  const supabase = createClient();
  const [hasKnowledge, setHasKnowledge] = useState<boolean | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    // Check if workspace has knowledge items
    supabase
      .from("knowledge")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspace.id)
      .then(({ count }) => {
        setHasKnowledge((count ?? 0) > 0);
      });

    // Fetch recent activity
    async function fetchActivity() {
      const items: ActivityItem[] = [];

      const { data: convs } = await supabase
        .from("conversations")
        .select("id, status, created_at, visitor_id, leads(name, email)")
        .eq("workspace_id", workspace.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (convs) {
        for (const conv of convs) {
          const lead = Array.isArray(conv.leads) ? conv.leads[0] : conv.leads;
          const name = lead?.name || lead?.email || t("inbox.visitor");
          const created = new Date(conv.created_at);

          if (conv.status === "closed") {
            items.push({
              id: `closed-${conv.id}`,
              icon: "\u2705",
              description: t("inbox.closed"),
              time: relativeTime(created, t),
              timestamp: created.getTime(),
            });
          } else if (conv.status === "human") {
            items.push({
              id: `claimed-${conv.id}`,
              icon: "\uD83D\uDC64",
              description: `${name}`,
              time: relativeTime(created, t),
              timestamp: created.getTime(),
            });
          } else {
            items.push({
              id: `new-${conv.id}`,
              icon: "\uD83D\uDCAC",
              description: name,
              time: relativeTime(created, t),
              timestamp: created.getTime(),
            });
          }
        }
      }

      items.sort((a, b) => b.timestamp - a.timestamp);
      setActivities(items.slice(0, 10));
      setLoadingActivity(false);
    }

    fetchActivity();
  }, [workspace.id]);

  return (
    <div className="space-y-8 animate-scroll-fade">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
        <p className="mt-1 text-muted-foreground">
          {t('dashboard.description')}
        </p>
      </div>

      {/* Onboarding banner — hidden when workspace has knowledge */}
      {hasKnowledge === false && (
        <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 dark:from-primary/10 dark:to-accent/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
                <Rocket className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{t('dashboard.onboarding.title')}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('dashboard.onboarding.description')}
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/knowledge"
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md active:scale-[0.97]"
            >
              {t('dashboard.onboarding.cta')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={MessageSquare}
          title={t('dashboard.stats.totalConversations')}
          value={stats.totalConversations}
          href="/dashboard/conversations"
        />
        <StatCard
          icon={MessageCircle}
          title={t('dashboard.stats.messagesToday')}
          value={stats.messagesToday}
        />
        <StatCard
          icon={HelpCircle}
          title={t('dashboard.stats.unansweredQuestions')}
          value={stats.unansweredQuestions}
          href="/dashboard/insights?filter=unanswered"
        />
        <StatCard
          icon={Users}
          title={t('dashboard.stats.teamMembers')}
          value={stats.teamMembers}
          href="/dashboard/team"
        />
      </div>

      {/* Recent activity + quick actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent activity */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold">{t('dashboard.recentActivity')}</h3>
          <div className="mt-4 space-y-3">
            {loadingActivity ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-6 w-6 shrink-0 rounded bg-muted animate-shimmer" style={{ animationDelay: `${i * 100}ms` }} />
                    <div className="h-4 flex-1 rounded bg-muted animate-shimmer" style={{ animationDelay: `${i * 100 + 25}ms` }} />
                    <div className="h-3 w-12 shrink-0 rounded bg-muted animate-shimmer" style={{ animationDelay: `${i * 100 + 50}ms` }} />
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="flex flex-col items-center py-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <MessageSquare className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {t('dashboard.noActivity')}
                </p>
              </div>
            ) : (
              activities.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors duration-150 hover:bg-muted/50">
                  <span className="text-base">{a.icon}</span>
                  <span className="flex-1 truncate">{a.description}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{a.time}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold">{t('dashboard.quickActions')}</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <QuickAction
              icon={BookOpen}
              title={t('dashboard.quick.knowledge')}
              description={t('dashboard.quick.knowledgeDesc')}
              href="/dashboard/knowledge"
            />
            <QuickAction
              icon={MessageSquare}
              title={t('dashboard.quick.conversations')}
              description={t('dashboard.quick.conversationsDesc')}
              href="/dashboard/conversations"
            />
            <QuickAction
              icon={HelpCircle}
              title={t('dashboard.quick.insights')}
              description={t('dashboard.quick.insightsDesc')}
              href="/dashboard/insights"
            />
            <QuickAction
              icon={Palette}
              title={t('dashboard.quick.customize')}
              description={t('dashboard.quick.customizeDesc')}
              href="/dashboard/chatbot"
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
    <div className="group rounded-xl border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-200 group-hover:bg-primary/15 group-hover:scale-105 dark:bg-primary/20">
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-sm text-muted-foreground">{title}</span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
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
      className="group flex items-center gap-3 rounded-lg border p-3 transition-all duration-200 hover:bg-muted/50 hover:shadow-sm hover:border-primary/20 active:scale-[0.98]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-200 group-hover:bg-primary/15 group-hover:scale-105 dark:bg-primary/20">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium group-hover:text-primary transition-colors duration-200">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}
