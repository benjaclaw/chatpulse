import { useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Language } from "@/lib/i18n";

interface Message {
  id: string;
  role: "user" | "assistant" | "agent";
  content: string;
}

export function useRealtimeSubscription(
  i18nLang: Language,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setAgentTyping: (v: boolean) => void,
  setQueuePosition: (v: number | null) => void,
  setLiveChatMode: (v: boolean) => void,
  setChatEnded: (v: boolean) => void,
  setHasInteracted: (v: boolean) => void,
  conversationIdRef: React.MutableRefObject<string | null>,
  typingTimeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
  realtimeChannelRef: React.MutableRefObject<ReturnType<ReturnType<typeof createClient>["channel"]> | null>,
  typingChannelRef: React.MutableRefObject<ReturnType<ReturnType<typeof createClient>["channel"]> | null>
) {
  const subscribeToRealtime = useCallback((conversationId: string) => {
    const supabase = createClient();

    // Message subscription via broadcast
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
  }, [i18nLang, setMessages, setAgentTyping, setQueuePosition, setLiveChatMode, setChatEnded, setHasInteracted, conversationIdRef, typingTimeoutRef, realtimeChannelRef, typingChannelRef]);

  return subscribeToRealtime;
}
