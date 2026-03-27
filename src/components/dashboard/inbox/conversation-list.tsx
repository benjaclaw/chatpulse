import { cn } from "@/lib/utils";
import type { InboxConversation } from "./use-conversations";

interface ConversationListProps {
  conversations: InboxConversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
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
  filter,
  onFilterChange,
  loading,
  hasMore,
  loadingMore,
  onLoadMore,
  t,
}: ConversationListProps): React.ReactNode {
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
              "flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
              filter === f
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {f === "waiting" ? t('inbox.waiting') : f === "human" ? t('inbox.active') : t('inbox.closed')}
          </button>
        ))}
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">{t('common.loading')}</div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {filter === "waiting"
              ? t('inbox.emptyWaiting')
              : filter === "human"
                ? t('inbox.emptyActive')
                : t('inbox.emptyClosed')}
          </div>
        ) : (
          <>
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={cn(
                  "flex w-full items-start gap-3 border-b p-3 text-left transition-colors hover:bg-muted/50",
                  selectedId === conv.id && "bg-muted"
                )}
              >
                <div className="flex-1 min-w-0">
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
                </div>
              </button>
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
