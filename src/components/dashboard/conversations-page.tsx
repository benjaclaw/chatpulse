"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useWorkspace } from "@/contexts/workspace-context";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "./empty-state";
import { useLanguage } from "@/lib/i18n/context";
import {
  MessageSquare,
  User,
  Bot,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  Download,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";

type DateRange = "today" | "week" | "2weeks" | "month" | "3months" | "all";

const DATE_KEYS: { key: DateRange; tKey: string }[] = [
  { key: "today", tKey: "conversations.today" },
  { key: "week", tKey: "conversations.week" },
  { key: "2weeks", tKey: "conversations.twoWeeks" },
  { key: "month", tKey: "conversations.month" },
  { key: "3months", tKey: "conversations.threeMonths" },
  { key: "all", tKey: "conversations.all" },
];

const PAGE_SIZE = 20;

interface ConversationRow {
  id: string;
  visitor_id: string;
  preview: string;
  started_at: string;
  message_count: number;
  duration_min: number | null;
}

function getDateFrom(range: DateRange): string | null {
  if (range === "all") return null;
  const now = new Date();
  switch (range) {
    case "today":
      now.setHours(0, 0, 0, 0);
      return now.toISOString();
    case "week":
      now.setDate(now.getDate() - 7);
      return now.toISOString();
    case "2weeks":
      now.setDate(now.getDate() - 14);
      return now.toISOString();
    case "month":
      now.setMonth(now.getMonth() - 1);
      return now.toISOString();
    case "3months":
      now.setMonth(now.getMonth() - 3);
      return now.toISOString();
  }
}

export function ConversationsPageClient(): React.ReactNode {
  const { id: workspaceId } = useWorkspace();
  const { t, language } = useLanguage();
  const supabase = createClient();
  const dateLocale = language === "nb" ? "nb-NO" : "en-US";

  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>("month");
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [page, setPage] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedMessages, setExpandedMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when date range changes
  useEffect(() => {
    setPage(0);
  }, [dateRange]);

  const fetchConversations = useCallback(async () => {
    setLoading(true);

    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const dateFrom = getDateFrom(dateRange);

    // Search once and reuse the IDs for both count and data queries
    let searchConvIds: string[] | null = null;
    if (searchDebounced) {
      const { data: matchingConvos } = await supabase
        .from("messages")
        .select("conversation_id")
        .ilike("content", `%${searchDebounced}%`)
        .is("deleted_at", null);
      searchConvIds = [...new Set((matchingConvos ?? []).map((m: { conversation_id: string }) => m.conversation_id))];
      if (searchConvIds.length === 0) {
        setConversations([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }
    }

    // Build count query
    let countQuery = supabase
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .is("deleted_at", null);

    if (dateFrom) countQuery = countQuery.gte("started_at", dateFrom);
    if (searchConvIds) countQuery = countQuery.in("id", searchConvIds);

    // Build data query
    let dataQuery = supabase
      .from("conversations")
      .select("id, visitor_id, started_at, messages(id, content, role, created_at)")
      .eq("workspace_id", workspaceId)
      .is("deleted_at", null)
      .order("started_at", { ascending: false })
      .range(from, to);

    if (dateFrom) dataQuery = dataQuery.gte("started_at", dateFrom);
    if (searchConvIds) dataQuery = dataQuery.in("id", searchConvIds);

    const [countResult, dataResult] = await Promise.all([countQuery, dataQuery]);

    setTotalCount(countResult.count ?? 0);
    const rows: ConversationRow[] = (dataResult.data ?? []).map(
      (c: { id: string; visitor_id: string; started_at: string; messages: { id: string; content: string; role: string; created_at: string }[] }) => {
        const firstUserMsg = c.messages?.find((m) => m.role === "user");
        let duration_min: number | null = null;
        if (c.messages?.length > 0) {
          const lastMsg = c.messages.reduce((a, b) =>
            a.created_at > b.created_at ? a : b
          );
          duration_min = Math.round(
            (new Date(lastMsg.created_at).getTime() - new Date(c.started_at).getTime()) / 60000
          );
          if (duration_min < 0) duration_min = 0;
        }
        return {
          id: c.id,
          visitor_id: c.visitor_id,
          started_at: c.started_at,
          message_count: c.messages?.length ?? 0,
          duration_min,
          preview: firstUserMsg?.content?.slice(0, 80) || t('conversations.noMessages'),
        };
      }
    );
    setConversations(rows);
    setLoading(false);
  }, [workspaceId, supabase, page, dateRange, searchDebounced, t]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load messages when expanding a conversation
  const handleExpand = useCallback(async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    setMessagesLoading(true);
    const { data } = await supabase
      .from("messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", id)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });
    setExpandedMessages((data as ChatMessage[]) ?? []);
    setMessagesLoading(false);
  }, [expandedId, supabase]);

  const handleExportCsv = useCallback(async () => {
    setExporting(true);
    try {
      const dateFrom = getDateFrom(dateRange);
      let query = supabase
        .from("conversations")
        .select("id, visitor_id, status, started_at, messages(id, content, role, created_at)")
        .eq("workspace_id", workspaceId)
        .is("deleted_at", null)
        .order("started_at", { ascending: false });

      if (dateFrom) query = query.gte("started_at", dateFrom);

      const { data } = await query;
      const rows = (data ?? []).map(
        (c: { id: string; visitor_id: string; status: string; started_at: string; messages: { id: string; content: string; role: string; created_at: string }[] }) => {
          const firstUserMsg = c.messages?.find((m) => m.role === "user");
          return {
            date: new Date(c.started_at).toLocaleString(dateLocale),
            visitor_id: c.visitor_id,
            status: c.status,
            message_count: c.messages?.length ?? 0,
            first_message: firstUserMsg?.content?.slice(0, 200) ?? "",
          };
        }
      );

      const headers = [
        language === "nb" ? "Dato" : "Date",
        language === "nb" ? "Besøkende" : "Visitor",
        "Status",
        language === "nb" ? "Antall meldinger" : "Message count",
        language === "nb" ? "Første melding" : "First message",
      ];
      const csvContent = [
        headers.join(","),
        ...rows.map((r) =>
          [
            `"${r.date}"`,
            `"${r.visitor_id}"`,
            `"${r.status}"`,
            r.message_count,
            `"${r.first_message.replace(/"/g, '""').replace(/\n/g, " ")}"`,
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `conversations-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }, [workspaceId, supabase, dateRange, dateLocale, language]);

  const handleDelete = useCallback(async (id: string) => {
    setDeleting(true);
    const res = await fetch("/api/conversations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: id }),
    });
    if (res.ok) {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      setTotalCount((prev) => prev - 1);
      if (expandedId === id) setExpandedId(null);
    }
    setDeleting(false);
    setConfirmDeleteId(null);
  }, [expandedId]);

  const totalPages = useMemo(() => Math.ceil(totalCount / PAGE_SIZE), [totalCount]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('conversations.title')}</h1>
        <p className="mt-1 text-muted-foreground">
          {t('conversations.description')}
        </p>
      </div>

      {/* Search + Export */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('conversations.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="default"
          className="shrink-0"
          onClick={handleExportCsv}
          disabled={exporting}
        >
          <Download className="mr-2 h-4 w-4" />
          {exporting ? t('conversations.exporting') : t('conversations.exportCsv')}
        </Button>
      </div>

      {/* Date filter */}
      <div className="flex flex-wrap gap-2">
        {DATE_KEYS.map((opt) => (
          <Button
            key={opt.key}
            variant={dateRange === opt.key ? "default" : "outline"}
            size="sm"
            onClick={() => setDateRange(opt.key)}
          >
            {t(opt.tKey)}
          </Button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3 animate-scroll-fade">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[72px] rounded-xl border bg-muted/30 animate-shimmer"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={t('conversations.empty')}
          description={t('conversations.emptyDescription')}
          hint={t('hint.conversations')}
        />
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => (
            <div key={conv.id} className="group relative">
              {confirmDeleteId === conv.id ? (
                <div className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm">
                  <p className="text-sm text-muted-foreground">{t('inbox.confirmDelete')}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={deleting}
                      onClick={() => handleDelete(conv.id)}
                    >
                      {deleting ? t('common.loading') : t('common.delete')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirmDeleteId(null)}
                    >
                      {t('common.cancel')}
                    </Button>
                  </div>
                </div>
              ) : (
              <>
              <button
                onClick={() => handleExpand(conv.id)}
                className="flex w-full items-center gap-4 rounded-xl border bg-card p-4 text-left shadow-sm transition-all duration-200 hover:shadow-md hover:bg-muted/30"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">
                      {conv.preview}
                    </p>
                    <Badge variant="secondary" className="shrink-0">
                      {conv.message_count} {t('conversations.msgBadge')}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(conv.started_at).toLocaleString(dateLocale, {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {conv.duration_min != null && (
                      <span>
                        {conv.duration_min < 60
                          ? `${conv.duration_min} ${t('conversations.minutes')}`
                          : `${Math.round(conv.duration_min / 60)} ${t('conversations.hours')}`}
                      </span>
                    )}
                  </div>
                </div>
                {expandedId === conv.id ? (
                  <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
                )}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(conv.id); }}
                className="absolute right-12 top-4 rounded-md p-1.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30"
                aria-label={t('common.delete')}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </button>
              </>
              )}

              {/* Expanded messages */}
              {expandedId === conv.id && (
                <div className="mt-1 rounded-xl border bg-card p-4 shadow-sm animate-scroll-fade">
                  {messagesLoading ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {t('conversations.loadingMessages')}
                    </p>
                  ) : expandedMessages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {t('conversations.noMessagesInConv')}
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {expandedMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex gap-3",
                            msg.role === "user" ? "justify-end" : "justify-start"
                          )}
                        >
                          {msg.role === "assistant" && (
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <Bot className="h-3.5 w-3.5" />
                            </div>
                          )}
                          <div
                            className={cn(
                              "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                              msg.role === "user"
                                ? "rounded-br-md bg-primary text-white"
                                : "rounded-bl-md bg-muted"
                            )}
                          >
                            {msg.content}
                            <p
                              className={cn(
                                "mt-1 text-[10px]",
                                msg.role === "user"
                                  ? "text-white/60"
                                  : "text-muted-foreground"
                              )}
                            >
                              {new Date(msg.created_at).toLocaleTimeString(dateLocale, {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          {msg.role === "user" && (
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                              <User className="h-3.5 w-3.5" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
            {t('conversations.previous')}
          </Button>
          <span className="text-sm text-muted-foreground">
            {t('conversations.pageOf', { page: page + 1, total: totalPages })}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            {t('conversations.next')}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
