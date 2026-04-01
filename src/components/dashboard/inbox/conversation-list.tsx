import { useState } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InboxConversation } from "./use-conversations";

interface ConversationListProps {
  conversations: InboxConversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete?: (id: string) => Promise<void>;
  filter: "waiting" | "human" | "closed";
  onFilterChange: (f: "waiting" | "human" | "closed") => void;
  loading: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  t: (key: string) => string;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onDelete,
  filter,
  onFilterChange,
  loading,
  hasMore,
  loadingMore,
  onLoadMore,
  t,
}: ConversationListProps): React.ReactNode {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  return (
    <div
      className={cn(
        "flex w-full flex-col border-r md:w-80 md:flex-shrink-0",
        selectedId ? "hidden md:flex" : "flex"
      )}
    >
      {/* Filter tabs */}
      <div className="flex border-b p-2 gap-1" role="tablist" aria-label="Conversation filters">
        {(["waiting", "human", "closed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => onFilterChange(f)}
            role="tab"
            aria-selected={filter === f}
            className={cn(
              "flex-1 rounded-lg px-2 py-2 text-xs font-medium transition-all duration-200",
              filter === f
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.97]"
            )}
          >
            {f === "waiting" ? t('inbox.waiting') : f === "human" ? t('inbox.active') : t('inbox.closed')}
          </button>
        ))}
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-1 p-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg p-3">
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 rounded bg-muted animate-shimmer" />
                  <div className="h-3 w-full rounded bg-muted animate-shimmer" />
                  <div className="h-2 w-16 rounded bg-muted animate-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              {filter === "waiting"
                ? t('inbox.emptyWaiting')
                : filter === "human"
                  ? t('inbox.emptyActive')
                  : t('inbox.emptyClosed')}
            </p>
            <p className="text-xs text-muted-foreground/60">
              {filter === "waiting"
                ? t('hint.inbox.waiting')
                : filter === "human"
                  ? t('hint.inbox.active')
                  : t('hint.inbox.closed')}
            </p>
          </div>
        ) : (
          <>
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  "group relative flex w-full items-start gap-3 border-b p-3 text-left transition-all duration-150 hover:bg-muted/50",
                  selectedId === conv.id && "bg-primary/5 border-l-2 border-l-primary dark:bg-primary/10"
                )}
              >
                {confirmDeleteId === conv.id ? (
                  <div className="flex w-full items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">{t('inbox.confirmDelete')}</p>
                    <div className="flex gap-1.5">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!onDelete) return;
                          setDeleting(true);
                          await onDelete(conv.id);
                          setDeleting(false);
                          setConfirmDeleteId(null);
                        }}
                        disabled={deleting}
                        className="rounded-md bg-red-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50"
                      >
                        {deleting ? t('common.loading') : t('common.delete')}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                        className="rounded-md border px-2.5 py-1 text-xs font-medium hover:bg-muted"
                      >
                        {t('common.cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => onSelect(conv.id)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="flex items-center gap-2">
                      {conv.status === "waiting" && (
                        <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                      )}
                      <span className="text-xs font-medium truncate">
                        {conv.lead_name || conv.lead_email || t('inbox.visitor')}
                      </span>
                      <span className={cn(
                        "ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                        conv.status === "waiting" && "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
                        conv.status === "human" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                        conv.status === "closed" && "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      )}>
                        {conv.status === "waiting" ? t('inbox.waiting') : conv.status === "human" ? t('inbox.active') : t('inbox.closed')}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground truncate">
                      {conv.first_message || t('inbox.noPreview')}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground/60">
                      {new Date(conv.started_at).toLocaleString()}
                    </p>
                  </button>
                )}
                {onDelete && confirmDeleteId !== conv.id && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(conv.id); }}
                    className="absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30"
                    aria-label={t('common.delete')}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </button>
                )}
              </div>
            ))}
            {hasMore && (
              <button
                onClick={onLoadMore}
                disabled={loadingMore}
                className="w-full p-3 text-center text-xs text-primary hover:bg-muted/50 transition-colors disabled:opacity-50"
              >
                {loadingMore ? t('common.loading') : t('inbox.loadMore')}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
