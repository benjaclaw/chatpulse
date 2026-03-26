import { useState, useEffect, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useWorkspace } from "@/contexts/workspace-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Check, X, ArrowLeft, ArrowRightLeft, StickyNote, Slash } from "lucide-react";
import { cn } from "@/lib/utils";
import { TransferDialog } from "./transfer-dialog";
import type { InboxConversation } from "./use-conversations";
import type { InboxMessage } from "./use-messages";

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

interface ChatPanelProps {
  selectedId: string | null;
  selectedConv: InboxConversation | undefined;
  messages: InboxMessage[];
  visibleMessages: InboxMessage[];
  visitorTyping: boolean;
  showNotes: boolean;
  setShowNotes: (v: boolean) => void;
  selectedLeadInfo: { name?: string; email?: string } | null;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  setMessages: React.Dispatch<React.SetStateAction<InboxMessage[]>>;
  userId: string | null;
  onClaim: (id: string) => void;
  onClose: (id: string) => void;
  onDeselect: () => void;
  loadConversations: () => void;
  t: (key: string) => string;
}

export function ChatPanel({
  selectedId,
  selectedConv,
  messages,
  visibleMessages,
  visitorTyping,
  showNotes,
  setShowNotes,
  selectedLeadInfo,
  messagesEndRef,
  setMessages,
  userId,
  onClaim,
  onClose,
  onDeselect,
  loadConversations,
  t,
}: ChatPanelProps): React.ReactNode {
  const workspace = useWorkspace();
  const supabase = createClient();
  const [input, setInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [showTransfer, setShowTransfer] = useState(false);
  const [onlineAgents, setOnlineAgents] = useState<OnlineAgent[]>([]);
  const [cannedResponses, setCannedResponses] = useState<CannedResponse[]>([]);
  const [showCannedMenu, setShowCannedMenu] = useState(false);
  const agentTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Typing channel ref
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingChannelIdRef = useRef<string | null>(null);

  // Load canned responses
  useEffect(() => {
    let cancelled = false;
    supabase.from("canned_responses").select("id, shortcut, title, content")
      .eq("workspace_id", workspace.id)
      .then(({ data }) => { if (!cancelled && data) setCannedResponses(data); });
    return () => { cancelled = true; };
  }, [workspace.id]);

  // Keep typing channel in sync with selectedId
  useEffect(() => {
    if (typingChannelIdRef.current && typingChannelIdRef.current !== selectedId && typingChannelRef.current) {
      supabase.removeChannel(typingChannelRef.current);
      typingChannelRef.current = null;
      typingChannelIdRef.current = null;
    }
  }, [selectedId]);

  function sendAgentTyping() {
    if (!selectedId) return;
    if (typingChannelIdRef.current !== selectedId || !typingChannelRef.current) {
      if (typingChannelRef.current) supabase.removeChannel(typingChannelRef.current);
      typingChannelRef.current = supabase.channel(`typing-${selectedId}`);
      typingChannelRef.current.subscribe();
      typingChannelIdRef.current = selectedId;
    }
    typingChannelRef.current.send({ type: "broadcast", event: "typing", payload: { from: "agent" } });
    if (agentTypingTimeoutRef.current) clearTimeout(agentTypingTimeoutRef.current);
    agentTypingTimeoutRef.current = setTimeout(() => {}, 3000);
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || !selectedId) return;
    const tempMsg: InboxMessage = { id: `temp-${Date.now()}`, role: "agent", content: text, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, tempMsg]);
    setInput("");
    setShowCannedMenu(false);
    await fetch("/api/live-chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: selectedId, content: text, role: "agent" }),
    });
  }

  async function handleAddNote() {
    const text = noteInput.trim();
    if (!text || !selectedId) return;
    const tempMsg: InboxMessage = { id: `note-${Date.now()}`, role: "system", content: text, created_at: new Date().toISOString(), metadata: { internal_note: true } };
    setMessages((prev) => [...prev, tempMsg]);
    setNoteInput("");
    await supabase.from("messages").insert({ conversation_id: selectedId, role: "system", content: text, metadata: { internal_note: true } });
  }

  async function handleTransfer(targetAgentId: string) {
    if (!selectedId) return;
    const agent = onlineAgents.find((a) => a.user_id === targetAgentId);
    const agentName = agent?.name || agent?.email || "agent";
    await supabase.from("conversations").update({ assigned_to: targetAgentId }).eq("id", selectedId);
    await supabase.from("agent_assignments").update({ resolved_at: new Date().toISOString() }).eq("conversation_id", selectedId).is("resolved_at", null);
    await supabase.from("agent_assignments").insert({ conversation_id: selectedId, agent_id: targetAgentId });
    await supabase.from("messages").insert({ conversation_id: selectedId, role: "system", content: `Samtalen ble overf\u00f8rt til ${agentName}` });
    setShowTransfer(false);
    onDeselect();
    loadConversations();
  }

  async function loadOnlineAgents() {
    const { data } = await supabase.from("agent_presence").select("user_id").eq("workspace_id", workspace.id).in("status", ["online", "busy"]);
    if (data) {
      const otherAgentIds = data.map((item) => item.user_id).filter((id) => id !== userId);
      if (otherAgentIds.length > 0) {
        const { data: members } = await supabase.from("members").select("user_id").eq("workspace_id", workspace.id).in("user_id", otherAgentIds);
        const validIds = new Set((members ?? []).map((m) => m.user_id));
        setOnlineAgents(otherAgentIds.filter((id) => validIds.has(id)).map((id) => ({ user_id: id, email: id })));
      } else {
        setOnlineAgents([]);
      }
    }
    setShowTransfer(true);
  }

  function handleInputChange(value: string) {
    setInput(value);
    sendAgentTyping();
    if (value === "/" || (value.startsWith("/") && cannedResponses.length > 0)) {
      setShowCannedMenu(true);
    } else {
      setShowCannedMenu(false);
    }
  }

  const filteredCanned = useMemo(() =>
    showCannedMenu
      ? cannedResponses.filter((cr) =>
          input.length <= 1 || cr.shortcut.toLowerCase().includes(input.slice(1).toLowerCase()) || cr.title.toLowerCase().includes(input.slice(1).toLowerCase())
        )
      : [],
    [showCannedMenu, cannedResponses, input]
  );

  if (!selectedId) {
    return (
      <div className={cn("flex flex-1 flex-col", "hidden md:flex")}>
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          <div className="text-center">
            <MessageCircle className="mx-auto h-10 w-10 opacity-20" />
            <p className="mt-2 text-sm">{t('inbox.selectConversation')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Chat header */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <button onClick={onDeselect} className="md:hidden rounded-lg p-1 hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium">
            {selectedLeadInfo?.name || selectedLeadInfo?.email || selectedConv?.visitor_id?.slice(0, 8)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant={showNotes ? "default" : "ghost"} size="sm" onClick={() => setShowNotes(!showNotes)} className="h-7 text-xs">
            <StickyNote className="h-3 w-3 mr-1" />{t('inbox.notes')}
          </Button>
          {selectedConv?.status === "human" && (
            <Button variant="ghost" size="sm" onClick={loadOnlineAgents} className="h-7 text-xs">
              <ArrowRightLeft className="h-3 w-3 mr-1" />{t('inbox.transfer')}
            </Button>
          )}
          {selectedConv?.status === "waiting" && (
            <Button size="sm" onClick={() => onClaim(selectedId)} className="h-7 text-xs">
              <Check className="h-3 w-3 mr-1" />{t('inbox.claim')}
            </Button>
          )}
          {selectedConv?.status !== "closed" && (
            <Button variant="ghost" size="sm" onClick={() => onClose(selectedId)} className="h-7 text-xs text-muted-foreground">
              <X className="h-3 w-3 mr-1" />{t('inbox.close')}
            </Button>
          )}
        </div>
      </div>

      {showTransfer && <TransferDialog agents={onlineAgents} onTransfer={handleTransfer} onClose={() => setShowTransfer(false)} t={t} />}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {visibleMessages.map((msg) => {
          const isNote = msg.metadata?.internal_note;
          return (
            <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-start" : msg.role === "agent" ? "justify-end" : "justify-center")}>
              {isNote ? (
                <div className="max-w-[80%] rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 px-3 py-2">
                  <p className="text-[10px] font-medium text-yellow-700 dark:text-yellow-400 mb-0.5">{t('inbox.internalNote')}</p>
                  <p className="text-xs text-yellow-800 dark:text-yellow-300">{msg.content}</p>
                </div>
              ) : msg.role === "system" ? (
                <div className="text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1">{msg.content}</div>
              ) : (
                <div className={cn("max-w-[75%] rounded-2xl px-4 py-2 text-sm", msg.role === "user" ? "rounded-bl-md bg-muted text-foreground" : msg.role === "agent" ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-muted/50 text-foreground")}>
                  {msg.role === "agent" && <p className="text-[10px] opacity-70 mb-0.5">{t('inbox.you')}</p>}
                  {msg.role === "assistant" && <p className="text-[10px] text-muted-foreground mb-0.5">AI</p>}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-[10px] opacity-50 mt-1">{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              )}
            </div>
          );
        })}
        {visitorTyping && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-muted px-4 py-3">
              <span className="text-[10px] text-muted-foreground mr-1">{t('inbox.visitorTyping')}</span>
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
          {showNotes && (
            <div className="mb-2">
              <form onSubmit={(e) => { e.preventDefault(); handleAddNote(); }} className="flex items-center gap-2">
                <Input value={noteInput} onChange={(e) => setNoteInput(e.target.value)} placeholder={t('inbox.addNote')} className="text-xs h-8 bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800" />
                <Button size="sm" variant="outline" className="h-8 text-xs" disabled={!noteInput.trim()}>
                  <StickyNote className="h-3 w-3" />
                </Button>
              </form>
            </div>
          )}
          {showCannedMenu && filteredCanned.length > 0 && (
            <div className="mb-2 max-h-40 overflow-y-auto rounded-lg border bg-popover shadow-lg">
              {filteredCanned.map((cr) => (
                <button key={cr.id} onClick={() => { setInput(cr.content); setShowCannedMenu(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-muted transition-colors">
                  <Slash className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">{cr.shortcut}</span>
                  <span className="text-muted-foreground truncate">{cr.title}</span>
                </button>
              ))}
            </div>
          )}
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
            <Input value={input} onChange={(e) => handleInputChange(e.target.value)} placeholder={t('inbox.messagePlaceholder')} className="text-sm" />
            <Button size="icon" disabled={!input.trim()} className="shrink-0"><Send className="h-4 w-4" /></Button>
          </form>
        </div>
      )}
    </div>
  );
}
