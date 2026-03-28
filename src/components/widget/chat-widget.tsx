"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageSquare, X, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { createT, type Language } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { WidgetHeader } from "./widget-header";
import { WidgetInput } from "./widget-input";
import { MessageList } from "./widget-messages";
import { HandoffForm } from "./handoff-form";
import { useRealtimeSubscription } from "./use-realtime";

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
  logoUrl?: string;
  inline?: boolean;
  className?: string;
  chatbotId?: string;
  language?: string;
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
  nb: "Skriv en melding\u2026",
  en: "Type a message\u2026",
  sv: "Skriv ett meddelande\u2026",
  da: "Skriv en besked\u2026",
  de: "Nachricht schreiben\u2026",
  fr: "\u00C9crivez un message\u2026",
  es: "Escribe un mensaje\u2026",
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

  const personalizedWelcome = botName && botName !== "ChatPulse"
    ? `Hei! Jeg er ${botName}. Hvordan kan jeg hjelpe?`
    : t('widget.defaultWelcome');
  const defaultMessages: Message[] = [
    { id: "welcome", role: "assistant", content: personalizedWelcome },
  ];
  const demoReplies = [t('widget.demo1'), t('widget.demo2'), t('widget.demo3'), t('widget.demo4')];

  const [isOpen, setIsOpen] = useState(inline);
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = sessionStorage.getItem("chatpulse_messages");
      if (saved) {
        const parsed = JSON.parse(saved) as Message[];
        if (parsed.length > 0) return parsed;
      }
    } catch { /* sessionStorage may be unavailable in embedded widget iframes */ }
    if (welcomeMessage) return [{ id: "welcome", role: "assistant", content: welcomeMessage }];
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
  const [limitReached, setLimitReached] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [closedConversationId, setClosedConversationId] = useState<string | null>(null);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(() => {
    try {
      const saved = sessionStorage.getItem("chatpulse_messages");
      if (saved) return (JSON.parse(saved) as Message[]).some((m) => m.role === "user");
    } catch { /* sessionStorage may be unavailable in embedded widget iframes */ }
    return false;
  });

  const unreadRef = useRef(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const conversationIdRef = useRef<string | null>(null);
  const workspaceIdRef = useRef<string | null>(null);
  const pendingLiveChatRef = useRef<{ conversationId: string; workspaceId?: string } | null>(null);
  const realtimeChannelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);
  const typingChannelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const subscribeToRealtime = useRealtimeSubscription(
    i18nLang, setMessages, setAgentTyping, setQueuePosition,
    setLiveChatMode, setChatEnded, setHasInteracted,
    conversationIdRef, typingTimeoutRef, realtimeChannelRef, typingChannelRef,
    setClosedConversationId
  );

  // Remove iframe loading placeholder once config is loaded (not just on mount)
  useEffect(() => {
    if (configLoaded) {
      document.getElementById("widget-loader")?.remove();
    }
  }, [configLoaded]);

  // Persist messages to sessionStorage
  useEffect(() => {
    try {
      if (messages.length > 1 || (messages.length === 1 && messages[0].id !== "welcome")) {
        sessionStorage.setItem("chatpulse_messages", JSON.stringify(messages.slice(-50)));
      }
    } catch { /* sessionStorage may be unavailable in embedded widget iframes */ }
  }, [messages]);

  const hasMounted = useRef(false);
  const prevMsgCountRef = useRef(messages.length);
  useEffect(() => {
    if (!hasMounted.current) { hasMounted.current = true; prevMsgCountRef.current = messages.length; return; }
    // Track unread messages from bot/agent when widget is minimized
    if (!isOpen && !inline && messages.length > prevMsgCountRef.current) {
      const newMsgs = messages.slice(prevMsgCountRef.current);
      const botMsgs = newMsgs.filter((m) => m.role === "assistant" || m.role === "agent");
      if (botMsgs.length > 0) {
        unreadRef.current += botMsgs.length;
        try { window.parent.postMessage({ type: "chatpulse:unread", count: unreadRef.current }, "*"); } catch { /* cross-origin */ }
      }
    }
    prevMsgCountRef.current = messages.length;
    const el = messagesEndRef.current;
    if (el?.parentElement) el.parentElement.scrollTo({ top: el.parentElement.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping, agentTyping, isOpen, inline]);

  // Track scroll position to show/hide scroll-to-bottom button
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100);
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus({ preventScroll: true });
    if (isOpen && unreadRef.current > 0) {
      unreadRef.current = 0;
      try { window.parent.postMessage({ type: "chatpulse:unread", count: 0 }, "*"); } catch { /* cross-origin */ }
    }
    if (isOpen && chatbotId && !configLoaded) {
      setConfigLoading(true);
      fetch(`/api/widget-config?chatbotId=${encodeURIComponent(chatbotId)}`)
        .then((r) => r.json())
        .then((data: { workspaceId?: string; agentsOnline?: boolean }) => {
          if (data.workspaceId) workspaceIdRef.current = data.workspaceId;
          setAgentsOnline(!!data.agentsOnline);
          setConfigLoaded(true);
        })
        .catch((err) => console.error('Widget config fetch failed:', err))
        .finally(() => setConfigLoading(false));
    }
  }, [isOpen, chatbotId, configLoaded]);

  useEffect(() => {
    if (welcomeMessage !== undefined) {
      setMessages([{ id: "welcome", role: "assistant", content: welcomeMessage || t('widget.fallbackWelcome') }]);
    }
  }, [welcomeMessage]);

  // Restore live chat session from sessionStorage on mount
  useEffect(() => {
    try {
      const savedMode = sessionStorage.getItem("chatpulse_live_chat_mode");
      const savedConvId = sessionStorage.getItem("chatpulse_conversation_id");
      const savedWsId = sessionStorage.getItem("chatpulse_workspace_id");
      if (savedMode === "true" && savedConvId) {
        const visitorId = getVisitorId();
        fetch(`/api/widget-session?conversationId=${encodeURIComponent(savedConvId)}&visitorId=${encodeURIComponent(visitorId)}`)
          .then((r) => { if (!r.ok) throw new Error("not found"); return r.json(); })
          .then((data: { status: string; messages: { id: string; role: string; content: string }[] }) => {
            if (data.status === "closed") {
              sessionStorage.removeItem("chatpulse_live_chat_mode");
              sessionStorage.removeItem("chatpulse_conversation_id");
              sessionStorage.removeItem("chatpulse_workspace_id");
              return;
            }
            if (data.status === "ai") {
              sessionStorage.removeItem("chatpulse_live_chat_mode");
              sessionStorage.removeItem("chatpulse_conversation_id");
              sessionStorage.removeItem("chatpulse_workspace_id");
              return;
            }
            conversationIdRef.current = savedConvId;
            if (savedWsId) workspaceIdRef.current = savedWsId;
            if (data.messages.length > 0) {
              setMessages(data.messages.map((m) => ({ id: m.id, role: m.role as Message["role"], content: m.content })));
            }
            setLiveChatMode(true);
            subscribeToRealtime(savedConvId);
            if (savedWsId) fetchQueuePosition(savedConvId, savedWsId);
          })
          .catch(() => {
            sessionStorage.removeItem("chatpulse_live_chat_mode");
            sessionStorage.removeItem("chatpulse_conversation_id");
            sessionStorage.removeItem("chatpulse_workspace_id");
          });
      }
    } catch { /* sessionStorage not available */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (realtimeChannelRef.current) { const sb = createClient(); sb.removeChannel(realtimeChannelRef.current); }
      if (typingChannelRef.current) { const sb = createClient(); sb.removeChannel(typingChannelRef.current); }
    };
  }, []);

  const fetchQueuePosition = useCallback(async (conversationId: string, wsId: string) => {
    try {
      const res = await fetch(`/api/widget-queue?conversationId=${encodeURIComponent(conversationId)}&visitorId=${encodeURIComponent(getVisitorId())}`);
      if (res.ok) { const data = await res.json() as { position: number }; setQueuePosition(data.position > 0 ? data.position : null); }
    } catch (err) { console.error('Queue position fetch failed:', err); }
  }, []);

  const sendVisitorTyping = useCallback(() => {
    if (typingChannelRef.current) {
      typingChannelRef.current.send({ type: "broadcast", event: "typing", payload: { from: "visitor" } });
    }
  }, []);

  async function handleSend(overrideText?: string) {
    const text = overrideText?.trim() || input.trim();
    if (!text || isTyping || limitReached) return;
    setHasInteracted(true);
    const userMsg: Message = { id: `user-${Date.now()}`, role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    if (!overrideText) setInput("");

    if (liveChatMode && conversationIdRef.current) {
      try {
        const res = await fetch("/api/live-chat", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId: conversationIdRef.current, content: text, role: "user", visitorId: getVisitorId() }),
        });
        if (res.status === 410) {
          setLiveChatMode(false); conversationIdRef.current = null; setHasInteracted(false);
          try { sessionStorage.removeItem("chatpulse_live_chat_mode"); sessionStorage.removeItem("chatpulse_conversation_id"); sessionStorage.removeItem("chatpulse_workspace_id"); } catch { /* sessionStorage may be unavailable in embedded widget iframes */ }
          setMessages((prev) => [...prev, { id: `closed-${Date.now()}`, role: "assistant", content: t('widget.conversationEnded') }]);
          return;
        }
      } catch {
        setMessages((prev) => [...prev, { id: `err-${Date.now()}`, role: "assistant", content: t('widget.error') }]);
      }
      return;
    }

    setIsTyping(true);
    if (chatbotId) {
      try {
        const visitorId = getVisitorId();
        const res = await fetch("/api/chat", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatbotId, conversationId: conversationIdRef.current, message: text, visitorId, language: language || undefined }),
        });
        const data = await res.json();
        if (res.ok && data.response) {
          conversationIdRef.current = data.conversationId;
          if (data.workspaceId) workspaceIdRef.current = data.workspaceId;
          setMessages((prev) => [...prev, { id: `bot-${Date.now()}`, role: "assistant", content: data.response }]);
          if (data.limitReached) {
            setLimitReached(true);
          }
          if (data.handoff && !handoffTriggered) {
            setHandoffTriggered(true);
            if (data.liveChat && data.conversationId) {
              pendingLiveChatRef.current = { conversationId: data.conversationId, workspaceId: data.workspaceId };
            }
          }
        } else {
          setMessages((prev) => [...prev, { id: `bot-${Date.now()}`, role: "assistant", content: t('widget.error') }]);
        }
      } catch {
        setMessages((prev) => [...prev, { id: `bot-${Date.now()}`, role: "assistant", content: t('widget.error') }]);
      } finally { setIsTyping(false); }
    } else {
      setTimeout(() => {
        const reply = demoReplies[Math.floor(Math.random() * demoReplies.length)];
        setMessages((prev) => [...prev, { id: `bot-${Date.now()}`, role: "assistant", content: reply }]);
        setIsTyping(false);
      }, 1000 + Math.random() * 500);
    }
  }

  async function handleHandoffSubmit(email: string, name: string) {
    if (!email.trim() || !name.trim()) return;
    setHandoffSubmitted(true);

    try {
      // Single atomic API call — server handles everything
      const res = await fetch("/api/handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          botId: chatbotId,
          visitorId: getVisitorId(),
          conversationId: conversationIdRef.current, // Use existing if available
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || `HTTP ${res.status}`);
      }

      const { conversationId, workspaceId } = await res.json();

      // Update refs and session
      conversationIdRef.current = conversationId;
      workspaceIdRef.current = workspaceId;

      // Activate live chat
      setLiveChatMode(true);
      try {
        sessionStorage.setItem("chatpulse_live_chat_mode", "true");
        sessionStorage.setItem("chatpulse_conversation_id", conversationId);
        sessionStorage.setItem("chatpulse_workspace_id", workspaceId);
      } catch {}

      // Show success and setup realtime
      setMessages((prev) => [...prev, 
        { id: `handoff-confirm-${Date.now()}`, role: "assistant", content: t('widget.handoffConnecting').replace('{name}', name || email) }
      ]);

      subscribeToRealtime(conversationId);
      fetchQueuePosition(conversationId, workspaceId);

      // Cleanup
      const pending = pendingLiveChatRef.current;
      if (pending) {
        pendingLiveChatRef.current = null;
      }
    } catch (err) {
      console.error("Handoff error:", err);
      setMessages((prev) => [...prev, 
        { id: `error-${Date.now()}`, role: "assistant", content: t('widget.error') }
      ]);
      setHandoffSubmitted(false);
    }
  }

  // Show choice buttons only if: agents are online, not in live chat, and user hasn't sent a message in THIS conversation (welc + 0 user msgs = show)
  const userMessagesInThisSession = messages.filter((m) => m.role === "user").length;
  const showChoices = agentsOnline && !liveChatMode && !handoffTriggered && !configLoading && userMessagesInThisSession === 0;
  const choiceButtons = showChoices ? (
    <div className="flex flex-col gap-2 px-1">
      <button type="button" onClick={() => { inputRef.current?.focus(); inputRef.current?.scrollIntoView({ behavior: "smooth" }); if (inputRef.current) { inputRef.current.style.borderColor = primaryColor; inputRef.current.style.boxShadow = `0 0 0 2px ${primaryColor}33`; setTimeout(() => { if (inputRef.current) { inputRef.current.style.borderColor = ""; inputRef.current.style.boxShadow = ""; } }, 2000); } }} className="rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:bg-opacity-10" style={{ borderColor: primaryColor, color: primaryColor }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = primaryColor + "1a")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
        {t('widget.askQuestion')}
      </button>
      <button type="button" onClick={() => setHandoffTriggered(true)} className="rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:bg-opacity-10" style={{ borderColor: primaryColor, color: primaryColor }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = primaryColor + "1a")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
        {t('widget.talkToPerson')}
      </button>
    </div>
  ) : null;

  const headerSubtext = liveChatMode ? "Live chat" : agentsOnline ? t('widget.supportOnline') : t('widget.aiAssistant');

  async function handleRating(rating: "good" | "ok" | "bad") {
    if (!closedConversationId) return;
    setRatingSubmitted(true);
    try {
      await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: closedConversationId, rating }),
      });
    } catch {
      // Best-effort, don't block the UI
    }
  }

  const csatWidget = chatEnded && closedConversationId && !ratingSubmitted ? (
    <div className="flex flex-col items-center gap-2 py-3 px-2">
      <p className="text-sm text-muted-foreground text-center">{t('widget.csatPrompt')}</p>
      <div className="flex gap-2 justify-center flex-wrap">
        <button type="button" onClick={() => handleRating("bad")} className="flex flex-col items-center gap-1 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted flex-1 min-w-20" title={t('widget.csatBad')}>
          <span className="text-xl">😞</span>
          <span className="text-xs text-muted-foreground">{t('widget.csatBad')}</span>
        </button>
        <button type="button" onClick={() => handleRating("ok")} className="flex flex-col items-center gap-1 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted flex-1 min-w-20" title={t('widget.csatOk')}>
          <span className="text-xl">😐</span>
          <span className="text-xs text-muted-foreground">{t('widget.csatOk')}</span>
        </button>
        <button type="button" onClick={() => handleRating("good")} className="flex flex-col items-center gap-1 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted flex-1 min-w-20" title={t('widget.csatGood')}>
          <span className="text-xl">😊</span>
          <span className="text-xs text-muted-foreground">{t('widget.csatGood')}</span>
        </button>
      </div>
    </div>
  ) : chatEnded && ratingSubmitted ? (
    <p className="py-2 text-center text-sm text-muted-foreground px-2">{t('widget.csatThanks')}</p>
  ) : null;

  const resetChat = async () => {
    // Close conversation if it exists and is still waiting
    const convId = conversationIdRef.current;
    if (convId) {
      try {
        await fetch("/api/live-chat/close", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId: convId }),
        });
      } catch (err) {
        console.error("Failed to close conversation:", err);
      }
    }
    
    setLiveChatMode(false); conversationIdRef.current = null; setHasInteracted(false); setChatEnded(false); setHandoffTriggered(false); setHandoffSubmitted(false); pendingLiveChatRef.current = null; setClosedConversationId(null); setRatingSubmitted(false);
    try { sessionStorage.removeItem('chatpulse_live_chat_mode'); sessionStorage.removeItem('chatpulse_conversation_id'); sessionStorage.removeItem('chatpulse_workspace_id'); sessionStorage.removeItem('chatpulse_messages'); } catch { /* sessionStorage may be unavailable in embedded widget iframes */ }
    setMessages([{ id: 'welcome', role: 'assistant' as const, content: welcomeMessage || t('widget.defaultWelcome') }]);
  };

  const handleRestartChat = async () => {
    // Close conversation if it exists
    const convId = conversationIdRef.current;
    if (convId) {
      try {
        await fetch("/api/live-chat/close", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId: convId }),
        });
      } catch (err) {
        console.error("Failed to close conversation:", err);
      }
    }
    // Reset state
    setChatEnded(false);
    setHasInteracted(false);
    setHandoffTriggered(false);
    setHandoffSubmitted(false);
    conversationIdRef.current = null;
    setMessages([{ id: "welcome", role: "assistant", content: welcomeMessage || t('widget.defaultWelcome') }]);
    try { sessionStorage.removeItem("chatpulse_messages"); sessionStorage.removeItem('chatpulse_conversation_id'); } catch { /* sessionStorage may be unavailable */ }
  };

  const restartButton = chatEnded ? (
    <div className="flex justify-center py-2">
      <button onClick={handleRestartChat} className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted" style={{ borderColor: primaryColor, color: primaryColor }}>
        {t('widget.startNewChat')}
      </button>
    </div>
  ) : null;

  const handoffForm = handoffTriggered && !handoffSubmitted ? <HandoffForm primaryColor={primaryColor} t={t} onSubmit={handleHandoffSubmit} /> : null;

  const sharedContent = (
    <>
      <WidgetHeader botName={botName} primaryColor={primaryColor} logoUrl={logoUrl} onClose={() => setIsOpen(false)} showClose={!inline} t={t} subtext={headerSubtext} agentsOnline={agentsOnline} />
      {configLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-current" style={{ color: primaryColor }} />
        </div>
      ) : (
        <>
          <div className="relative flex flex-col flex-1 overflow-hidden">
            <MessageList messages={messages} isTyping={isTyping} agentTyping={agentTyping} primaryColor={primaryColor} ref={messagesEndRef} queuePosition={queuePosition} i18nLang={i18nLang} handoffForm={handoffForm} choiceButtons={choiceButtons} csatWidget={csatWidget} chatEndedButton={restartButton} scrollContainerRef={scrollContainerRef} />
            {showScrollBtn && (
              <button
                type="button"
                onClick={() => messagesEndRef.current?.parentElement?.scrollTo({ top: messagesEndRef.current.parentElement.scrollHeight, behavior: "smooth" })}
                className="absolute bottom-2 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-card border shadow-md transition-opacity hover:bg-muted"
                aria-label="Scroll to bottom"
              >
                <ArrowDown className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <WidgetInput value={input} onChange={(v) => { setInput(v); if (liveChatMode) sendVisitorTyping(); }} onSend={handleSend} primaryColor={primaryColor} ref={inputRef} t={t} hideWatermark={hideWatermark} placeholderText={placeholder} i18nLang={i18nLang} onEndChat={messages.length > 1 ? resetChat : undefined} disabled={limitReached} disabledMessage={limitReached ? "Chatboten har nådd meldingsgrensen for denne perioden." : undefined} agentsOnline={agentsOnline} liveChatMode={liveChatMode} />
        </>
      )}
    </>
  );

  if (inline) {
    return (
      <div className={cn("flex flex-col overflow-hidden rounded-xl border bg-card shadow-lg", !className?.includes("h-") && "h-[420px]", className)}>
        {sharedContent}
      </div>
    );
  }

  return (
    <div className={cn("fixed bottom-5 z-50", position === "right" ? "right-5" : "left-5", className)}>
      <div className={cn("mb-3 flex flex-col overflow-hidden rounded-xl border bg-card shadow-lg transition-all duration-300", isOpen ? "h-[480px] w-[360px] scale-100 opacity-100" : "pointer-events-none h-0 w-[360px] scale-95 opacity-0")}>
        {sharedContent}
      </div>
      <button onClick={() => setIsOpen(!isOpen)} className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl" style={{ backgroundColor: primaryColor }} aria-label={isOpen ? t('widget.closeChat') : t('widget.openChat')}>
        {isOpen ? <X className="h-6 w-6 text-white" /> : <MessageSquare className="h-6 w-6 text-white" />}
      </button>
    </div>
  );
}
