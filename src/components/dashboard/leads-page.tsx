"use client";

import { useState, useEffect } from "react";
import { useWorkspace } from "@/contexts/workspace-context";
import { createClient } from "@/lib/supabase/client";
import type { Lead, LeadStatus, ChatMessage } from "@/lib/types";
import { LEAD_STATUS_LABEL, LEAD_STATUS_VARIANT } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./empty-state";
import {
  UserPlus,
  Mail,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  User,
  Bot,
  StickyNote,
  Check,
  Users,
  CheckCircle2,
  Archive,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function LeadsPageClient(): React.ReactNode {
  const { id: workspaceId } = useWorkspace();
  const supabase = createClient();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState("");

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

  async function handleStatusChange(id: string, status: LeadStatus) {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l))
    );
    await supabase.from("leads").update({ status }).eq("id", id);
  }

  async function handleDelete(id: string) {
    if (!confirm("Er du sikker på at du vil slette denne leaden?")) return;
    setLeads((prev) => prev.filter((l) => l.id !== id));
    await supabase.from("leads").delete().eq("id", id);
  }

  async function handleSaveNotes(id: string) {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, notes: notesValue || null } : l))
    );
    setEditingNotes(null);
    await supabase.from("leads").update({ notes: notesValue || null }).eq("id", id);
  }

  async function toggleExpand(lead: Lead) {
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
  }

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

      {/* Leads list */}
      {leads.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="Ingen leads ennå"
          description="Leads vil dukke opp her når besøkende ber om å snakke med et menneske."
        />
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="rounded-xl border bg-card shadow-sm transition-all duration-200 hover:shadow-md"
            >
              {/* Lead row */}
              <div className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{lead.email}</p>
                    {lead.name && (
                      <span className="text-sm text-muted-foreground truncate">
                        ({lead.name})
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(lead.created_at).toLocaleString("nb-NO", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusDropdown
                    status={lead.status}
                    onChange={(s) => handleStatusChange(lead.id, s)}
                  />
                  <button
                    onClick={() => toggleExpand(lead)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"
                    aria-label="Vis detaljer"
                  >
                    {expandedId === lead.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(lead.id)}
                    className="rounded-lg p-1.5 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
                    aria-label="Slett"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Expanded detail */}
              {expandedId === lead.id && (
                <div className="border-t px-4 pb-4 pt-3 space-y-4">
                  {/* Notes */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">Notater</span>
                    </div>
                    {editingNotes === lead.id ? (
                      <div className="flex gap-2">
                        <textarea
                          value={notesValue}
                          onChange={(e) => setNotesValue(e.target.value)}
                          placeholder="Legg til notater..."
                          className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none resize-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                          rows={2}
                        />
                        <div className="flex flex-col gap-1">
                          <Button size="sm" onClick={() => handleSaveNotes(lead.id)}>
                            Lagre
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingNotes(null)}>
                            Avbryt
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingNotes(lead.id);
                          setNotesValue(lead.notes || "");
                        }}
                        className="w-full text-left rounded-lg border border-dashed p-2 text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
                      >
                        {lead.notes || "Klikk for å legge til notater..."}
                      </button>
                    )}
                  </div>

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
                        <div className="space-y-2 max-h-64 overflow-y-auto rounded-lg border bg-background p-3">
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
                                  "max-w-[75%] rounded-xl px-3 py-1.5 text-xs leading-relaxed",
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
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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

const STATUSES: LeadStatus[] = ["new", "contacted", "resolved", "archived"];

function StatusDropdown({
  status,
  onChange,
}: {
  status: LeadStatus;
  onChange: (s: LeadStatus) => void;
}): React.ReactNode {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center"
      >
        <Badge variant={LEAD_STATUS_VARIANT[status]} className="cursor-pointer">
          {LEAD_STATUS_LABEL[status]}
          <ChevronDown className="ml-1 h-3 w-3" />
        </Badge>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-lg border bg-card p-1 shadow-lg">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => {
                  onChange(s);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
                  s === status && "font-medium text-primary"
                )}
              >
                {s === status && <Check className="mr-1.5 h-3 w-3" />}
                <span className={s !== status ? "ml-[18px]" : ""}>{LEAD_STATUS_LABEL[s]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
