import { cn } from "@/lib/utils";

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
            {i18nLang === "nb" ? `Du er nr. ${queuePosition} i k\u00f8en` : `You are #${queuePosition} in the queue`}
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
