"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { useWorkspace } from "@/contexts/workspace-context";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/context";
import type { Lead, LeadStatus, ChatMessage } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./empty-state";
import { UpgradeBanner } from "./upgrade-banner";
import { hasFeature } from "@/lib/plans";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  UserPlus,
  Mail,
  Clock,
  Trash2,
  MessageSquare,
  User,
  Bot,
  StickyNote,
  Check,
  Users,
  CheckCircle2,
  Archive,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TranslateFunction } from "@/lib/i18n";

const PAGE_SIZE = 50;
const COLUMNS: LeadStatus[] = ["new", "contacted", "resolved", "archived"];

const COLUMN_COLORS: Record<LeadStatus, string> = {
  new: "border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30",
  contacted: "border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/30",
  resolved: "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/30",
  archived: "border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-950/30",
};

const COLUMN_BADGE_COLORS: Record<LeadStatus, string> = {
  new: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  contacted: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  resolved: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  archived: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const DROP_INDICATOR_COLORS: Record<LeadStatus, string> = {
  new: "border-blue-400 dark:border-blue-500",
  contacted: "border-yellow-400 dark:border-yellow-500",
  resolved: "border-green-400 dark:border-green-500",
  archived: "border-gray-400 dark:border-gray-500",
};

function timeAgo(dateStr: string, t: TranslateFunction): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return t('leads.time.now');
  if (minutes < 60) return t('leads.time.minAgo', { n: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? t('leads.time.hourAgo', { n: hours }) : t('leads.time.hoursAgo', { n: hours });
  const days = Math.floor(hours / 24);
  if (days < 30) return days === 1 ? t('leads.time.dayAgo', { n: days }) : t('leads.time.daysAgo', { n: days });
  const months = Math.floor(days / 30);
  return months === 1 ? t('leads.time.monthAgo', { n: months }) : t('leads.time.monthsAgo', { n: months });
}

function formatDate(dateStr: string, locale: string): string {
  return new Date(dateStr).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LeadsPageClient(): React.ReactNode {
  const workspace = useWorkspace();
  const { id: workspaceId } = workspace;
  const supabase = createClient();
  const { t, language } = useLanguage();
  const dateLocale = language === 'nb' ? 'nb-NO' : 'en-US';
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<LeadStatus>("new");

  const statusLabel = (status: LeadStatus) => t(`leads.status${status.charAt(0).toUpperCase()}${status.slice(1)}`);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      // Delete archived leads older than 30 days from DB
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      await supabase
        .from("leads")
        .delete()
        .eq("workspace_id", workspaceId)
        .eq("status", "archived")
        .lt("created_at", thirtyDaysAgo.toISOString());

      const { data } = await supabase
        .from("leads")
        .select("id, workspace_id, email, name, status, notes, created_at, conversation_id")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);
      if (!cancelled) {
        // Client-side filter as safety net
        const cutoff = thirtyDaysAgo.getTime();
        const filtered = (data ?? []).filter(
          (l) =>
            l.status !== "archived" ||
            new Date(l.created_at).getTime() > cutoff
        );
        setLeads(filtered);
        setHasMore((data ?? []).length === PAGE_SIZE);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [workspaceId, supabase]);

  const handleStatusChange = useCallback(
    async (id: string, status: LeadStatus) => {
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status } : l))
      );
      setSelectedLead((prev) => (prev?.id === id ? { ...prev, status } : prev));
      await supabase.from("leads").update({ status }).eq("id", id);
    },
    [supabase]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm(t('leads.confirmDelete'))) return;
      setLeads((prev) => prev.filter((l) => l.id !== id));
      setSelectedLead(null);
      await supabase.from("leads").delete().eq("id", id);
    },
    [supabase, t]
  );

  const handleSaveNotes = useCallback(
    async (id: string, notes: string) => {
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, notes: notes || null } : l))
      );
      setSelectedLead((prev) =>
        prev?.id === id ? { ...prev, notes: notes || null } : prev
      );
      await supabase.from("leads").update({ notes: notes || null }).eq("id", id);
    },
    [supabase]
  );

  const openLeadDetail = useCallback(
    async (lead: Lead) => {
      setSelectedLead(lead);
      setNotesValue(lead.notes || "");
      setMessages([]);
      if (lead.conversation_id) {
        setLoadingMessages(true);
        const { data } = await supabase
          .from("messages")
          .select("id, role, content, created_at")
          .eq("conversation_id", lead.conversation_id)
          .order("created_at", { ascending: true });
        setMessages((data as ChatMessage[]) ?? []);
        setLoadingMessages(false);
      }
    },
    [supabase]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const leadId = active.id as string;
    const newStatus = over.id as LeadStatus;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === newStatus) return;
    handleStatusChange(leadId, newStatus);
  }

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;

  const [stats, setStats] = useState({ total: 0, new: 0, contacted: 0, resolved: 0 });

  // Fetch stats from count queries
  useEffect(() => {
    let cancelled = false;
    async function fetchStats() {
      const [totalRes, newRes, contactedRes, resolvedRes] = await Promise.all([
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId),
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("status", "new"),
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("status", "contacted"),
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("status", "resolved"),
      ]);
      if (!cancelled) {
        setStats({
          total: totalRes.count ?? 0,
          new: newRes.count ?? 0,
          contacted: contactedRes.count ?? 0,
          resolved: resolvedRes.count ?? 0,
        });
      }
    }
    fetchStats();
    return () => { cancelled = true; };
  }, [workspaceId, supabase, leads]);

  const handleLoadMore = useCallback(async () => {
    setLoadingMore(true);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const { data } = await supabase
      .from("leads")
      .select("id, workspace_id, email, name, status, notes, created_at, conversation_id")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .range(leads.length, leads.length + PAGE_SIZE - 1);

    const cutoff = thirtyDaysAgo.getTime();
    const filtered = (data ?? []).filter(
      (l) => l.status !== "archived" || new Date(l.created_at).getTime() > cutoff
    );
    setLeads((prev) => [...prev, ...filtered]);
    setHasMore((data ?? []).length === PAGE_SIZE);
    setLoadingMore(false);
  }, [workspaceId, supabase, leads.length]);

  const hasLeadsFeature = hasFeature(workspace.plan_id, "leads");

  if (!hasLeadsFeature) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('leads.title')}</h1>
          <p className="mt-1 text-muted-foreground">
            {t('leads.description')}
          </p>
        </div>
        <UpgradeBanner feature="leads" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('leads.title')}</h1>
          <p className="mt-1 text-muted-foreground">
            {t('leads.description')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('leads.title')}</h1>
        <p className="mt-1 text-muted-foreground">
          {t('leads.description')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard icon={Users} label={t('leads.total')} value={stats.total} />
        <StatCard icon={UserPlus} label={t('leads.new')} value={stats.new} className="text-blue-600 dark:text-blue-400" />
        <StatCard icon={CheckCircle2} label={t('leads.contacted')} value={stats.contacted} className="text-yellow-600 dark:text-yellow-400" />
        <StatCard icon={Check} label={t('leads.resolved')} value={stats.resolved} className="text-green-600 dark:text-green-400" />
      </div>

      {leads.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title={t('leads.empty')}
          description={t('leads.emptyDescription')}
        />
      ) : (
        <>
          {/* Mobile tabs */}
          <div className="flex gap-1 overflow-x-auto rounded-lg border bg-muted/50 p-1 md:hidden">
            {COLUMNS.map((status) => {
              const count = leads.filter((l) => l.status === status).length;
              return (
                <button
                  key={status}
                  onClick={() => setActiveTab(status)}
                  className={cn(
                    "flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    activeTab === status
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {statusLabel(status)}
                  {count > 0 && (
                    <span className={cn("ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs", COLUMN_BADGE_COLORS[status])}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile: single column view */}
          <div className="md:hidden">
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <KanbanColumn
                status={activeTab}
                leads={leads.filter((l) => l.status === activeTab)}
                onClickLead={openLeadDetail}
                isOver={false}
              />
              <DragOverlay>
                {activeLead ? <LeadCardOverlay lead={activeLead} /> : null}
              </DragOverlay>
            </DndContext>
          </div>

          {/* Desktop: full Kanban board */}
          <div className="hidden md:block">
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-4 gap-4">
                {COLUMNS.map((status) => (
                  <KanbanColumn
                    key={status}
                    status={status}
                    leads={leads.filter((l) => l.status === status)}
                    onClickLead={openLeadDetail}
                    isOver={activeId !== null}
                  />
                ))}
              </div>
              <DragOverlay>
                {activeLead ? <LeadCardOverlay lead={activeLead} /> : null}
              </DragOverlay>
            </DndContext>
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? t('common.loading') : t('leads.loadMore')}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Lead detail dialog */}
      <Dialog
        open={selectedLead !== null}
        onOpenChange={(open) => {
          if (!open) {
            // Auto-save notes on close
            if (selectedLead && notesValue !== (selectedLead.notes || "")) {
              handleSaveNotes(selectedLead.id, notesValue);
            }
            setSelectedLead(null);
          }
        }}
      >
        {selectedLead && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <DialogTitle>{selectedLead.email}</DialogTitle>
                <Badge className={cn("text-[10px]", COLUMN_BADGE_COLORS[selectedLead.status])}>
                  {statusLabel(selectedLead.status)}
                </Badge>
              </div>
              {selectedLead.name && (
                <DialogDescription>{selectedLead.name}</DialogDescription>
              )}
            </DialogHeader>

            <div className="space-y-4">
              {/* Created date */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {t('leads.created')} {formatDate(selectedLead.created_at, dateLocale)}
              </div>

              {/* Notes */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">{t('leads.notes')}</span>
                </div>
                <textarea
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  onBlur={() => {
                    if (notesValue !== (selectedLead.notes || "")) {
                      handleSaveNotes(selectedLead.id, notesValue);
                    }
                  }}
                  placeholder={t('leads.addNotes')}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none resize-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                  rows={3}
                />
              </div>

              {/* Conversation history */}
              {selectedLead.conversation_id && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">{t('leads.conversationHistory')}</span>
                  </div>
                  {loadingMessages ? (
                    <p className="text-sm text-muted-foreground">{t('leads.loading')}</p>
                  ) : messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t('leads.noMessagesFound')}</p>
                  ) : (
                    <div className="space-y-2 max-h-[50vh] overflow-y-auto rounded-lg border bg-background p-3">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex gap-2",
                            msg.role === "user" ? "justify-end" : "justify-start"
                          )}
                        >
                          {msg.role === "assistant" && (
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <Bot className="h-3 w-3" />
                            </div>
                          )}
                          <div
                            className={cn(
                              "max-w-[80%] rounded-xl px-3 py-1.5 text-xs leading-relaxed",
                              msg.role === "user"
                                ? "rounded-br-sm bg-primary text-white"
                                : "rounded-bl-sm bg-muted"
                            )}
                          >
                            {msg.content}
                          </div>
                          {msg.role === "user" && (
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                              <User className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <div className="flex w-full flex-wrap items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
                  onClick={() => handleDelete(selectedLead.id)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  {t('leads.delete')}
                </Button>
                <div className="flex flex-wrap gap-1.5">
                  {COLUMNS.filter((s) => s !== selectedLead.status).map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => handleStatusChange(selectedLead.id, status)}
                    >
                      {statusLabel(status)}
                    </Button>
                  ))}
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

/* ───── Kanban column ───── */

function KanbanColumn({
  status,
  leads,
  onClickLead,
  isOver: parentDragging,
}: {
  status: LeadStatus;
  leads: Lead[];
  onClickLead: (lead: Lead) => void;
  isOver: boolean;
}): React.ReactNode {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const { t } = useLanguage();
  const statusLabel = (s: LeadStatus) => t(`leads.status${s.charAt(0).toUpperCase()}${s.slice(1)}`);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-xl border-2 transition-colors min-h-[200px]",
        COLUMN_COLORS[status],
        parentDragging && isOver && DROP_INDICATOR_COLORS[status],
        !isOver && "border-transparent"
      )}
    >
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-xl px-3 py-2.5 backdrop-blur-sm">
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{statusLabel(status)}</span>
          {status === "archived" && (
            <span className="text-[10px] text-muted-foreground">{t('leads.archivedNote')}</span>
          )}
        </div>
        <span className={cn("inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-medium", COLUMN_BADGE_COLORS[status])}>
          {leads.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 p-2 pt-0">
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onClickLead={onClickLead}
          />
        ))}
        {leads.length === 0 && (
          <p className="py-8 text-center text-xs text-muted-foreground">
            {t('leads.noLeads')}
          </p>
        )}
      </div>
    </div>
  );
}

/* ───── Draggable lead card ───── */

const LeadCard = memo(function LeadCard({
  lead,
  onClickLead,
}: {
  lead: Lead;
  onClickLead: (lead: Lead) => void;
}) {
  const { t } = useLanguage();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border bg-card shadow-sm transition-all duration-200",
        isDragging && "opacity-30",
        !isDragging && "hover:shadow-md hover:-translate-y-0.5"
      )}
    >
      <div
        className="flex items-start gap-2 p-3 cursor-pointer"
        onClick={() => onClickLead(lead)}
      >
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 shrink-0 cursor-grab touch-none rounded p-0.5 text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted transition-colors"
          onClick={(e) => e.stopPropagation()}
          aria-label={t('leads.dragToMove')}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{lead.email}</p>
          {lead.name && (
            <p className="text-xs text-muted-foreground truncate">{lead.name}</p>
          )}
          <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            {timeAgo(lead.created_at, t)}
          </div>
        </div>
      </div>
    </div>
  );
});

/* ───── Drag overlay card ───── */

function LeadCardOverlay({ lead }: { lead: Lead }): React.ReactNode {
  const { t } = useLanguage();
  return (
    <div className="w-[260px] rounded-lg border bg-card shadow-xl rotate-2 scale-105">
      <div className="flex items-start gap-2 p-3">
        <div className="mt-0.5 shrink-0 rounded p-0.5 text-muted-foreground/40">
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{lead.email}</p>
          {lead.name && (
            <p className="text-xs text-muted-foreground truncate">{lead.name}</p>
          )}
          <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            {timeAgo(lead.created_at, t)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───── Stat card ───── */

const StatCard = memo(function StatCard({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className={cn("h-4 w-4", className)} />
        {label}
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
});
