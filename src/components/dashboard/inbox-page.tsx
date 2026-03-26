"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useWorkspace } from "@/contexts/workspace-context";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageCircle,
  Send,
  Check,
  X,
  ArrowLeft,
  ArrowRightLeft,
  StickyNote,
  Slash,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InboxConversation {
  id: string;
  visitor_id: string;
  status: string;
  started_at: string;
  assigned_to: string | null;
  first_message?: string;
}

interface InboxMessage {
  id: string;
  role: string;
  content: string;
  created_at: string;
  metadata?: { internal_note?: boolean } | null;
}

interface OnlineAgent {
  user_id: string;
  name?: string;
  email?: string;
}

interface CannedResponse {
  id: string;
  shortcut: string;
  title: string;
  content: string;
}

// Generate a simple notification tone using Web Audio API
function playNotificationSound(): void {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // Audio not supported
  }
}

export function InboxPageClient(): React.ReactNode {
  const workspace = useWorkspace();
  const supabase = createClient();
  const { t } = useLanguage();

  const [conversations, setConversations] = useState<InboxConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<"waiting" | "human" | "closed">("waiting");
  const [loading, setLoading] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const [showTransfer, setShowTransfer] = useState(false);
  const [onlineAgents, setOnlineAgents] = useState<OnlineAgent[]>([]);
  const [cannedResponses, setCannedResponses] = useState<CannedResponse[]>([]);
  const [showCannedMenu, setShowCannedMenu] = useState(false);
  const [visitorTyping, setVisitorTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const agentTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notifiedConversationsRef = useRef<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled && data.user) setUserId(data.user.id);
    });
    return () => { cancelled = true; };
  }, []);

  // Load conversations
  const loadConversations = useCallback(async () => {
    const { data } = await supabase
      .from("conversations")
      .select("id, visitor_id, status, started_at, assigned_to")
      .eq("workspace_id", workspace.id)
      .in("status", filter === "waiting" ? ["waiting"] : filter === "human" ? ["human"] : ["closed"])
      .order("started_at", { ascending: false })
      .limit(100);

    if (data) {
      // Fetch first message for each conversation
      const convIds = data.map((c: InboxConversation) => c.id);
      const { data: firstMessages } = await supabase
        .from("messages")
        .select("conversation_id, content")
        .in("conversation_id", convIds.length > 0 ? convIds : ["_none_"])
        .eq("role", "user")
        .order("created_at", { ascending: true });

      const firstMsgMap = new Map<string, string>();
      if (firstMessages) {
        for (const msg of firstMessages) {
          if (!firstMsgMap.has(msg.conversation_id)) {
            firstMsgMap.set(msg.conversation_id, msg.content);
          }
        }
      }

      setConversations(
        data.map((c: InboxConversation) => ({
          ...c,
          first_message: firstMsgMap.get(c.id) || "",
        }))
      );
    }
    setLoading(false);
  }, [workspace.id, filter]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load canned responses
  useEffect(() => {
    let cancelled = false;
    supabase
      .from("canned_responses")
      .select("id, shortcut, title, content")
      .eq("workspace_id", workspace.id)
      .then(({ data }) => {
        if (!cancelled && data) setCannedResponses(data);
      });
    return () => { cancelled = true; };
  }, [workspace.id]);

  // Realtime subscription for conversations
  useEffect(() => {
    const channel = supabase
      .channel("inbox-conversations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `workspace_id=eq.${workspace.id}`,
        },
        (payload) => {
          const conv = payload.new as InboxConversation | undefined;
          if (payload.eventType === "INSERT" && conv?.status === "waiting") {
            // New waiting conversation
            if (!notifiedConversationsRef.current.has(conv.id)) {
              notifiedConversationsRef.current.add(conv.id);
              playNotificationSound();
            }
            loadConversations();
          } else if (payload.eventType === "UPDATE") {
            loadConversations();
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [workspace.id, loadConversations]);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }

    async function loadMessages() {
      const { data } = await supabase
        .from("messages")
        .select("id, role, content, created_at, metadata")
        .eq("conversation_id", selectedId)
        .order("created_at", { ascending: true });

      if (data) setMessages(data as InboxMessage[]);
    }

    loadMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`inbox-messages-${selectedId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedId}`,
        },
        (payload) => {
          const msg = payload.new as InboxMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      )
      .subscribe();

    // Typing indicator channel
    const typingChannel = supabase
      .channel(`typing-${selectedId}`)
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload?.from === "visitor") {
          setVisitorTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setVisitorTyping(false), 3000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(typingChannel);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [selectedId]);

  // Auto-scroll messages
  useEffect(() => {
    const el = messagesEndRef.current;
    if (el?.parentElement) {
      el.parentElement.scrollTop = el.parentElement.scrollHeight;
    }
  }, [messages, visitorTyping]);

  // Claim a conversation
  async function handleClaim(conversationId: string) {
    if (!userId) return;

    // Optimistic update
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, status: "human", assigned_to: userId } : c
      )
    );

    const serviceRes = await fetch("/api/live-chat/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId }),
    });

    if (!serviceRes.ok) {
      loadConversations();
    }
  }

  // Close a conversation
  async function handleClose(conversationId: string) {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, status: "closed" } : c
      )
    );

    await supabase
      .from("conversations")
      .update({ status: "closed" })
      .eq("id", conversationId);

    // Auto-close: resolve assignment
    await supabase
      .from("agent_assignments")
      .update({ resolved_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .is("resolved_at", null);

    if (selectedId === conversationId) {
      setSelectedId(null);
    }
    loadConversations();
  }

  // Send agent message
  async function handleSend() {
    const text = input.trim();
    if (!text || !selectedId) return;

    // Optimistic
    const tempMsg: InboxMessage = {
      id: `temp-${Date.now()}`,
      role: "agent",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    setInput("");
    setShowCannedMenu(false);

    await fetch("/api/live-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: selectedId,
        content: text,
        role: "agent",
      }),
    });
  }

  // Typing channel ref — avoid creating a new channel on every keystroke
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingChannelIdRef = useRef<string | null>(null);

  // Keep typing channel in sync with selectedId
  useEffect(() => {
    if (typingChannelIdRef.current && typingChannelIdRef.current !== selectedId && typingChannelRef.current) {
      supabase.removeChannel(typingChannelRef.current);
      typingChannelRef.current = null;
      typingChannelIdRef.current = null;
    }
  }, [selectedId]);

  // Send typing indicator
  function sendAgentTyping() {
    if (!selectedId) return;

    // Reuse or create channel for current selectedId
    if (typingChannelIdRef.current !== selectedId || !typingChannelRef.current) {
      if (typingChannelRef.current) {
        supabase.removeChannel(typingChannelRef.current);
      }
      typingChannelRef.current = supabase.channel(`typing-${selectedId}`);
      typingChannelRef.current.subscribe();
      typingChannelIdRef.current = selectedId;
    }

    typingChannelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: { from: "agent" },
    });
    if (agentTypingTimeoutRef.current) clearTimeout(agentTypingTimeoutRef.current);
    agentTypingTimeoutRef.current = setTimeout(() => {
      // auto cleanup
    }, 3000);
  }

  // Add internal note
  async function handleAddNote() {
    const text = noteInput.trim();
    if (!text || !selectedId) return;

    const tempMsg: InboxMessage = {
      id: `note-${Date.now()}`,
      role: "system",
      content: text,
      created_at: new Date().toISOString(),
      metadata: { internal_note: true },
    };
    setMessages((prev) => [...prev, tempMsg]);
    setNoteInput("");

    const serviceClient = createClient();
    await serviceClient
      .from("messages")
      .insert({
        conversation_id: selectedId,
        role: "system",
        content: text,
        metadata: { internal_note: true },
      });
  }

  // Transfer conversation
  async function handleTransfer(targetAgentId: string) {
    if (!selectedId) return;

    // Get agent name
    const agent = onlineAgents.find((a) => a.user_id === targetAgentId);
    const agentName = agent?.name || agent?.email || "agent";

    await supabase
      .from("conversations")
      .update({ assigned_to: targetAgentId })
      .eq("id", selectedId);

    await supabase
      .from("agent_assignments")
      .update({ resolved_at: new Date().toISOString() })
      .eq("conversation_id", selectedId)
      .is("resolved_at", null);

    await supabase
      .from("agent_assignments")
      .insert({ conversation_id: selectedId, agent_id: targetAgentId });

    // System message
    await supabase
      .from("messages")
      .insert({
        conversation_id: selectedId,
        role: "system",
        content: `Samtalen ble overført til ${agentName}`,
      });

    setShowTransfer(false);
    setSelectedId(null);
    loadConversations();
  }

  // Load online agents for transfer (single batch query instead of N+1)
  async function loadOnlineAgents() {
    const { data } = await supabase
      .from("agent_presence")
      .select("user_id")
      .eq("workspace_id", workspace.id)
      .in("status", ["online", "busy"]);

    if (data) {
      const otherAgentIds = data
        .map((item) => item.user_id)
        .filter((id) => id !== userId);

      if (otherAgentIds.length > 0) {
        const { data: members } = await supabase
          .from("members")
          .select("user_id")
          .eq("workspace_id", workspace.id)
          .in("user_id", otherAgentIds);

        const validIds = new Set((members ?? []).map((m) => m.user_id));
        setOnlineAgents(
          otherAgentIds
            .filter((id) => validIds.has(id))
            .map((id) => ({ user_id: id, email: id }))
        );
      } else {
        setOnlineAgents([]);
      }
    }
    setShowTransfer(true);
  }

  // Handle input change with canned response detection
  function handleInputChange(value: string) {
    setInput(value);
    sendAgentTyping();
    if (value === "/") {
      setShowCannedMenu(true);
    } else if (value.startsWith("/") && cannedResponses.length > 0) {
      setShowCannedMenu(true);
    } else {
      setShowCannedMenu(false);
    }
  }

  // Presence heartbeat — keep agent online while dashboard is open
  useEffect(() => {
    if (!userId) return;

    const sendHeartbeat = () => {
      fetch("/api/presence", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: workspace.id, status: "online" }),
      }).catch(() => {});
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 30_000);

    return () => {
      clearInterval(interval);
      // Set offline on unmount
      fetch("/api/presence", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: workspace.id, status: "offline" }),
      }).catch(() => {});
    };
  }, [workspace.id, userId]);

  const selectedConv = conversations.find((c) => c.id === selectedId);
  const filteredCanned = useMemo(() =>
    showCannedMenu
      ? cannedResponses.filter(
          (cr) =>
            input.length <= 1 ||
            cr.shortcut.toLowerCase().includes(input.slice(1).toLowerCase()) ||
            cr.title.toLowerCase().includes(input.slice(1).toLowerCase())
        )
      : [],
    [showCannedMenu, cannedResponses, input]
  );

  // Visible messages (filter out internal notes for the "Chat" tab)
  const visibleMessages = useMemo(() =>
    showNotes
      ? messages
      : messages.filter((m) => !(m.metadata?.internal_note)),
    [showNotes, messages]
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('inbox.title')}</h1>
        <p className="mt-1 text-muted-foreground">{t('inbox.description')}</p>
      </div>

      <div className="flex h-[calc(100vh-220px)] min-h-[400px] overflow-hidden rounded-xl border bg-card">
        {/* Left panel - Conversation list */}
        <div
          className={cn(
            "flex w-full flex-col border-r md:w-80 md:flex-shrink-0",
            selectedId ? "hidden md:flex" : "flex"
          )}
        >
          {/* Filter tabs */}
          <div className="flex border-b p-2 gap-1">
            {(["waiting", "human", "closed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setSelectedId(null); }}
                className={cn(
                  "flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
                  filter === f
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {f === "waiting" ? t('inbox.waiting') : f === "human" ? t('inbox.active') : t('inbox.closed')}
              </button>
            ))}
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {t('common.loading')}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {t('inbox.empty')}
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={cn(
                    "flex w-full items-start gap-3 border-b p-3 text-left transition-colors hover:bg-muted/50",
                    selectedId === conv.id && "bg-muted"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {conv.status === "waiting" && (
                        <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                      )}
                      <span className="text-xs font-medium truncate">
                        {conv.visitor_id?.slice(0, 8)}
                      </span>
                      <span className={cn(
                        "ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                        conv.status === "waiting" && "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
                        conv.status === "human" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                        conv.status === "closed" && "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      )}>
                        {conv.status === "waiting" ? t('inbox.waiting') : conv.status === "human" ? t('inbox.active') : t('inbox.closed')}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground truncate">
                      {conv.first_message || t('inbox.noPreview')}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground/60">
                      {new Date(conv.started_at).toLocaleString()}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right panel - Chat view */}
        <div
          className={cn(
            "flex flex-1 flex-col",
            !selectedId ? "hidden md:flex" : "flex"
          )}
        >
          {!selectedId ? (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="mx-auto h-10 w-10 opacity-20" />
                <p className="mt-2 text-sm">{t('inbox.selectConversation')}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center justify-between border-b px-4 py-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedId(null)}
                    className="md:hidden rounded-lg p-1 hover:bg-muted"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-medium">
                    {selectedConv?.visitor_id?.slice(0, 8)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {/* Notes toggle */}
                  <Button
                    variant={showNotes ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setShowNotes(!showNotes)}
                    className="h-7 text-xs"
                  >
                    <StickyNote className="h-3 w-3 mr-1" />
                    {t('inbox.notes')}
                  </Button>

                  {/* Transfer */}
                  {selectedConv?.status === "human" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={loadOnlineAgents}
                      className="h-7 text-xs"
                    >
                      <ArrowRightLeft className="h-3 w-3 mr-1" />
                      {t('inbox.transfer')}
                    </Button>
                  )}

                  {/* Claim */}
                  {selectedConv?.status === "waiting" && (
                    <Button
                      size="sm"
                      onClick={() => handleClaim(selectedId)}
                      className="h-7 text-xs"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      {t('inbox.claim')}
                    </Button>
                  )}

                  {/* Close */}
                  {selectedConv?.status !== "closed" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleClose(selectedId)}
                      className="h-7 text-xs text-muted-foreground"
                    >
                      <X className="h-3 w-3 mr-1" />
                      {t('inbox.close')}
                    </Button>
                  )}
                </div>
              </div>

              {/* Transfer dropdown */}
              {showTransfer && (
                <div className="border-b bg-muted/50 p-3">
                  <p className="text-xs font-medium mb-2">{t('inbox.transferTo')}</p>
                  {onlineAgents.length === 0 ? (
                    <p className="text-xs text-muted-foreground">{t('inbox.noAgentsOnline')}</p>
                  ) : (
                    <div className="space-y-1">
                      {onlineAgents.map((agent) => (
                        <button
                          key={agent.user_id}
                          onClick={() => handleTransfer(agent.user_id)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs hover:bg-muted transition-colors"
                        >
                          <span className="h-2 w-2 rounded-full bg-green-500" />
                          {agent.name || agent.email || agent.user_id.slice(0, 8)}
                        </button>
                      ))}
                    </div>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setShowTransfer(false)} className="mt-2 h-6 text-xs">
                    {t('settings.cancel')}
                  </Button>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {visibleMessages.map((msg) => {
                  const isNote = msg.metadata?.internal_note;
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.role === "user" ? "justify-start" : msg.role === "agent" ? "justify-end" : "justify-center"
                      )}
                    >
                      {isNote ? (
                        <div className="max-w-[80%] rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 px-3 py-2">
                          <p className="text-[10px] font-medium text-yellow-700 dark:text-yellow-400 mb-0.5">
                            {t('inbox.internalNote')}
                          </p>
                          <p className="text-xs text-yellow-800 dark:text-yellow-300">{msg.content}</p>
                        </div>
                      ) : msg.role === "system" ? (
                        <div className="text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1">
                          {msg.content}
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                            msg.role === "user"
                              ? "rounded-bl-md bg-muted text-foreground"
                              : msg.role === "agent"
                                ? "rounded-br-md bg-primary text-primary-foreground"
                                : "rounded-bl-md bg-muted/50 text-foreground"
                          )}
                        >
                          {msg.role === "agent" && (
                            <p className="text-[10px] opacity-70 mb-0.5">{t('inbox.you')}</p>
                          )}
                          {msg.role === "assistant" && (
                            <p className="text-[10px] text-muted-foreground mb-0.5">AI</p>
                          )}
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <p className="text-[10px] opacity-50 mt-1">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
                {visitorTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-muted px-4 py-3">
                      <span className="text-[10px] text-muted-foreground mr-1">
                        {t('inbox.visitorTyping')}
                      </span>
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:0ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:300ms]" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              {selectedConv?.status !== "closed" && (
                <div className="border-t p-3">
                  {/* Notes input */}
                  {showNotes && (
                    <div className="mb-2">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleAddNote();
                        }}
                        className="flex items-center gap-2"
                      >
                        <Input
                          value={noteInput}
                          onChange={(e) => setNoteInput(e.target.value)}
                          placeholder={t('inbox.addNote')}
                          className="text-xs h-8 bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800"
                        />
                        <Button size="sm" variant="outline" className="h-8 text-xs" disabled={!noteInput.trim()}>
                          <StickyNote className="h-3 w-3" />
                        </Button>
                      </form>
                    </div>
                  )}

                  {/* Canned responses dropdown */}
                  {showCannedMenu && filteredCanned.length > 0 && (
                    <div className="mb-2 max-h-40 overflow-y-auto rounded-lg border bg-popover shadow-lg">
                      {filteredCanned.map((cr) => (
                        <button
                          key={cr.id}
                          onClick={() => {
                            setInput(cr.content);
                            setShowCannedMenu(false);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-muted transition-colors"
                        >
                          <Slash className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{cr.shortcut}</span>
                          <span className="text-muted-foreground truncate">{cr.title}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Message input */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    className="flex items-center gap-2"
                  >
                    <Input
                      value={input}
                      onChange={(e) => handleInputChange(e.target.value)}
                      placeholder={t('inbox.messagePlaceholder')}
                      className="text-sm"
                    />
                    <Button size="icon" disabled={!input.trim()} className="shrink-0">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
