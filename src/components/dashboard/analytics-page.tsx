"use client";

import { useState, useEffect, useMemo, memo } from "react";
import { useWorkspace } from "@/contexts/workspace-context";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/context";
import type { Question } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "./empty-state";
import {
  MessageSquare,
  MessagesSquare,
  BarChart3,
  UserPlus,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  Target,
  SmilePlus,
} from "lucide-react";

interface DailyCount {
  date: string;
  count: number;
}

interface HourlyCount {
  hour: number;
  count: number;
}

export function AnalyticsPageClient(): React.ReactNode {
  const workspace = useWorkspace();
  const { id: workspaceId } = workspace;
  const { t } = useLanguage();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [totalMessages, setTotalMessages] = useState(0);
  const [conversationsThisMonth, setConversationsThisMonth] = useState(0);
  const [totalConversations, setTotalConversations] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);
  const [messageDates, setMessageDates] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [csatCounts, setCsatCounts] = useState<{ good: number; ok: number; bad: number } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const [msgResult, convMonthResult, convTotalResult, leadsResult, msgDatesResult, questionsResult, csatGood, csatOk, csatBad] =
        await Promise.all([
          // Total messages via conversations
          supabase
            .from("messages")
            .select("id, conversation:conversations!inner(workspace_id)", { count: "exact", head: true })
            .eq("conversations.workspace_id", workspaceId)
            .is("deleted_at", null),
          // Conversations this month
          supabase
            .from("conversations")
            .select("id", { count: "exact", head: true })
            .eq("workspace_id", workspaceId)
            .is("deleted_at", null)
            .gte("started_at", monthStart.toISOString()),
          // Total conversations
          supabase
            .from("conversations")
            .select("id", { count: "exact", head: true })
            .eq("workspace_id", workspaceId)
            .is("deleted_at", null),
          // Total leads
          supabase
            .from("leads")
            .select("id", { count: "exact", head: true })
            .eq("workspace_id", workspaceId),
          // Message dates for last 30 days (for charts) — only fetch created_at
          supabase
            .from("messages")
            .select("created_at, conversation:conversations!inner(id)")
            .eq("conversations.workspace_id", workspaceId)
            .is("deleted_at", null)
            .gte("created_at", thirtyDaysAgo.toISOString()),
          // Top questions
          supabase
            .from("questions")
            .select("id, question, count, last_asked_at, answered")
            .eq("workspace_id", workspaceId)
            .order("count", { ascending: false })
            .limit(10),
          // CSAT ratings — use count queries instead of fetching all rows
          supabase
            .from("conversations")
            .select("id", { count: "exact", head: true })
            .eq("workspace_id", workspaceId)
            .is("deleted_at", null)
            .eq("rating", "good"),
          supabase
            .from("conversations")
            .select("id", { count: "exact", head: true })
            .eq("workspace_id", workspaceId)
            .is("deleted_at", null)
            .eq("rating", "ok"),
          supabase
            .from("conversations")
            .select("id", { count: "exact", head: true })
            .eq("workspace_id", workspaceId)
            .is("deleted_at", null)
            .eq("rating", "bad"),
        ]);

      if (cancelled) return;

      const good = csatGood.count ?? 0;
      const ok = csatOk.count ?? 0;
      const bad = csatBad.count ?? 0;
      if (good + ok + bad > 0) {
        setCsatCounts({ good, ok, bad });
      }

      setTotalMessages(msgResult.count ?? 0);
      setConversationsThisMonth(convMonthResult.count ?? 0);
      setTotalConversations(convTotalResult.count ?? 0);
      setTotalLeads(leadsResult.count ?? 0);
      setMessageDates(
        (msgDatesResult.data ?? []).map((m: { created_at: string }) => m.created_at)
      );
      setQuestions(questionsResult.data ?? []);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [workspaceId, supabase]);

  const avgMessagesPerConversation =
    totalConversations > 0 ? Math.round((totalMessages / totalConversations) * 10) / 10 : 0;

  // Group messages by day (last 30 days)
  const dailyCounts = useMemo((): DailyCount[] => {
    const now = new Date();
    const counts: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      counts[key] = 0;
    }
    for (const dateStr of messageDates) {
      const key = dateStr.slice(0, 10);
      if (key in counts) counts[key]++;
    }
    return Object.entries(counts).map(([date, count]) => ({ date, count }));
  }, [messageDates]);

  // Group messages by hour
  const hourlyCounts = useMemo((): HourlyCount[] => {
    const counts = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
    for (const dateStr of messageDates) {
      const hour = new Date(dateStr).getHours();
      counts[hour].count++;
    }
    return counts;
  }, [messageDates]);

  const hoursSaved = Math.round((totalMessages * 2) / 60);

  const hasNoData = totalConversations === 0 && totalMessages === 0;

  if (loading) {
    return (
      <div className="space-y-6 animate-scroll-fade">
        <div>
          <div className="h-9 w-48 rounded-lg bg-muted animate-shimmer" />
          <div className="mt-2 h-5 w-72 rounded-md bg-muted animate-shimmer" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-6 shadow-sm" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-muted animate-shimmer" />
                <div className="h-4 w-24 rounded-md bg-muted animate-shimmer" />
              </div>
              <div className="mt-3 h-9 w-16 rounded-md bg-muted animate-shimmer" />
            </div>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-72 rounded-xl border bg-muted/30 animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (hasNoData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("analytics.title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("analytics.description")}</p>
        </div>
        <EmptyState
          icon={BarChart3}
          title={t("analytics.title")}
          description={t("analytics.emptyState")}
          hint={t("hint.analytics")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("analytics.title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("analytics.description")}</p>
      </div>

      {/* Top stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={MessageSquare}
          label={t("analytics.totalMessages")}
          value={totalMessages.toLocaleString()}
        />
        <StatCard
          icon={MessagesSquare}
          label={t("analytics.conversationsThisMonth")}
          value={conversationsThisMonth.toLocaleString()}
        />
        <StatCard
          icon={BarChart3}
          label={t("analytics.avgPerConversation")}
          value={avgMessagesPerConversation.toString()}
        />
        <StatCard
          icon={UserPlus}
          label={t("analytics.leadsCaptured")}
          value={totalLeads.toLocaleString()}
        />
      </div>

      {/* CSAT card */}
      {csatCounts && <CsatCard counts={csatCounts} t={t} />}

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Daily messages chart */}
        <div className="rounded-xl border bg-card p-6 shadow-sm overflow-x-auto">
          <h3 className="text-base font-semibold mb-4">{t("analytics.messagesPerDay")}</h3>
          {messageDates.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">{t("analytics.noData")}</p>
          ) : (
            <div className="min-w-[300px]">
              <DailyBarChart data={dailyCounts} />
            </div>
          )}
        </div>

        {/* Hourly chart */}
        <div className="rounded-xl border bg-card p-6 shadow-sm overflow-x-auto">
          <h3 className="text-base font-semibold mb-4">{t("analytics.popularHours")}</h3>
          {messageDates.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">{t("analytics.noData")}</p>
          ) : (
            <HourlyBarChart data={hourlyCounts} />
          )}
        </div>
      </div>


    </div>
  );
}

const CsatCard = memo(function CsatCard({
  counts,
  t,
}: {
  counts: { good: number; ok: number; bad: number };
  t: (key: string) => string;
}) {
  const total = counts.good + counts.ok + counts.bad;
  const score = (counts.good * 3 + counts.ok * 2 + counts.bad * 1) / total;
  let emoji: string;
  let label: string;
  if (score >= 2.5) {
    emoji = "\u{1F60A}";
    label = t("analytics.csatGood");
  } else if (score >= 1.5) {
    emoji = "\u{1F610}";
    label = t("analytics.csatOk");
  } else {
    emoji = "\u{1F61E}";
    label = t("analytics.csatBad");
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md max-w-xs">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <SmilePlus className="h-4 w-4" />
        </div>
        <span className="text-sm text-muted-foreground">{t("analytics.customerSatisfaction")}</span>
      </div>
      <p className="mt-3 text-3xl font-bold">
        {emoji} {label}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {total} {t("analytics.csatRatings")}
      </p>
    </div>
  );
});

const StatCard = memo(function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="group rounded-xl border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-primary/20">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-200 group-hover:scale-105 group-hover:bg-primary/15 dark:bg-primary/20">
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
    </div>
  );
});

const DailyBarChart = memo(function DailyBarChart({ data }: { data: DailyCount[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div>
      <div className="flex items-end gap-[2px]" style={{ height: 160 }}>
        {data.map((d, i) => {
          const pct = (d.count / maxCount) * 100;
          return (
            <div
              key={d.date}
              className="group relative flex-1"
              style={{ height: "100%" }}
            >
              <div className="absolute inset-x-0 bottom-0 rounded-t bg-primary transition-all duration-300 hover:opacity-80"
                style={{ height: `${Math.max(pct, 2)}%` }}
              />
              <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-popover px-2 py-1 text-xs shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {d.count} {i === 0 ? "" : ""}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex text-[10px] text-muted-foreground">
        {data.map((d, i) =>
          i % 5 === 0 ? (
            <span key={d.date} className="flex-1 text-center">
              {d.date.slice(5)}
            </span>
          ) : (
            <span key={d.date} className="flex-1" />
          )
        )}
      </div>
    </div>
  );
});

const HourlyBarChart = memo(function HourlyBarChart({ data }: { data: HourlyCount[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
      {data.map((d) => {
        const pct = (d.count / maxCount) * 100;
        return (
          <div key={d.hour} className="flex items-center gap-2">
            <span className="w-8 shrink-0 text-right text-xs text-muted-foreground">
              {String(d.hour).padStart(2, "0")}:00
            </span>
            <div className="flex-1 h-5 rounded bg-muted">
              <div
                className="h-5 rounded bg-primary/70 transition-all duration-300"
                style={{ width: `${Math.max(pct, 1)}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-xs font-medium">{d.count}</span>
          </div>
        );
      })}
    </div>
  );
});
