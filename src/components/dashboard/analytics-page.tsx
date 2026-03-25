"use client";

import { useState, useEffect, useMemo } from "react";
import { useWorkspace } from "@/contexts/workspace-context";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/context";
import type { Question } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
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

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const [msgResult, convMonthResult, convTotalResult, leadsResult, msgDatesResult, questionsResult] =
        await Promise.all([
          // Total messages via conversations
          supabase
            .from("messages")
            .select("id, conversation:conversations!inner(workspace_id)", { count: "exact", head: true })
            .eq("conversations.workspace_id", workspaceId),
          // Conversations this month
          supabase
            .from("conversations")
            .select("id", { count: "exact", head: true })
            .eq("workspace_id", workspaceId)
            .gte("started_at", monthStart.toISOString()),
          // Total conversations
          supabase
            .from("conversations")
            .select("id", { count: "exact", head: true })
            .eq("workspace_id", workspaceId),
          // Total leads
          supabase
            .from("leads")
            .select("id", { count: "exact", head: true })
            .eq("workspace_id", workspaceId),
          // Message dates for last 30 days (for charts)
          supabase
            .from("messages")
            .select("created_at, conversation:conversations!inner(workspace_id)")
            .eq("conversations.workspace_id", workspaceId)
            .gte("created_at", thirtyDaysAgo.toISOString()),
          // Top questions
          supabase
            .from("questions")
            .select("id, question, count, last_asked_at, answered")
            .eq("workspace_id", workspaceId)
            .order("count", { ascending: false })
            .limit(10),
        ]);

      if (cancelled) return;

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-9 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="mt-2 h-5 w-72 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
                <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
              </div>
              <div className="mt-3 h-9 w-16 animate-pulse rounded-md bg-muted" />
            </div>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-xl border bg-muted/30" />
          ))}
        </div>
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

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Daily messages chart */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold mb-4">{t("analytics.messagesPerDay")}</h3>
          <DailyBarChart data={dailyCounts} />
        </div>

        {/* Hourly chart */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold mb-4">{t("analytics.popularHours")}</h3>
          <HourlyBarChart data={hourlyCounts} />
        </div>
      </div>

      {/* Top questions */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="text-base font-semibold mb-4">{t("analytics.topTopics")}</h3>
        {questions.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("analytics.noQuestions")}</p>
        ) : (
          <div className="space-y-2">
            {questions.map((q, i) => (
              <div
                key={q.id}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {i + 1}
                </div>
                <p className="flex-1 min-w-0 truncate text-sm">{q.question}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-medium">{q.count}x</span>
                  <Badge variant={q.answered ? "secondary" : "destructive"}>
                    {q.answered ? (
                      <>
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        {t("analytics.answered")}
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-1 h-3 w-3" />
                        {t("analytics.unanswered")}
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Value summary */}
      <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-6 shadow-sm">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalMessages.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">{t("analytics.messagesAnswered")}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">~{hoursSaved}</p>
              <p className="text-sm text-muted-foreground">{t("analytics.hoursSaved")}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalLeads.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">{t("analytics.leadsAutomatic")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}): React.ReactNode {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}

function DailyBarChart({ data }: { data: DailyCount[] }): React.ReactNode {
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
}

function HourlyBarChart({ data }: { data: HourlyCount[] }): React.ReactNode {
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
}
