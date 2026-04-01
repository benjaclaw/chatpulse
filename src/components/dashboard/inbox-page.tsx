"use client";

import { useState, useEffect } from "react";
import { useWorkspace } from "@/contexts/workspace-context";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { ConversationList } from "./inbox/conversation-list";
import { ChatPanel } from "./inbox/chat-panel";
import { useConversations } from "./inbox/use-conversations";
import { useMessages } from "./inbox/use-messages";

export function InboxPageClient(): React.ReactNode {
  const workspace = useWorkspace();
  const supabase = createClient();
  const { t } = useLanguage();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"waiting" | "human" | "closed">("waiting");
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled && data.user) setUserId(data.user.id);
    });
    return () => { cancelled = true; };
  }, []);

  // Request browser notification permission
  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const { conversations, setConversations, loading, hasMore, loadingMore, loadMore, loadConversations } =
    useConversations(workspace.id, filter);

  const { messages, setMessages, visibleMessages, visitorTyping, showNotes, setShowNotes, selectedLeadInfo, messagesEndRef } =
    useMessages(selectedId);

  const selectedConv = conversations.find((c) => c.id === selectedId);

  // Claim a conversation
  async function handleClaim(conversationId: string) {
    if (!userId) return;
    setConversations((prev) =>
      prev.map((c) => c.id === conversationId ? { ...c, status: "human", assigned_to: userId } : c)
    );
    const serviceRes = await fetch("/api/live-chat/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId }),
    });
    if (!serviceRes.ok) {
      loadConversations();
    } else {
      setFilter("human");
      loadConversations();
    }
  }

  // Close a conversation
  async function handleClose(conversationId: string) {
    if (!confirm(t('inbox.confirmClose'))) return;
    setConversations((prev) =>
      prev.map((c) => c.id === conversationId ? { ...c, status: "closed" } : c)
    );
    if (selectedId === conversationId) setSelectedId(null);
    await fetch("/api/live-chat/close", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId }),
    });
    loadConversations();
  }

  // Delete a conversation
  async function handleDelete(conversationId: string) {
    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    if (selectedId === conversationId) setSelectedId(null);
    const res = await fetch("/api/conversations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId }),
    });
    if (!res.ok) loadConversations(); // Revert on failure
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('inbox.title')}</h1>
        <p className="mt-1 text-muted-foreground">{t('inbox.description')}</p>
      </div>

      <div className="flex h-[calc(100vh-220px)] min-h-[400px] overflow-hidden rounded-xl border bg-card shadow-sm md:h-[calc(100vh-200px)]" style={{ height: "calc(100dvh - 220px)" }}>
        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onDelete={handleDelete}
          filter={filter}
          onFilterChange={(f) => { setFilter(f); setSelectedId(null); }}
          loading={loading}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
          t={t}
        />

        <div className={cn("flex flex-1 flex-col", !selectedId ? "hidden md:flex" : "flex")}>
          <ChatPanel
            selectedId={selectedId}
            selectedConv={selectedConv}
            messages={messages}
            visibleMessages={visibleMessages}
            visitorTyping={visitorTyping}
            showNotes={showNotes}
            setShowNotes={setShowNotes}
            selectedLeadInfo={selectedLeadInfo}
            messagesEndRef={messagesEndRef}
            setMessages={setMessages}
            userId={userId}
            onClaim={handleClaim}
            onClose={handleClose}
            onDeselect={() => setSelectedId(null)}
            loadConversations={loadConversations}
            t={t}
          />
        </div>
      </div>
    </div>
  );
}
