"use client";

import { useState, useEffect, useCallback } from "react";
import { useWorkspace } from "@/contexts/workspace-context";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "./empty-state";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";

type DateRange = "today" | "week" | "2weeks" | "month" | "3months" | "all";

const DATE_OPTIONS: { key: DateRange; label: string }[] = [
  { key: "today", label: "I dag" },
  { key: "week", label: "Siste uke" },
  { key: "2weeks", label: "Siste 2 uker" },
  { key: "month", label: "Siste måned" },
  { key: "3months", label: "Siste 3 mnd" },
  { key: "all", label: "Alle" },
];

const PAGE_SIZE = 20;

interface ConversationRow {
  id: string;
  visitor_id: string;
  preview: string;
  started_at: string;
  message_count: number;
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
  const supabase = createClient();

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

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchDebounced(search);
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
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

    // Build count query
    let countQuery = supabase
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId);

    if (dateFrom) {
      countQuery = countQuery.gte("started_at", dateFrom);
    }
    if (searchDebounced) {
      // Search by message content: find conversation IDs that have matching messages
      const { data: matchingConvos } = await supabase
        .from("messages")
        .select("conversation_id")
        .ilike("content", `%${searchDebounced}%`);
      const convIds = [...new Set((matchingConvos ?? []).map((m: { conversation_id: string }) => m.conversation_id))];
      if (convIds.length === 0) {
        setConversations([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }
      countQuery = countQuery.in("id", convIds);
    }

    // Build data query
    let dataQuery = supabase
      .from("conversations")
      .select("id, visitor_id, started_at, messages(id, content, role)")
      .eq("workspace_id", workspaceId)
      .order("started_at", { ascending: false })
      .range(from, to);

    if (dateFrom) {
      dataQuery = dataQuery.gte("started_at", dateFrom);
    }
    if (searchDebounced) {
      const { data: matchingConvos2 } = await supabase
        .from("messages")
        .select("conversation_id")
        .ilike("content", `%${searchDebounced}%`);
      const convIds2 = [...new Set((matchingConvos2 ?? []).map((m: { conversation_id: string }) => m.conversation_id))];
      if (convIds2.length === 0) {
        setConversations([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }
      dataQuery = dataQuery.in("id", convIds2);
    }

    const [countResult, dataResult] = await Promise.all([countQuery, dataQuery]);

    setTotalCount(countResult.count ?? 0);
    const rows: ConversationRow[] = (dataResult.data ?? []).map(
      (c: { id: string; visitor_id: string; started_at: string; messages: { id: string; content: string; role: string }[] }) => {
        const firstUserMsg = c.messages?.find((m) => m.role === "user");
        return {
          id: c.id,
          visitor_id: c.visitor_id,
          started_at: c.started_at,
          message_count: c.messages?.length ?? 0,
          preview: firstUserMsg?.content?.slice(0, 80) || "Ingen meldinger",
        };
      }
    );
    setConversations(rows);
    setLoading(false);
  }, [workspaceId, supabase, page, dateRange, searchDebounced]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load messages when expanding a conversation
  async function handleExpand(id: string) {
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
      .order("created_at", { ascending: true });
    setExpandedMessages((data as ChatMessage[]) ?? []);
    setMessagesLoading(false);
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Samtaler</h1>
        <p className="mt-1 text-muted-foreground">
          Se samtaleloggen fra chatboten din.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Søk i meldinger..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Date filter */}
      <div className="flex flex-wrap gap-2">
        {DATE_OPTIONS.map(({ key, label }) => (
          <Button
            key={key}
            variant={dateRange === key ? "default" : "outline"}
            size="sm"
            onClick={() => setDateRange(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[72px] animate-pulse rounded-xl border bg-muted/30"
            />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Ingen samtaler funnet"
          description="Ingen samtaler matcher søket eller filteret ditt."
        />
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => (
            <div key={conv.id}>
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
                      {conv.message_count} msg
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(conv.started_at).toLocaleString("nb-NO", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                {expandedId === conv.id ? (
                  <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
                )}
              </button>

              {/* Expanded messages */}
              {expandedId === conv.id && (
                <div className="mt-1 rounded-xl border bg-card p-4 shadow-sm">
                  {messagesLoading ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Laster meldinger...
                    </p>
                  ) : expandedMessages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Ingen meldinger i denne samtalen.
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
                              {new Date(msg.created_at).toLocaleTimeString("nb-NO", {
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
            Forrige
          </Button>
          <span className="text-sm text-muted-foreground">
            Side {page + 1} av {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Neste
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
