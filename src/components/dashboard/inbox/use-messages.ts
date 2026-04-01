import { useState, useEffect, useRef, useMemo, type Dispatch, type SetStateAction, type RefObject } from "react";
import { createClient } from "@/lib/supabase/client";
import { playNotificationSound } from "@/lib/notification-sound";

export interface InboxMessage {
  id: string;
  role: string;
  content: string;
  created_at: string;
  metadata?: { internal_note?: boolean } | null;
}

interface UseMessagesReturn {
  messages: InboxMessage[];
  setMessages: Dispatch<SetStateAction<InboxMessage[]>>;
  visibleMessages: InboxMessage[];
  visitorTyping: boolean;
  showNotes: boolean;
  setShowNotes: Dispatch<SetStateAction<boolean>>;
  selectedLeadInfo: { name?: string; email?: string } | null;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

export function useMessages(selectedId: string | null): UseMessagesReturn {
  const supabase = createClient();
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [visitorTyping, setVisitorTyping] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [selectedLeadInfo, setSelectedLeadInfo] = useState<{ name?: string; email?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!selectedId) { setMessages([]); return; }

    async function loadMessages() {
      const { data } = await supabase
        .from("messages")
        .select("id, role, content, created_at, metadata")
        .eq("conversation_id", selectedId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data as InboxMessage[]);

      const { data: leadData } = await supabase
        .from("leads")
        .select("name, email")
        .eq("conversation_id", selectedId!)
        .maybeSingle();
      setSelectedLeadInfo(leadData ? { name: leadData.name ?? undefined, email: leadData.email ?? undefined } : null);
    }

    loadMessages();

    const channel = supabase
      .channel(`inbox-messages-${selectedId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${selectedId}` }, (payload) => {
        const msg = payload.new as InboxMessage;
        setMessages((prev) => {
          const withoutTemp = prev.filter((m) => !(m.id.startsWith("temp-") && m.role === msg.role && m.content === msg.content));
          if (withoutTemp.some((m) => m.id === msg.id)) return withoutTemp;
          return [...withoutTemp, msg];
        });
        if (msg.role === "user" && document.hidden) playNotificationSound();
      })
      .subscribe();

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
    if (el?.parentElement) el.parentElement.scrollTop = el.parentElement.scrollHeight;
  }, [messages, visitorTyping]);

  const visibleMessages = useMemo(() =>
    showNotes ? messages : messages.filter((m) => !(m.metadata?.internal_note)),
    [showNotes, messages]
  );

  return { messages, setMessages, visibleMessages, visitorTyping, showNotes, setShowNotes, selectedLeadInfo, messagesEndRef };
}
