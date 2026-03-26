import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export interface InboxConversation {
  id: string;
  visitor_id: string;
  status: string;
  started_at: string;
  assigned_to: string | null;
  first_message?: string;
  lead_name?: string;
  lead_email?: string;
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

export function useConversations(workspaceId: string, filter: "waiting" | "human" | "closed") {
  const supabase = createClient();
  const [conversations, setConversations] = useState<InboxConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const notifiedConversationsRef = useRef<Set<string>>(new Set());

  const loadConversations = useCallback(async () => {
    const { data } = await supabase
      .from("conversations")
      .select("id, visitor_id, status, started_at, assigned_to")
      .eq("workspace_id", workspaceId)
      .in("status", filter === "waiting" ? ["waiting"] : filter === "human" ? ["human"] : ["closed"])
      .order("started_at", { ascending: false })
      .limit(50);

    if (data) {
      setHasMore(data.length === 50);
      const convIds = data.map((c: InboxConversation) => c.id);
      const [firstMsgResult, leadsResult] = await Promise.all([
        supabase.from("messages").select("conversation_id, content")
          .in("conversation_id", convIds.length > 0 ? convIds : ["_none_"])
          .eq("role", "user").order("created_at", { ascending: true }),
        supabase.from("leads").select("conversation_id, name, email")
          .in("conversation_id", convIds.length > 0 ? convIds : ["_none_"]),
      ]);

      const firstMsgMap = new Map<string, string>();
      if (firstMsgResult.data) {
        for (const msg of firstMsgResult.data) {
          if (!firstMsgMap.has(msg.conversation_id)) firstMsgMap.set(msg.conversation_id, msg.content);
        }
      }
      const leadMap = new Map<string, { name?: string; email?: string }>();
      if (leadsResult.data) {
        for (const lead of leadsResult.data) {
          if (lead.conversation_id) leadMap.set(lead.conversation_id, { name: lead.name ?? undefined, email: lead.email ?? undefined });
        }
      }

      setConversations(data.map((c: InboxConversation) => {
        const lead = leadMap.get(c.id);
        return { ...c, first_message: firstMsgMap.get(c.id) || "", lead_name: lead?.name, lead_email: lead?.email };
      }));
    }
    setLoading(false);
  }, [workspaceId, filter]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Realtime subscription for conversations
  useEffect(() => {
    const channel = supabase
      .channel("inbox-conversations")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations", filter: `workspace_id=eq.${workspaceId}` }, (payload) => {
        const conv = payload.new as InboxConversation | undefined;
        if (payload.eventType === "INSERT" && conv?.status === "waiting") {
          if (!notifiedConversationsRef.current.has(conv.id)) {
            notifiedConversationsRef.current.add(conv.id);
            playNotificationSound();
          }
          loadConversations();
        } else if (payload.eventType === "UPDATE") {
          loadConversations();
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [workspaceId, loadConversations]);

  async function loadMore() {
    setLoadingMore(true);
    const { data } = await supabase
      .from("conversations")
      .select("id, visitor_id, status, started_at, assigned_to")
      .eq("workspace_id", workspaceId)
      .in("status", filter === "waiting" ? ["waiting"] : filter === "human" ? ["human"] : ["closed"])
      .order("started_at", { ascending: false })
      .range(conversations.length, conversations.length + 49);
    if (data) {
      const convIds = data.map((c: InboxConversation) => c.id);
      const [fmRes, ldRes] = await Promise.all([
        supabase.from("messages").select("conversation_id, content")
          .in("conversation_id", convIds.length > 0 ? convIds : ["_none_"])
          .eq("role", "user").order("created_at", { ascending: true }),
        supabase.from("leads").select("conversation_id, name, email")
          .in("conversation_id", convIds.length > 0 ? convIds : ["_none_"]),
      ]);
      const firstMsgMap = new Map<string, string>();
      if (fmRes.data) { for (const msg of fmRes.data) { if (!firstMsgMap.has(msg.conversation_id)) firstMsgMap.set(msg.conversation_id, msg.content); } }
      const leadMap = new Map<string, { name?: string; email?: string }>();
      if (ldRes.data) { for (const ld of ldRes.data) { if (ld.conversation_id) leadMap.set(ld.conversation_id, { name: ld.name ?? undefined, email: ld.email ?? undefined }); } }
      const newConvs = data.map((c: InboxConversation) => {
        const lead = leadMap.get(c.id);
        return { ...c, first_message: firstMsgMap.get(c.id) || "", lead_name: lead?.name, lead_email: lead?.email };
      });
      setConversations((prev) => [...prev, ...newConvs]);
      setHasMore(data.length === 50);
    }
    setLoadingMore(false);
  }

  return { conversations, setConversations, loading, hasMore, loadingMore, loadMore, loadConversations };
}
