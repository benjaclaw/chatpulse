"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { createT, type Language, type TranslateFunction } from "@/lib/i18n";

interface Message {
  id: string;
  role: "user" | "assistant";
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
    if (welcomeMessage) {
      return [{ id: "welcome", role: "assistant", content: welcomeMessage }];
    }
    return defaultMessages;
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [handoffTriggered, setHandoffTriggered] = useState(false);
  const [handoffSubmitted, setHandoffSubmitted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const conversationIdRef = useRef<string | null>(null);
  const workspaceIdRef = useRef<string | null>(null);

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
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  }, [isOpen]);

  // Update messages when welcomeMessage changes (for live preview)
  useEffect(() => {
    if (welcomeMessage !== undefined) {
      setMessages([
        { id: "welcome", role: "assistant", content: welcomeMessage || t('widget.fallbackWelcome') },
      ]);
    }
  }, [welcomeMessage]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
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
          if (data.handoff && !handoffTriggered) {
            setHandoffTriggered(true);
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
        />
        <MessageList
          messages={messages}
          isTyping={isTyping}
          primaryColor={primaryColor}
          ref={messagesEndRef}
          handoffForm={
            handoffTriggered && !handoffSubmitted ? (
              <HandoffForm
                primaryColor={primaryColor}
                t={t}
                onSubmit={async (email, name) => {
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
                  setMessages((prev) => [
                    ...prev,
                    { id: `handoff-confirm-${Date.now()}`, role: "assistant", content: t('widget.handoffConfirm') },
                  ]);
                }}
              />
            ) : null
          }
        />
        <WidgetInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          primaryColor={primaryColor}
          ref={inputRef}
          t={t}
          hideWatermark={hideWatermark}
          placeholderText={placeholder}
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
        />
        <MessageList
          messages={messages}
          isTyping={isTyping}
          primaryColor={primaryColor}
          ref={messagesEndRef}
          handoffForm={
            handoffTriggered && !handoffSubmitted ? (
              <HandoffForm
                primaryColor={primaryColor}
                t={t}
                onSubmit={async (email, name) => {
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
                  setMessages((prev) => [
                    ...prev,
                    { id: `handoff-confirm-${Date.now()}`, role: "assistant", content: t('widget.handoffConfirm') },
                  ]);
                }}
              />
            ) : null
          }
        />
        <WidgetInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          primaryColor={primaryColor}
          ref={inputRef}
          t={t}
          hideWatermark={hideWatermark}
          placeholderText={placeholder}
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
}: {
  botName: string;
  primaryColor: string;
  logoUrl?: string;
  onClose: () => void;
  showClose: boolean;
  t: TranslateFunction;
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
          <p className="text-xs text-white/70">{t('widget.online')}</p>
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
  primaryColor,
  ref,
  handoffForm,
}: {
  messages: Message[];
  isTyping: boolean;
  primaryColor: string;
  ref: React.RefObject<HTMLDivElement | null>;
  handoffForm?: React.ReactNode;
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
            <SimpleMarkdown text={msg.content} />
          </div>
        </div>
      ))}
      {handoffForm}
      {isTyping && (
        <div className="flex justify-start">
          <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-muted px-4 py-3">
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
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  primaryColor: string;
  ref: React.RefObject<HTMLInputElement | null>;
  t: TranslateFunction;
  hideWatermark?: boolean;
  placeholderText?: string;
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
