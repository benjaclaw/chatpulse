"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { createT, type Language, type TranslateFunction } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

interface Message {
  id: string;
  role: "user" | "assistant" | "agent";
  content: string;
}

interface ChatWidgetProps {
  primaryColor?: string;
  position?: "left" | "right";
  welcomeMessage?: string;
  botName?: string;
  /** Optional logo URL to display in the header instead of the default icon */
  logoUrl?: string;
  /** Render inline (no floating button, always open) for previews */
  inline?: boolean;
  className?: string;
  /** When provided, messages are persisted to the DB and AI is enabled */
  chatbotId?: string;
  language?: string;
  /** Hide the 'Powered by ChatPulse' watermark (white-label) */
  hideWatermark?: boolean;
}

function getVisitorId(): string {
  const key = "chatpulse_visitor_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

const PLACEHOLDER_MAP: Record<string, string> = {
  nb: "Skriv en melding…",
  en: "Type a message…",
  sv: "Skriv ett meddelande…",
  da: "Skriv en besked…",
  de: "Nachricht schreiben…",
  fr: "Écrivez un message…",
  es: "Escribe un mensaje…",
};

export function ChatWidget({
  primaryColor = "#6366f1",
  position = "right",
  welcomeMessage,
  botName = "ChatPulse",
  logoUrl,
  inline = false,
  className,
  chatbotId,
  language,
  hideWatermark = false,
}: ChatWidgetProps): React.ReactNode {
  const i18nLang: Language = (language === "nb" || language === "en") ? language : "nb";
  const t = createT(i18nLang);
  const placeholder = (language && PLACEHOLDER_MAP[language]) || PLACEHOLDER_MAP.nb;

  const defaultMessages: Message[] = [
    {
      id: "welcome",
      role: "assistant",
      content: t('widget.defaultWelcome'),
    },
  ];

  const demoReplies = [
    t('widget.demo1'),
    t('widget.demo2'),
    t('widget.demo3'),
    t('widget.demo4'),
  ];

  const [isOpen, setIsOpen] = useState(inline);
  const [messages, setMessages] = useState<Message[]>(() => {
    // Restore messages from sessionStorage if available
    try {
      const saved = sessionStorage.getItem("chatpulse_messages");
      if (saved) {
        const parsed = JSON.parse(saved) as Message[];
        if (parsed.length > 0) return parsed;
      }
    } catch { /* ignore */ }
    if (welcomeMessage) {
      return [{ id: "welcome", role: "assistant", content: welcomeMessage }];
    }
    return defaultMessages;
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [handoffTriggered, setHandoffTriggered] = useState(false);
  const [handoffSubmitted, setHandoffSubmitted] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);
  const [liveChatMode, setLiveChatMode] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [agentsOnline, setAgentsOnline] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(() => {
    // If we restored messages from sessionStorage that include user messages, user has already interacted
    try {
      const saved = sessionStorage.getItem("chatpulse_messages");
      if (saved) {
        const parsed = JSON.parse(saved) as Message[];
        return parsed.some((m) => m.role === "user");
      }
    } catch { /* ignore */ }
    return false;
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const conversationIdRef = useRef<string | null>(null);
  const workspaceIdRef = useRef<string | null>(null);
  const pendingLiveChatRef = useRef<{ conversationId: string; workspaceId?: string } | null>(null);
  const realtimeChannelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);
  const typingChannelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persist messages to sessionStorage so they survive page navigation
  useEffect(() => {
    try {
      if (messages.length > 1 || (messages.length === 1 && messages[0].id !== "welcome")) {
        sessionStorage.setItem("chatpulse_messages", JSON.stringify(messages.slice(-50))); // keep last 50
      }
    } catch { /* ignore */ }
  }, [messages]);

  const hasMounted = useRef(false);
  useEffect(() => {
    // Skip initial mount to prevent page scroll on landing page
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    const el = messagesEndRef.current;
    if (el?.parentElement) {
      el.parentElement.scrollTop = el.parentElement.scrollHeight;
    }
  }, [messages, isTyping, agentTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
    if (isOpen && chatbotId) {
      // Re-check agent presence every time widget opens (not just first time)
      fetch(`/api/widget-config?chatbotId=${encodeURIComponent(chatbotId)}`)
        .then((r) => r.json())
        .then((data: { workspaceId?: string; agentsOnline?: boolean }) => {
          if (data.workspaceId) workspaceIdRef.current = data.workspaceId;
          setAgentsOnline(!!data.agentsOnline);
        })
        .catch(() => {});
    }
  }, [isOpen, chatbotId]);

  // Update messages when welcomeMessage changes (for live preview)
  useEffect(() => {
    if (welcomeMessage !== undefined) {
      setMessages([
        { id: "welcome", role: "assistant", content: welcomeMessage || t('widget.fallbackWelcome') },
      ]);
    }
  }, [welcomeMessage]);

  // Subscribe to realtime messages when in live chat mode
  const subscribeToRealtime = useCallback((conversationId: string) => {
    const supabase = createClient();

    // Message subscription via broadcast (anon clients can't receive postgres_changes due to RLS)
    const channel = supabase
      .channel(`live-chat-${conversationId}`)
      .on(
        "broadcast" as "system",
        { event: "new-message" } as Record<string, string>,
        (payload: { payload?: { id: string; role: string; content: string } }) => {
          const msg = payload.payload;
          if (!msg || msg.role !== "agent") return;
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, { id: msg.id, role: "agent", content: msg.content }];
          });
          setAgentTyping(false);
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;

    // Typing indicator channel
    const typingChannel = supabase
      .channel(`typing-${conversationId}`)
      .on("broadcast" as "system", { event: "typing" } as Record<string, string>, (payload: { payload?: { from?: string } }) => {
        if (payload.payload?.from === "agent") {
          setAgentTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setAgentTyping(false), 3000);
        }
      })
      .subscribe();

    typingChannelRef.current = typingChannel;

    // Subscribe to conversation status changes via broadcast
    const statusChannel = supabase
      .channel(`conv-status-${conversationId}`)
      .on(
        "broadcast" as "system",
        { event: "status-change" } as Record<string, string>,
        (payload: { payload?: { status: string; agentName?: string } }) => {
          const status = payload.payload?.status;
          const agentName = payload.payload?.agentName;
          if (status === "human") {
            setQueuePosition(null);
            const name = agentName || (i18nLang === "nb" ? "Kundeservice" : "Support");
            setMessages((prev) => [
              ...prev,
              { id: `agent-joined-${Date.now()}`, role: "assistant" as const, content: i18nLang === "nb" ? `${name} har koblet til samtalen.` : `${name} has joined the conversation.` },
            ]);
          } else if (status === "closed") {
            setLiveChatMode(false);
            conversationIdRef.current = null;
            setHasInteracted(false);
            setChatEnded(true);
            try {
              sessionStorage.removeItem("chatpulse_live_chat_mode");
              sessionStorage.removeItem("chatpulse_conversation_id");
              sessionStorage.removeItem("chatpulse_workspace_id");
            } catch { /* ignore */ }
            setMessages((prev) => [
              ...prev,
              { id: `closed-${Date.now()}`, role: "assistant", content: i18nLang === "nb" ? "Samtalen er avsluttet. Takk for at du tok kontakt!" : "The conversation has ended. Thanks for reaching out!" },
            ]);
          } else if (status === "ai") {
            setLiveChatMode(false);
            conversationIdRef.current = null;
            setHasInteracted(false);
            try {
              sessionStorage.removeItem("chatpulse_live_chat_mode");
              sessionStorage.removeItem("chatpulse_conversation_id");
              sessionStorage.removeItem("chatpulse_workspace_id");
            } catch { /* ignore */ }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(typingChannel);
      supabase.removeChannel(statusChannel);
    };
  }, [i18nLang]);

  // FIX 3: Restore live chat session from sessionStorage on mount
  useEffect(() => {
    try {
      const savedMode = sessionStorage.getItem("chatpulse_live_chat_mode");
      const savedConvId = sessionStorage.getItem("chatpulse_conversation_id");
      const savedWsId = sessionStorage.getItem("chatpulse_workspace_id");

      if (savedMode === "true" && savedConvId) {
        const visitorId = getVisitorId();
        fetch(`/api/widget-session?conversationId=${encodeURIComponent(savedConvId)}&visitorId=${encodeURIComponent(visitorId)}`)
          .then((r) => {
            if (!r.ok) throw new Error("not found");
            return r.json();
          })
          .then((data: { status: string; messages: { id: string; role: string; content: string }[] }) => {
            if (data.status === "closed" || data.status === "ai") {
              sessionStorage.removeItem("chatpulse_live_chat_mode");
              sessionStorage.removeItem("chatpulse_conversation_id");
              sessionStorage.removeItem("chatpulse_workspace_id");
              return;
            }

            conversationIdRef.current = savedConvId;
            if (savedWsId) workspaceIdRef.current = savedWsId;

            if (data.messages.length > 0) {
              const restored: Message[] = data.messages.map((m) => ({
                id: m.id,
                role: m.role as Message["role"],
                content: m.content,
              }));
              setMessages(restored);
            }
            setLiveChatMode(true);
            subscribeToRealtime(savedConvId);
            if (savedWsId) {
              fetchQueuePosition(savedConvId, savedWsId);
            }
          })
          .catch(() => {
            sessionStorage.removeItem("chatpulse_live_chat_mode");
            sessionStorage.removeItem("chatpulse_conversation_id");
            sessionStorage.removeItem("chatpulse_workspace_id");
          });
      }
    } catch {
      // sessionStorage not available
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (realtimeChannelRef.current) {
        const supabase = createClient();
        supabase.removeChannel(realtimeChannelRef.current);
      }
      if (typingChannelRef.current) {
        const supabase = createClient();
        supabase.removeChannel(typingChannelRef.current);
      }
    };
  }, []);

  // Fetch queue position
  const fetchQueuePosition = useCallback(async (conversationId: string, wsId: string) => {
    try {
      const res = await fetch(`/api/widget-queue?conversationId=${encodeURIComponent(conversationId)}&workspaceId=${encodeURIComponent(wsId)}`);
      if (res.ok) {
        const data = await res.json() as { position: number };
        setQueuePosition(data.position > 0 ? data.position : null);
      }
    } catch {
      // ignore
    }
  }, []);

  // Send typing event for visitor
  const sendVisitorTyping = useCallback(() => {
    if (typingChannelRef.current) {
      typingChannelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: { from: "visitor" },
      });
    }
  }, []);

  async function handleSend(overrideText?: string) {
    const text = overrideText?.trim() || input.trim();
    if (!text || isTyping) return;
    setHasInteracted(true);

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!overrideText) setInput("");

    // If in live chat mode, send via live-chat API
    if (liveChatMode && conversationIdRef.current) {
      try {
        const res = await fetch("/api/live-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: conversationIdRef.current,
            content: text,
            role: "user",
            visitorId: getVisitorId(),
          }),
        });
        // FIX 5: Handle 410 Gone (closed conversation)
        if (res.status === 410) {
          setLiveChatMode(false);
          conversationIdRef.current = null;
          setHasInteracted(false);
          try {
            sessionStorage.removeItem("chatpulse_live_chat_mode");
            sessionStorage.removeItem("chatpulse_conversation_id");
            sessionStorage.removeItem("chatpulse_workspace_id");
          } catch { /* ignore */ }
          setMessages((prev) => [
            ...prev,
            { id: `closed-${Date.now()}`, role: "assistant", content: i18nLang === "nb" ? "Samtalen er avsluttet." : "The conversation has ended." },
          ]);
          return;
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          { id: `err-${Date.now()}`, role: "assistant", content: t('widget.error') },
        ]);
      }
      return;
    }

    setIsTyping(true);

    // If we have a chatbotId, use AI; otherwise fall back to demo replies
    if (chatbotId) {
      try {
        const visitorId = getVisitorId();
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatbotId,
            conversationId: conversationIdRef.current,
            message: text,
            visitorId,
            language: language || undefined,
          }),
        });

        const data = await res.json();

        if (res.ok && data.response) {
          conversationIdRef.current = data.conversationId;
          if (data.workspaceId) workspaceIdRef.current = data.workspaceId;
          setMessages((prev) => [
            ...prev,
            { id: `bot-${Date.now()}`, role: "assistant", content: data.response },
          ]);

          if (data.handoff) {
            // Always show lead capture form first, then connect to live chat if agents are online
            if (!handoffTriggered) {
              setHandoffTriggered(true);
              // Store pending live chat data so we can connect after lead form is submitted
              if (data.liveChat && data.conversationId) {
                pendingLiveChatRef.current = {
                  conversationId: data.conversationId,
                  workspaceId: data.workspaceId,
                };
              }
            }
          }
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-${Date.now()}`,
              role: "assistant",
              content: t('widget.error'),
            },
          ]);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            role: "assistant",
            content: t('widget.error'),
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    } else {
      // Demo mode for preview
      setTimeout(() => {
        const reply = demoReplies[Math.floor(Math.random() * demoReplies.length)];
        setMessages((prev) => [
          ...prev,
          { id: `bot-${Date.now()}`, role: "assistant", content: reply },
        ]);
        setIsTyping(false);
      }, 1000 + Math.random() * 500);
    }
  }

  // Shared handoff form submit handler
  async function handleHandoffSubmit(email: string, name: string) {
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        name: name || null,
        workspaceId: workspaceIdRef.current,
        conversationId: conversationIdRef.current,
      }),
    });
    setHandoffSubmitted(true);
    const pending = pendingLiveChatRef.current;
    if (pending) {
      pendingLiveChatRef.current = null;
      setLiveChatMode(true);
      try {
        sessionStorage.setItem("chatpulse_live_chat_mode", "true");
        sessionStorage.setItem("chatpulse_conversation_id", pending.conversationId);
        if (pending.workspaceId) sessionStorage.setItem("chatpulse_workspace_id", pending.workspaceId);
      } catch { /* ignore */ }
      setMessages((prev) => [
        ...prev,
        { id: `handoff-confirm-${Date.now()}`, role: "assistant", content: i18nLang === "nb" ? `Takk, ${name || email}! Du settes nå i kontakt med en medarbeider. Det kan ta noen minutter.` : `Thanks, ${name || email}! You're being connected to an agent. It may take a few minutes.` },
      ]);
      subscribeToRealtime(pending.conversationId);
      if (pending.workspaceId) fetchQueuePosition(pending.conversationId, pending.workspaceId);
    } else {
      setMessages((prev) => [
        ...prev,
        { id: `handoff-confirm-${Date.now()}`, role: "assistant", content: t('widget.handoffConfirm') },
      ]);
    }
  }

  // Always show choice buttons when agents are online and not in live chat mode
  // They appear at the bottom of the message list as a persistent option
  const showChoices = agentsOnline && !liveChatMode && !handoffTriggered;
  const choiceButtons = showChoices ? (
    <div className="flex flex-col gap-2 px-1">
      <button
        type="button"
        onClick={() => {
          // Scroll to input and add a visual hint
          inputRef.current?.focus();
          inputRef.current?.scrollIntoView({ behavior: "smooth" });
          // Flash the input border briefly
          if (inputRef.current) {
            inputRef.current.style.borderColor = primaryColor;
            inputRef.current.style.boxShadow = `0 0 0 2px ${primaryColor}33`;
            setTimeout(() => {
              if (inputRef.current) {
                inputRef.current.style.borderColor = "";
                inputRef.current.style.boxShadow = "";
              }
            }, 2000);
          }
        }}
        className="rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:bg-opacity-10"
        style={{ borderColor: primaryColor, color: primaryColor }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = primaryColor + "1a")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      >
        {i18nLang === "nb" ? "💬 Still et spørsmål" : "💬 Ask a question"}
      </button>
      <button
        type="button"
        onClick={() => handleSend(i18nLang === "nb" ? "Jeg vil gjerne snakke med en medarbeider" : "I would like to speak with a representative")}
        className="rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:bg-opacity-10"
        style={{ borderColor: primaryColor, color: primaryColor }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = primaryColor + "1a")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      >
        {i18nLang === "nb" ? "👤 Snakk med menneske" : "👤 Talk to a person"}
      </button>
    </div>
  ) : null;

  const headerSubtext = liveChatMode
    ? (i18nLang === "nb" ? "Live chat" : "Live chat")
    : agentsOnline
      ? (i18nLang === "nb" ? "Kundeservice er online" : "Support is online")
      : t('widget.online');

  // Inline mode — no floating button
  if (inline) {
    return (
      <div
        className={cn(
          "flex flex-col overflow-hidden rounded-xl border bg-card shadow-lg",
          !className?.includes("h-") && "h-[420px]",
          className
        )}
      >
        <WidgetHeader
          botName={botName}
          primaryColor={primaryColor}
          logoUrl={logoUrl}
          onClose={() => {}}
          showClose={false}
          t={t}
          subtext={headerSubtext}
          agentsOnline={agentsOnline}
        />
        <MessageList
          messages={messages}
          isTyping={isTyping}
          agentTyping={agentTyping}
          primaryColor={primaryColor}
          ref={messagesEndRef}
          queuePosition={queuePosition}
          i18nLang={i18nLang}
          handoffForm={
            handoffTriggered && !handoffSubmitted ? (
              <HandoffForm
                primaryColor={primaryColor}
                t={t}
                onSubmit={handleHandoffSubmit}

















              />
            ) : null
          }
          choiceButtons={choiceButtons}
          chatEndedButton={chatEnded ? (
            <div className="flex justify-center py-2">
              <button
                onClick={() => {
                  setChatEnded(false);
                  setHasInteracted(false);
                  setHandoffTriggered(false);
                  setHandoffSubmitted(false);
                  setMessages([{ id: "welcome", role: "assistant", content: welcomeMessage || t('widget.defaultWelcome') }]);
                  try { sessionStorage.removeItem("chatpulse_messages"); } catch {}
                }}
                className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                {i18nLang === "nb" ? "Start ny chat" : "Start new chat"}
              </button>
            </div>
          ) : null}
        />
        <WidgetInput
          value={input}
          onChange={(v) => {
            setInput(v);
            if (liveChatMode) sendVisitorTyping();
          }}
          onSend={handleSend}
          primaryColor={primaryColor}
          ref={inputRef}
          t={t}
          hideWatermark={hideWatermark}
          placeholderText={placeholder}
          i18nLang={i18nLang}
          onEndChat={messages.length > 1 ? () => {
            setLiveChatMode(false);
            conversationIdRef.current = null;
            setHasInteracted(false);
            setChatEnded(false);
            setHandoffTriggered(false);
            setHandoffSubmitted(false);
            pendingLiveChatRef.current = null;
            try {
              sessionStorage.removeItem('chatpulse_live_chat_mode');
              sessionStorage.removeItem('chatpulse_conversation_id');
              sessionStorage.removeItem('chatpulse_workspace_id');
              sessionStorage.removeItem('chatpulse_messages');
            } catch {}
            setMessages([{ id: 'welcome', role: 'assistant' as const, content: welcomeMessage || t('widget.defaultWelcome') }]);
          } : undefined}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-5 z-50",
        position === "right" ? "right-5" : "left-5",
        className
      )}
    >
      {/* Chat window */}
      <div
        className={cn(
          "mb-3 flex flex-col overflow-hidden rounded-xl border bg-card shadow-lg transition-all duration-300",
          isOpen
            ? "h-[480px] w-[360px] scale-100 opacity-100"
            : "pointer-events-none h-0 w-[360px] scale-95 opacity-0"
        )}
      >
        <WidgetHeader
          botName={botName}
          primaryColor={primaryColor}
          logoUrl={logoUrl}
          onClose={() => setIsOpen(false)}
          showClose
          t={t}
          subtext={headerSubtext}
          agentsOnline={agentsOnline}
        />
        <MessageList
          messages={messages}
          isTyping={isTyping}
          agentTyping={agentTyping}
          primaryColor={primaryColor}
          ref={messagesEndRef}
          queuePosition={queuePosition}
          i18nLang={i18nLang}
          handoffForm={
            handoffTriggered && !handoffSubmitted ? (
              <HandoffForm
                primaryColor={primaryColor}
                t={t}
                onSubmit={handleHandoffSubmit}

















              />
            ) : null
          }
          choiceButtons={choiceButtons}
          chatEndedButton={chatEnded ? (
            <div className="flex justify-center py-2">
              <button
                onClick={() => {
                  setChatEnded(false);
                  setHasInteracted(false);
                  setHandoffTriggered(false);
                  setHandoffSubmitted(false);
                  setMessages([{ id: "welcome", role: "assistant", content: welcomeMessage || t('widget.defaultWelcome') }]);
                  try { sessionStorage.removeItem("chatpulse_messages"); } catch {}
                }}
                className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                {i18nLang === "nb" ? "Start ny chat" : "Start new chat"}
              </button>
            </div>
          ) : null}
        />
        <WidgetInput
          value={input}
          onChange={(v) => {
            setInput(v);
            if (liveChatMode) sendVisitorTyping();
          }}
          onSend={handleSend}
          primaryColor={primaryColor}
          ref={inputRef}
          t={t}
          hideWatermark={hideWatermark}
          placeholderText={placeholder}
          i18nLang={i18nLang}
          onEndChat={messages.length > 1 ? () => {
            setLiveChatMode(false);
            conversationIdRef.current = null;
            setHasInteracted(false);
            setChatEnded(false);
            setHandoffTriggered(false);
            setHandoffSubmitted(false);
            pendingLiveChatRef.current = null;
            try {
              sessionStorage.removeItem('chatpulse_live_chat_mode');
              sessionStorage.removeItem('chatpulse_conversation_id');
              sessionStorage.removeItem('chatpulse_workspace_id');
              sessionStorage.removeItem('chatpulse_messages');
            } catch {}
            setMessages([{ id: 'welcome', role: 'assistant' as const, content: welcomeMessage || t('widget.defaultWelcome') }]);
          } : undefined}
        />
      </div>

      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
        style={{ backgroundColor: primaryColor }}
        aria-label={isOpen ? t('widget.closeChat') : t('widget.openChat')}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageSquare className="h-6 w-6 text-white" />
        )}
      </button>
    </div>
  );
}

function WidgetHeader({
  botName,
  primaryColor,
  logoUrl,
  onClose,
  showClose,
  t,
  subtext,
  agentsOnline,
}: {
  botName: string;
  primaryColor: string;
  logoUrl?: string;
  onClose: () => void;
  showClose: boolean;
  t: TranslateFunction;
  subtext?: string;
  agentsOnline?: boolean;
}): React.ReactNode {
  return (
    <div
      className="flex items-center justify-between px-4 py-3"
      style={{ backgroundColor: primaryColor }}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <MessageSquare className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{botName}</p>
          <p className="flex items-center gap-1.5 text-xs text-white/70">
            {agentsOnline && (
              <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
            )}
            {subtext || t('widget.online')}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {logoUrl && (
          <img
            src={logoUrl}
            alt={botName}
            className="h-7 max-w-[90px] object-contain"
          />
        )}
        {showClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            aria-label={t('widget.close')}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

const MessageList = ({
  messages,
  isTyping,
  agentTyping,
  primaryColor,
  ref,
  handoffForm,
  queuePosition,
  i18nLang,
  choiceButtons,
  chatEndedButton,
}: {
  messages: Message[];
  isTyping: boolean;
  agentTyping: boolean;
  primaryColor: string;
  ref: React.RefObject<HTMLDivElement | null>;
  handoffForm?: React.ReactNode;
  queuePosition?: number | null;
  i18nLang?: string;
  choiceButtons?: React.ReactNode;
  chatEndedButton?: React.ReactNode;
}): React.ReactNode => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn(
            "flex",
            msg.role === "user" ? "justify-end" : "justify-start"
          )}
        >
          <div
            className={cn(
              "max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed",
              msg.role === "user"
                ? "rounded-br-md text-white"
                : "rounded-bl-md bg-muted text-foreground"
            )}
            style={
              msg.role === "user"
                ? { backgroundColor: primaryColor }
                : undefined
            }
          >
            {msg.role === "agent" && (
              <p className="text-[10px] font-medium text-primary mb-0.5">
                {i18nLang === "nb" ? "Medarbeider" : "Agent"}
              </p>
            )}
            <SimpleMarkdown text={msg.content} />
          </div>
        </div>
      ))}
      {choiceButtons}
      {chatEndedButton}
      {queuePosition != null && queuePosition > 0 && (
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-bl-md bg-muted/60 px-4 py-2 text-xs text-muted-foreground">
            {i18nLang === "nb" ? `Du er nr. ${queuePosition} i køen` : `You are #${queuePosition} in the queue`}
          </div>
        </div>
      )}
      {handoffForm}
      {(isTyping || agentTyping) && (
        <div className="flex justify-start">
          <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-muted px-4 py-3">
            {agentTyping && (
              <span className="text-[10px] text-muted-foreground mr-1">
                {i18nLang === "nb" ? "Medarbeider skriver" : "Agent typing"}
              </span>
            )}
            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:0ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:150ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:300ms]" />
          </div>
        </div>
      )}
      <div ref={ref} />
    </div>
  );
};

const WidgetInput = ({
  value,
  onChange,
  onSend,
  primaryColor,
  ref,
  t,
  hideWatermark = false,
  placeholderText,
  onEndChat,
  i18nLang,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  primaryColor: string;
  ref: React.RefObject<HTMLInputElement | null>;
  t: TranslateFunction;
  hideWatermark?: boolean;
  placeholderText?: string;
  onEndChat?: () => void;
  i18nLang?: string;
}): React.ReactNode => {
  return (
    <div className="border-t p-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
        className="flex items-center gap-2"
      >
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholderText || t('widget.placeholder')}
          className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white transition-all duration-150 hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: primaryColor }}
          aria-label={t('widget.sendLabel')}
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
      {onEndChat && (
        <div className="pt-1 text-center">
          <button
            type="button"
            onClick={onEndChat}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            {i18nLang === "nb" ? "↻ Start ny chat" : "↻ Start new chat"}
          </button>
        </div>
      )}
      {!hideWatermark && (
        <div className="px-3 pb-1.5 pt-0.5 text-center">
          <a
            href="https://chatpulse.no"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-muted-foreground/70 hover:text-muted-foreground transition-colors"
          >
            {t('widget.poweredBy')}
          </a>
        </div>
      )}
    </div>
  );
};

function HandoffForm({
  primaryColor,
  onSubmit,
  t,
}: {
  primaryColor: string;
  onSubmit: (email: string, name: string) => Promise<void>;
  t: TranslateFunction;
}): React.ReactNode {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || submitting) return;
    setSubmitting(true);
    await onSubmit(email.trim(), name.trim());
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-muted p-3">
        <form onSubmit={handleSubmit} className="space-y-2">
          <p className="text-xs font-medium text-foreground">
            {t('widget.handoffHeading')}
          </p>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('widget.emailPlaceholder')}
            className="w-full rounded-lg border bg-background px-3 py-1.5 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('widget.namePlaceholder')}
            className="w-full rounded-lg border bg-background px-3 py-1.5 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
          <button
            type="submit"
            disabled={!email.trim() || submitting}
            className="w-full rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: primaryColor }}
          >
            {submitting ? t('widget.sending') : t('widget.send')}
          </button>
        </form>
      </div>
    </div>
  );
}

/** Lightweight markdown: bold, italic, bullet lists, line breaks */
function SimpleMarkdown({ text }: { text: string }): React.ReactNode {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  function flushList() {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="my-1 ml-4 list-disc space-y-0.5">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const bulletMatch = line.match(/^\s*[-*•]\s+(.*)/);
    if (bulletMatch) {
      listItems.push(<li key={`li-${i}`}>{inlineFormat(bulletMatch[1])}</li>);
    } else {
      flushList();
      if (line.trim() === "") {
        if (i > 0 && i < lines.length - 1) {
          elements.push(<br key={`br-${i}`} />);
        }
      } else {
        if (elements.length > 0) {
          elements.push(<br key={`br-${i}`} />);
        }
        elements.push(<span key={`s-${i}`}>{inlineFormat(line)}</span>);
      }
    }
  }
  flushList();

  return <>{elements}</>;
}

function inlineFormat(text: string): React.ReactNode {
  // Bold **text** or __text__
  // Italic *text* or _text_
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold: **...**
    const boldMatch = remaining.match(/^([\s\S]*?)\*\*([\s\S]+?)\*\*([\s\S]*)/);
    if (boldMatch) {
      if (boldMatch[1]) parts.push(<span key={key++}>{boldMatch[1]}</span>);
      parts.push(<strong key={key++}>{boldMatch[2]}</strong>);
      remaining = boldMatch[3];
      continue;
    }
    // Italic: *...*
    const italicMatch = remaining.match(/^([\s\S]*?)\*([\s\S]+?)\*([\s\S]*)/);
    if (italicMatch) {
      if (italicMatch[1]) parts.push(<span key={key++}>{italicMatch[1]}</span>);
      parts.push(<em key={key++}>{italicMatch[2]}</em>);
      remaining = italicMatch[3];
      continue;
    }
    parts.push(<span key={key++}>{remaining}</span>);
    break;
  }

  return <>{parts}</>;
}
