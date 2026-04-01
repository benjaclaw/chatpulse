import { useState, useEffect, useCallback, useRef, type Dispatch, type SetStateAction } from "react";
import { createClient } from "@/lib/supabase/client";
import { playNotificationSound } from "@/lib/notification-sound";

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

interface UseConversationsReturn {
  conversations: InboxConversation[];
  setConversations: Dispatch<SetStateAction<InboxConversation[]>>;
  loading: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  loadMore: () => Promise<void>;
  loadConversations: () => Promise<void>;
}

/** Fetch first user messages and lead info for a batch of conversations, then merge into enriched objects. */
async function enrichConversations(
  supabase: ReturnType<typeof createClient>,
  conversations: InboxConversation[],
): Promise<InboxConversation[]> {
  const convIds = conversations.map((c) => c.id);
  const safeIds = convIds.length > 0 ? convIds : ["_none_"];

  const [msgResult, leadResult] = await Promise.all([
    supabase.from("messages").select("conversation_id, content")
      .in("conversation_id", safeIds)
      .eq("role", "user").is("deleted_at", null).order("created_at", { ascending: true }),
    supabase.from("leads").select("conversation_id, name, email")
      .in("conversation_id", safeIds),
  ]);

  const firstMsgMap = new Map<string, string>();
  if (msgResult.data) {
    for (const msg of msgResult.data) {
      if (!firstMsgMap.has(msg.conversation_id)) firstMsgMap.set(msg.conversation_id, msg.content);
    }
  }

  const leadMap = new Map<string, { name?: string; email?: string }>();
  if (leadResult.data) {
    for (const lead of leadResult.data) {
      if (lead.conversation_id) leadMap.set(lead.conversation_id, { name: lead.name ?? undefined, email: lead.email ?? undefined });
    }
  }

  return conversations.map((c) => {
    const lead = leadMap.get(c.id);
    return { ...c, first_message: firstMsgMap.get(c.id) || "", lead_name: lead?.name, lead_email: lead?.email };
  });
}

export function useConversations(workspaceId: string, filter: "waiting" | "human" | "closed"): UseConversationsReturn {
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
      .is("deleted_at", null)
      .in("status", filter === "waiting" ? ["waiting"] : filter === "human" ? ["human"] : ["closed"])
      .order("started_at", { ascending: false })
      .limit(50);

    if (data) {
      setHasMore(data.length === 50);
      setConversations(await enrichConversations(supabase, data as InboxConversation[]));
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
            // Send browser notification when tab is hidden
            if (typeof document !== "undefined" && document.hidden && typeof Notification !== "undefined" && Notification.permission === "granted") {
              try { new Notification("Ny henvendelse", { body: "En ny samtale venter i innboksen", tag: `new-conv-${conv.id}` }); } catch { /* ignore */ }
            }
          }
          loadConversations();
          // Re-fetch after a delay to catch lead data created after the conversation INSERT
          setTimeout(() => loadConversations(), 1500);
        } else if (payload.eventType === "UPDATE") {
          loadConversations();
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [workspaceId, loadConversations]);

  async function loadMore(): Promise<void> {
    setLoadingMore(true);
    const { data } = await supabase
      .from("conversations")
      .select("id, visitor_id, status, started_at, assigned_to")
      .eq("workspace_id", workspaceId)
      .is("deleted_at", null)
      .in("status", filter === "waiting" ? ["waiting"] : filter === "human" ? ["human"] : ["closed"])
      .order("started_at", { ascending: false })
      .range(conversations.length, conversations.length + 49);
    if (data) {
      const enriched = await enrichConversations(supabase, data as InboxConversation[]);
      setConversations((prev) => [...prev, ...enriched]);
      setHasMore(data.length === 50);
    }
    setLoadingMore(false);
  }

  return { conversations, setConversations, loading, hasMore, loadingMore, loadMore, loadConversations };
}
