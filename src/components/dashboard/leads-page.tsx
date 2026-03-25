"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useWorkspace } from "@/contexts/workspace-context";
import { createClient } from "@/lib/supabase/client";
import type { Lead, LeadStatus, ChatMessage } from "@/lib/types";
import { LEAD_STATUS_LABEL } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./empty-state";
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

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "nå";
  if (minutes < 60) return `${minutes} min siden`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "time" : "timer"} siden`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ${days === 1 ? "dag" : "dager"} siden`;
  const months = Math.floor(days / 30);
  return `${months} ${months === 1 ? "måned" : "måneder"} siden`;
}

export function LeadsPageClient(): React.ReactNode {
  const { id: workspaceId } = useWorkspace();
  const supabase = createClient();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<LeadStatus>("new");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data } = await supabase
        .from("leads")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });
      if (!cancelled) {
        setLeads(data ?? []);
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
      await supabase.from("leads").update({ status }).eq("id", id);
    },
    [supabase]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Er du sikker på at du vil slette denne leaden?")) return;
      setLeads((prev) => prev.filter((l) => l.id !== id));
      setExpandedId((prev) => (prev === id ? null : prev));
      await supabase.from("leads").delete().eq("id", id);
    },
    [supabase]
  );

  const handleSaveNotes = useCallback(
    async (id: string, notes: string) => {
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, notes: notes || null } : l))
      );
      await supabase.from("leads").update({ notes: notes || null }).eq("id", id);
    },
    [supabase]
  );

  const toggleExpand = useCallback(
    async (lead: Lead) => {
      if (expandedId === lead.id) {
        setExpandedId(null);
        setMessages([]);
        return;
      }
      setExpandedId(lead.id);
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
    [expandedId, supabase]
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

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    resolved: leads.filter((l) => l.status === "resolved").length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="mt-1 text-muted-foreground">
            Håndter kundehenvendelser fra chatboten.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
        <p className="mt-1 text-muted-foreground">
          Håndter kundehenvendelser fra chatboten.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard icon={Users} label="Totalt" value={stats.total} />
        <StatCard icon={UserPlus} label="Nye" value={stats.new} className="text-blue-600 dark:text-blue-400" />
        <StatCard icon={CheckCircle2} label="Kontaktet" value={stats.contacted} className="text-yellow-600 dark:text-yellow-400" />
        <StatCard icon={Check} label="Løst" value={stats.resolved} className="text-green-600 dark:text-green-400" />
      </div>

      {leads.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="Ingen leads ennå"
          description="Leads vil dukke opp her når besøkende ber om å snakke med et menneske."
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
                  {LEAD_STATUS_LABEL[status]}
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
                expandedId={expandedId}
                messages={messages}
                loadingMessages={loadingMessages}
                notesValue={notesValue}
                setNotesValue={setNotesValue}
                onToggleExpand={toggleExpand}
                onSaveNotes={handleSaveNotes}
                onDelete={handleDelete}
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
                    expandedId={expandedId}
                    messages={messages}
                    loadingMessages={loadingMessages}
                    notesValue={notesValue}
                    setNotesValue={setNotesValue}
                    onToggleExpand={toggleExpand}
                    onSaveNotes={handleSaveNotes}
                    onDelete={handleDelete}
                    isOver={activeId !== null}
                  />
                ))}
              </div>
              <DragOverlay>
                {activeLead ? <LeadCardOverlay lead={activeLead} /> : null}
              </DragOverlay>
            </DndContext>
          </div>
        </>
      )}
    </div>
  );
}

/* ───── Kanban column ───── */

function KanbanColumn({
  status,
  leads,
  expandedId,
  messages,
  loadingMessages,
  notesValue,
  setNotesValue,
  onToggleExpand,
  onSaveNotes,
  onDelete,
  isOver: parentDragging,
}: {
  status: LeadStatus;
  leads: Lead[];
  expandedId: string | null;
  messages: ChatMessage[];
  loadingMessages: boolean;
  notesValue: string;
  setNotesValue: (v: string) => void;
  onToggleExpand: (lead: Lead) => void;
  onSaveNotes: (id: string, notes: string) => void;
  onDelete: (id: string) => void;
  isOver: boolean;
}): React.ReactNode {
  const { setNodeRef, isOver } = useDroppable({ id: status });

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
        <span className="text-sm font-semibold">{LEAD_STATUS_LABEL[status]}</span>
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
            isExpanded={expandedId === lead.id}
            messages={messages}
            loadingMessages={loadingMessages}
            notesValue={notesValue}
            setNotesValue={setNotesValue}
            onToggleExpand={onToggleExpand}
            onSaveNotes={onSaveNotes}
            onDelete={onDelete}
          />
        ))}
        {leads.length === 0 && (
          <p className="py-8 text-center text-xs text-muted-foreground">
            Ingen leads
          </p>
        )}
      </div>
    </div>
  );
}

/* ───── Draggable lead card ───── */

function LeadCard({
  lead,
  isExpanded,
  messages,
  loadingMessages,
  notesValue,
  setNotesValue,
  onToggleExpand,
  onSaveNotes,
  onDelete,
}: {
  lead: Lead;
  isExpanded: boolean;
  messages: ChatMessage[];
  loadingMessages: boolean;
  notesValue: string;
  setNotesValue: (v: string) => void;
  onToggleExpand: (lead: Lead) => void;
  onSaveNotes: (id: string, notes: string) => void;
  onDelete: (id: string) => void;
}): React.ReactNode {
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
        onClick={() => onToggleExpand(lead)}
      >
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 shrink-0 cursor-grab touch-none rounded p-0.5 text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted transition-colors"
          onClick={(e) => e.stopPropagation()}
          aria-label="Dra for å flytte"
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
            {timeAgo(lead.created_at)}
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="border-t px-3 pb-3 pt-2 space-y-3">
          {/* Notes */}
          <NotesSection
            lead={lead}
            notesValue={notesValue}
            setNotesValue={setNotesValue}
            onSaveNotes={onSaveNotes}
          />

          {/* Conversation */}
          {lead.conversation_id && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Samtalehistorikk</span>
              </div>
              {loadingMessages ? (
                <p className="text-sm text-muted-foreground">Laster...</p>
              ) : messages.length === 0 ? (
                <p className="text-sm text-muted-foreground">Ingen meldinger funnet.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto rounded-lg border bg-background p-2">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-2",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.role === "assistant" && (
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Bot className="h-2.5 w-2.5" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[80%] rounded-xl px-2.5 py-1 text-[11px] leading-relaxed",
                          msg.role === "user"
                            ? "rounded-br-sm bg-primary text-white"
                            : "rounded-bl-sm bg-muted"
                        )}
                      >
                        {msg.content}
                      </div>
                      {msg.role === "user" && (
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                          <User className="h-2.5 w-2.5" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Delete */}
          <div className="flex justify-end pt-1">
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs h-7"
              onClick={() => onDelete(lead.id)}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Slett
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───── Notes section with auto-save on blur ───── */

function NotesSection({
  lead,
  notesValue,
  setNotesValue,
  onSaveNotes,
}: {
  lead: Lead;
  notesValue: string;
  setNotesValue: (v: string) => void;
  onSaveNotes: (id: string, notes: string) => void;
}): React.ReactNode {
  const [editing, setEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function startEditing() {
    setNotesValue(lead.notes || "");
    setEditing(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  function handleBlur() {
    setEditing(false);
    if (notesValue !== (lead.notes || "")) {
      onSaveNotes(lead.id, notesValue);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Notater</span>
      </div>
      {editing ? (
        <textarea
          ref={textareaRef}
          value={notesValue}
          onChange={(e) => setNotesValue(e.target.value)}
          onBlur={handleBlur}
          placeholder="Legg til notater..."
          className="w-full rounded-lg border bg-background px-3 py-2 text-xs outline-none resize-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
          rows={2}
        />
      ) : (
        <button
          onClick={startEditing}
          className="w-full text-left rounded-lg border border-dashed p-2 text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          {lead.notes || "Klikk for å legge til notater..."}
        </button>
      )}
    </div>
  );
}

/* ───── Drag overlay card ───── */

function LeadCardOverlay({ lead }: { lead: Lead }): React.ReactNode {
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
            {timeAgo(lead.created_at)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───── Stat card ───── */

function StatCard({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  className?: string;
}): React.ReactNode {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className={cn("h-4 w-4", className)} />
        {label}
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
