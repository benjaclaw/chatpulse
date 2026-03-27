import { cn } from "@/lib/utils";
import { createT, type Language } from "@/lib/i18n";

interface Message {
  id: string;
  role: "user" | "assistant" | "agent";
  content: string;
}

export const MessageList = ({
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
  scrollContainerRef,
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
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}): React.ReactNode => {
  const t = createT((i18nLang === "nb" || i18nLang === "en" ? i18nLang : "nb") as Language);

  return (
    <div ref={scrollContainerRef} role="log" aria-live="polite" aria-label="Chatmeldinger" className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn(
            "flex animate-[fadeInUp_0.3s_ease-out]",
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
                {t('widget.agentLabel')}
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
            {t('widget.queuePosition').replace('{position}', String(queuePosition))}
          </div>
        </div>
      )}
      {handoffForm}
      {(isTyping || agentTyping) && (
        <div className="flex justify-start">
          <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-muted px-4 py-3">
            {agentTyping && (
              <span className="text-[10px] text-muted-foreground mr-1">
                {t('widget.agentTyping')}
              </span>
            )}
            <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-[typingPulse_1.4s_ease-in-out_infinite_0ms]" />
            <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-[typingPulse_1.4s_ease-in-out_infinite_200ms]" />
            <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-[typingPulse_1.4s_ease-in-out_infinite_400ms]" />
          </div>
        </div>
      )}
      <div ref={ref} />
    </div>
  );
};

/** Lightweight markdown: bold, italic, bullet lists, line breaks */
export function SimpleMarkdown({ text }: { text: string }): React.ReactNode {
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
    const bulletMatch = line.match(/^\s*[-*\u2022]\s+(.*)/);
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

const LINK_RE =
  /(https?:\/\/[^\s]+)|([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})|(\+?\d[\d\s\-]{6,14}\d)/g;

/** Split text into plain segments and auto-linked segments (URLs, emails, phone numbers) */
function autoLink(text: string, startKey: number): { nodes: React.ReactNode[]; nextKey: number } {
  const nodes: React.ReactNode[] = [];
  let k = startKey;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  LINK_RE.lastIndex = 0;
  while ((m = LINK_RE.exec(text)) !== null) {
    if (m.index > lastIndex) {
      nodes.push(<span key={k++}>{text.slice(lastIndex, m.index)}</span>);
    }
    const matched = m[0];
    if (m[1]) {
      // URL
      nodes.push(
        <a key={k++} href={matched} target="_blank" rel="noopener noreferrer" className="text-primary underline">
          {matched}
        </a>,
      );
    } else if (m[2]) {
      // Email
      nodes.push(
        <a key={k++} href={`mailto:${matched}`} className="text-primary underline">
          {matched}
        </a>,
      );
    } else if (m[3]) {
      // Phone
      const digits = matched.replace(/[\s\-]/g, "");
      nodes.push(
        <a key={k++} href={`tel:${digits}`} className="text-primary underline">
          {matched}
        </a>,
      );
    }
    lastIndex = m.index + matched.length;
  }
  if (lastIndex < text.length) {
    nodes.push(<span key={k++}>{text.slice(lastIndex)}</span>);
  }
  return { nodes, nextKey: k };
}

export function inlineFormat(text: string): React.ReactNode {
  // Bold **text** or __text__
  // Italic *text* or _text_
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold: **...**
    const boldMatch = remaining.match(/^([\s\S]*?)\*\*([\s\S]+?)\*\*([\s\S]*)/);
    if (boldMatch) {
      if (boldMatch[1]) {
        const { nodes, nextKey } = autoLink(boldMatch[1], key);
        parts.push(...nodes);
        key = nextKey;
      }
      parts.push(<strong key={key++}>{boldMatch[2]}</strong>);
      remaining = boldMatch[3];
      continue;
    }
    // Italic: *...*
    const italicMatch = remaining.match(/^([\s\S]*?)\*([\s\S]+?)\*([\s\S]*)/);
    if (italicMatch) {
      if (italicMatch[1]) {
        const { nodes, nextKey } = autoLink(italicMatch[1], key);
        parts.push(...nodes);
        key = nextKey;
      }
      parts.push(<em key={key++}>{italicMatch[2]}</em>);
      remaining = italicMatch[3];
      continue;
    }
    const { nodes, nextKey } = autoLink(remaining, key);
    parts.push(...nodes);
    key = nextKey;
    break;
  }

  return <>{parts}</>;
}
