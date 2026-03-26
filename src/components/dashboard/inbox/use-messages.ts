import { useState, useEffect, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

export interface InboxMessage {
  id: string;
  role: string;
  content: string;
  created_at: string;
  metadata?: { internal_note?: boolean } | null;
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

export function useMessages(selectedId: string | null) {
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
