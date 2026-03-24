"use client";

import { useState } from "react";
import { mockConversations } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  ArrowLeft,
  User,
  Bot,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Conversation = (typeof mockConversations)[number];

export function ConversationsPageClient() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = mockConversations.find((c) => c.id === selectedId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Samtaler</h1>
        <p className="mt-1 text-muted-foreground">
          Se samtaleloggen fra chatboten din.
        </p>
      </div>

      {selected ? (
        <ConversationDetail
          conversation={selected}
          onBack={() => setSelectedId(null)}
        />
      ) : (
        <ConversationList
          conversations={mockConversations}
          onSelect={setSelectedId}
        />
      )}
    </div>
  );
}

function ConversationList({
  conversations,
  onSelect,
}: {
  conversations: Conversation[];
  onSelect: (id: string) => void;
}) {
  if (conversations.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card/50 p-8 text-center dark:bg-card/20">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <MessageSquare className="h-7 w-7 text-primary" />
        </div>
        <h3 className="mt-4 text-base font-semibold">Ingen samtaler ennå</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Samtaler vil dukke opp her når besøkende bruker chatboten din.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {conversations.map((conv) => (
        <button
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          className="flex w-full items-center gap-4 rounded-xl border bg-card p-4 text-left shadow-sm transition-all duration-200 hover:shadow-md hover:bg-muted/30"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">
                {conv.visitor_id}
              </p>
              <Badge variant="secondary" className="shrink-0">
                {conv.message_count} meldinger
              </Badge>
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {new Date(conv.started_at).toLocaleString("nb-NO", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function ConversationDetail({
  conversation,
  onBack,
}: {
  conversation: Conversation;
  onBack: () => void;
}) {
  return (
    <div>
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Tilbake til samtaler
      </Button>

      <div className="rounded-xl border bg-card shadow-sm">
        {/* Conversation header */}
        <div className="flex items-center gap-3 border-b p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">{conversation.visitor_id}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(conversation.started_at).toLocaleString("nb-NO")}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4 p-4">
          {conversation.messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "assistant" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bot className="h-3.5 w-3.5" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "rounded-br-md bg-primary text-white"
                    : "rounded-bl-md bg-muted"
                )}
              >
                {msg.content}
                <p
                  className={cn(
                    "mt-1 text-[10px]",
                    msg.role === "user"
                      ? "text-white/60"
                      : "text-muted-foreground"
                  )}
                >
                  {new Date(msg.created_at).toLocaleTimeString("nb-NO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {msg.role === "user" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
