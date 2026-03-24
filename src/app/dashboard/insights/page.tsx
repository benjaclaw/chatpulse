"use client";

import { useState } from "react";
import { mockQuestions } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from "lucide-react";

type Filter = "all" | "answered" | "unanswered";

export default function InsightsPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = mockQuestions
    .filter((q) => {
      if (filter === "answered") return q.answered;
      if (filter === "unanswered") return !q.answered;
      return true;
    })
    .sort((a, b) => b.count - a.count);

  const totalAnswered = mockQuestions.filter((q) => q.answered).length;
  const totalUnanswered = mockQuestions.filter((q) => !q.answered).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Innsikt</h1>
        <p className="mt-1 text-muted-foreground">
          Se hva kundene dine spør om mest.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            Totalt spørsmål
          </div>
          <p className="mt-2 text-2xl font-bold">{mockQuestions.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            Besvart
          </div>
          <p className="mt-2 text-2xl font-bold">{totalAnswered}</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <XCircle className="h-4 w-4 text-destructive" />
            Ubesvart
          </div>
          <p className="mt-2 text-2xl font-bold">{totalUnanswered}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(
          [
            ["all", "Alle"],
            ["answered", "Besvart"],
            ["unanswered", "Ubesvart"],
          ] as const
        ).map(([key, label]) => (
          <Button
            key={key}
            variant={filter === key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Bar chart */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="text-base font-semibold mb-4">Topp-spørsmål</h3>
        <div className="space-y-3">
          {filtered.slice(0, 8).map((q) => {
            const maxCount = Math.max(...filtered.map((x) => x.count));
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
                      backgroundColor: q.answered
                        ? "var(--success)"
                        : "var(--warning)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-success" />
            Besvart
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-warning" />
            Ubesvart
          </div>
        </div>
      </div>

      {/* Questions list */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card/50 p-8 text-center dark:bg-card/20">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <HelpCircle className="h-7 w-7 text-primary" />
          </div>
          <h3 className="mt-4 text-base font-semibold">Ingen spørsmål funnet</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Det er ingen spørsmål som matcher dette filteret.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((q, i) => (
            <div
              key={q.id}
              className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{q.question}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Sist stilt:{" "}
                  {new Date(q.last_asked_at).toLocaleDateString("nb-NO")}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className="text-lg font-bold">{q.count}</p>
                  <p className="text-[10px] text-muted-foreground">ganger</p>
                </div>
                <Badge
                  variant={q.answered ? "secondary" : "destructive"}
                >
                  {q.answered ? (
                    <>
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Besvart
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-1 h-3 w-3" />
                      Ubesvart
                    </>
                  )}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
