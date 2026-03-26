"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useSearchParams } from "next/navigation";
import { useWorkspace } from "@/contexts/workspace-context";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/context";
import type { Question } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./empty-state";
import { UpgradeBanner } from "./upgrade-banner";
import { hasFeature } from "@/lib/plans";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Filter = "all" | "answered" | "unanswered";

const FILTER_KEYS: { key: Filter; tKey: string }[] = [
  { key: "all", tKey: "insights.filterAll" },
  { key: "answered", tKey: "insights.filterAnswered" },
  { key: "unanswered", tKey: "insights.filterUnanswered" },
];

const PAGE_SIZE = 25;

export function InsightsPageClient(): React.ReactNode {
  const workspace = useWorkspace();
  const { id: workspaceId } = workspace;
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const dateLocale = language === "nb" ? "nb-NO" : "en-US";
  const [questions, setQuestions] = useState<Question[]>([]);
  const initialFilter = (searchParams.get("filter") as Filter) ?? "all";
  const [filter, setFilter] = useState<Filter>(
    ["all", "answered", "unanswered"].includes(initialFilter) ? initialFilter : "all"
  );
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [totalUnanswered, setTotalUnanswered] = useState(0);

  // Reset page when filter changes
  useEffect(() => {
    setPage(0);
  }, [filter]);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);

    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    // Count queries for stats (always unfiltered for the stat cards)
    const answeredCountQuery = supabase
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("answered", true);

    const unansweredCountQuery = supabase
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("answered", false);

    // Filtered count query
    let filteredCountQuery = supabase
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId);
    if (filter === "answered") filteredCountQuery = filteredCountQuery.eq("answered", true);
    if (filter === "unanswered") filteredCountQuery = filteredCountQuery.eq("answered", false);

    // Data query with filter and pagination
    let dataQuery = supabase
      .from("questions")
      .select("id, question, count, last_asked_at, answered")
      .eq("workspace_id", workspaceId)
      .order("count", { ascending: false })
      .range(from, to);
    if (filter === "answered") dataQuery = dataQuery.eq("answered", true);
    if (filter === "unanswered") dataQuery = dataQuery.eq("answered", false);

    const [answeredResult, unansweredResult, filteredCountResult, dataResult] = await Promise.all([
      answeredCountQuery,
      unansweredCountQuery,
      filteredCountQuery,
      dataQuery,
    ]);

    setTotalAnswered(answeredResult.count ?? 0);
    setTotalUnanswered(unansweredResult.count ?? 0);
    setTotalCount(filteredCountResult.count ?? 0);
    setQuestions(dataResult.data ?? []);
    setLoading(false);
  }, [workspaceId, supabase, page, filter]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleDelete = useCallback(async (id: string) => {
    await supabase.from("questions").delete().eq("id", id);
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    setTotalCount((prev) => prev - 1);
  }, [supabase]);

  async function handleClearAll() {
    if (!confirm(t('insights.confirmClear'))) return;
    await supabase.from("questions").delete().eq("workspace_id", workspaceId);
    setQuestions([]);
    setTotalCount(0);
    setTotalAnswered(0);
    setTotalUnanswered(0);
  }

  const totalPages = useMemo(() => Math.ceil(totalCount / PAGE_SIZE), [totalCount]);
  const totalQuestionsCount = totalAnswered + totalUnanswered;

  if (!hasFeature(workspace.plan_id, "insights")) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('insights.title')}</h1>
          <p className="mt-1 text-muted-foreground">
            {t('insights.description')}
          </p>
        </div>
        <UpgradeBanner feature="insights" />
      </div>
    );
  }

  if (loading && questions.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('insights.title')}</h1>
          <p className="mt-1 text-muted-foreground">
            {t('insights.description')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('insights.title')}</h1>
        <p className="mt-1 text-muted-foreground">
          {t('insights.description')}
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            {t('insights.totalQuestions')}
          </div>
          <p className="mt-2 text-2xl font-bold">{totalQuestionsCount}</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            {t('insights.answered')}
          </div>
          <p className="mt-2 text-2xl font-bold">{totalAnswered}</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <XCircle className="h-4 w-4 text-destructive" />
            {t('insights.unanswered')}
          </div>
          <p className="mt-2 text-2xl font-bold">{totalUnanswered}</p>
        </div>
      </div>

      {/* Filter + clear */}
      <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap gap-2">
        {FILTER_KEYS.map((opt) => (
          <Button
            key={opt.key}
            variant={filter === opt.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(opt.key)}
          >
            {t(opt.tKey)}
          </Button>
        ))}
      </div>
      {totalQuestionsCount > 0 && (
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={handleClearAll}>
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          {t('insights.clearAll')}
        </Button>
      )}
      </div>

      {/* Bar chart */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="text-base font-semibold mb-4">{t('insights.topQuestions')}</h3>
        <BarChart questions={questions.slice(0, 8)} maxCount={Math.max(...questions.map((x) => x.count), 0)} />
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-success" />
            {t('insights.answered')}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-warning" />
            {t('insights.unanswered')}
          </div>
        </div>
      </div>

      {/* Questions list */}
      {questions.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title={t('insights.empty')}
          description={t('insights.emptyDescription')}
        />
      ) : (
        <div className="space-y-2">
          {questions.map((q, i) => (
            <div
              key={q.id}
              className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {page * PAGE_SIZE + i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{q.question}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t('insights.lastAsked')}{" "}
                  {new Date(q.last_asked_at).toLocaleDateString(dateLocale)}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className="text-lg font-bold">{q.count}</p>
                  <p className="text-[10px] text-muted-foreground">{t('insights.times')}</p>
                </div>
                <Badge
                  variant={q.answered ? "secondary" : "destructive"}
                >
                  {q.answered ? (
                    <>
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      {t('insights.answered')}
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-1 h-3 w-3" />
                      {t('insights.unanswered')}
                    </>
                  )}
                </Badge>
                <button
                  onClick={() => handleDelete(q.id)}
                  className="rounded-lg p-1.5 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
                  aria-label="Slett"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t('common.previous')}
          </Button>
          <span className="text-sm text-muted-foreground">
            {t('common.pageOf', { page: page + 1, total: totalPages })}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            {t('common.next')}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

const BarChart = memo(function BarChart({ questions, maxCount }: { questions: Question[]; maxCount: number }) {
  return (
    <div className="space-y-3">
      {questions.map((q) => {
        const pct = maxCount > 0 ? (q.count / maxCount) * 100 : 0;
        return (
          <div key={q.id} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="truncate pr-4">{q.question}</span>
              <span className="shrink-0 font-medium">{q.count}</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-muted">
              <div
                className="h-2.5 rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  backgroundColor: q.answered ? "var(--success)" : "var(--warning)",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
});
