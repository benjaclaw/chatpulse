"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useWorkspace } from "@/contexts/workspace-context";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "./empty-state";
import { SearchInput } from "./search-input";
import { Plus, BookOpen, Calendar, Pencil, Upload, FileText, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import type { KnowledgeItem } from "@/lib/types";
import { hasFeature } from "@/lib/plans";
import { UpgradeBanner } from "./upgrade-banner";

const ACCEPTED_FILE_TYPES = ".pdf,.docx,.xlsx,.csv,.txt,.md";
const PAGE_SIZE = 20;

export function KnowledgePageClient(): React.ReactNode {
  const workspace = useWorkspace();
  const { id: workspaceId } = workspace;
  const supabase = createClient();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchItems = useCallback(async () => {
    setLoading(true);

    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    // Count query
    let countQuery = supabase
      .from("knowledge")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId);

    if (searchDebounced) {
      countQuery = countQuery.or(
        `title.ilike.%${searchDebounced}%,content.ilike.%${searchDebounced}%,category.ilike.%${searchDebounced}%`
      );
    }

    // Data query
    let dataQuery = supabase
      .from("knowledge")
      .select("id, title, content, category, created_at, file_url, file_name")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (searchDebounced) {
      dataQuery = dataQuery.or(
        `title.ilike.%${searchDebounced}%,content.ilike.%${searchDebounced}%,category.ilike.%${searchDebounced}%`
      );
    }

    // Latest updated item (for "last updated" badge)
    const latestQuery = supabase
      .from("knowledge")
      .select("created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const [countResult, dataResult, latestResult] = await Promise.all([countQuery, dataQuery, latestQuery]);

    setTotalCount(countResult.count ?? 0);
    setItems(dataResult.data ?? []);
    setLastUpdated(latestResult.data?.created_at ?? null);
    setLoading(false);
  }, [workspaceId, supabase, page, searchDebounced]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const totalPages = useMemo(() => Math.ceil(totalCount / PAGE_SIZE), [totalCount]);

  function openCreate() {
    setEditingItem(null);
    setDialogOpen(true);
  }

  function openEdit(item: KnowledgeItem) {
    setEditingItem(item);
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = fd.get("title") as string;
    const content = fd.get("content") as string;
    const category = fd.get("category") as string;

    if (editingItem) {
      const { data } = await supabase
        .from("knowledge")
        .update({
          title,
          content,
          category: category || t('knowledge.defaultCategory'),
        })
        .eq("id", editingItem.id)
        .select("id, title, content, category, created_at, file_url, file_name")
        .single();

      if (data) {
        setItems((prev) => prev.map((item) => (item.id === data.id ? data : item)));
      }
    } else {
      const { data } = await supabase
        .from("knowledge")
        .insert({
          workspace_id: workspaceId,
          title,
          content,
          category: category || t('knowledge.defaultCategory'),
        })
        .select("id, title, content, category, created_at, file_url, file_name")
        .single();

      if (data) {
        // Refresh to get correct pagination
        fetchItems();
      }
    }

    setDialogOpen(false);
    setEditingItem(null);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be re-selected
    e.target.value = "";

    if (file.size > 10 * 1024 * 1024) {
      setUploadError(t('knowledge.fileTooLarge'));
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("workspace_id", workspaceId);

      const res = await fetch("/api/knowledge/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        setUploadError(result.error || t('knowledge.uploadFailed'));
        return;
      }

      // Refresh to get correct pagination
      fetchItems();
    } catch {
      setUploadError(t('knowledge.uploadFailedNetwork'));
    } finally {
      setUploading(false);
    }
  }

  if (loading && items.length === 0 && page === 0) {
    return (
      <div className="space-y-6 animate-scroll-fade">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('knowledge.title')}</h1>
          <p className="mt-1 text-muted-foreground">
            {t('knowledge.description')}
          </p>
        </div>
        <div className="h-10 w-full rounded-lg bg-muted animate-shimmer" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-40 rounded bg-muted animate-shimmer" style={{ animationDelay: `${i * 100}ms` }} />
                    <div className="h-5 w-16 rounded-full bg-muted animate-shimmer" style={{ animationDelay: `${i * 100 + 25}ms` }} />
                  </div>
                  <div className="h-4 w-full rounded bg-muted animate-shimmer" style={{ animationDelay: `${i * 100 + 50}ms` }} />
                  <div className="h-3 w-24 rounded bg-muted animate-shimmer" style={{ animationDelay: `${i * 100 + 75}ms` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight">{t('knowledge.title')}</h1>
            {totalCount > 0 && (
              <Badge variant="secondary">
                {totalCount === 1
                  ? t('knowledge.articleCountOne')
                  : t('knowledge.articleCount').replace('{count}', String(totalCount))}
              </Badge>
            )}
          </div>
          <p className="mt-1 text-muted-foreground">
            {t('knowledge.description')}
            {lastUpdated && (
              <span className="ml-2 text-xs">
                · {t('knowledge.lastUpdated')} {new Date(lastUpdated).toLocaleDateString("nb-NO")}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Document upload available for all plans */}
          <>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_FILE_TYPES}
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                variant="outline"
                className="shrink-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {uploading ? t('knowledge.uploading') : t('knowledge.uploadFile')}
              </Button>
            </>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingItem(null); }}>
            <DialogTrigger render={<Button className="shrink-0" onClick={openCreate} />}>
              <Plus className="mr-2 h-4 w-4" />
              {t('knowledge.add')}
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:!max-w-2xl !w-[calc(100%-2rem)] sm:!w-full">
              <DialogHeader>
                <DialogTitle>{editingItem ? t('knowledge.editArticle') : t('knowledge.newArticle')}</DialogTitle>
                <DialogDescription>
                  {editingItem
                    ? t('knowledge.editDescription')
                    : t('knowledge.newDescription')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="overflow-hidden">
                <div className="space-y-4 py-4 overflow-hidden">
                  <div className="space-y-2">
                    <Label htmlFor="kb-title">{t('knowledge.titleLabel')}</Label>
                    <Input
                      id="kb-title"
                      name="title"
                      placeholder={t('knowledge.titlePlaceholder')}
                      required
                      defaultValue={editingItem?.title ?? ""}
                      key={editingItem?.id ?? "new"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kb-category">{t('knowledge.category')}</Label>
                    <Input
                      id="kb-category"
                      name="category"
                      placeholder={t('knowledge.categoryPlaceholder')}
                      defaultValue={editingItem?.category ?? ""}
                      key={`cat-${editingItem?.id ?? "new"}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kb-content">{t('knowledge.content')}</Label>
                    <Textarea
                      id="kb-content"
                      name="content"
                      placeholder={t('knowledge.contentPlaceholder')}
                      rows={12}
                      required
                      defaultValue={editingItem?.content ?? ""}
                      key={`con-${editingItem?.id ?? "new"}`}
                      className="max-h-[50vh] min-h-[200px] w-full resize-y font-mono text-xs leading-relaxed overflow-x-hidden break-words"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">{editingItem ? t('knowledge.update') : t('knowledge.save')}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>



      {/* Upload error */}
      {uploadError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {uploadError}
        </div>
      )}

      {/* Search */}
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder={t('knowledge.search')}
      />

      {/* Items list */}
      {items.length === 0 ? (
        <KnowledgeEmptyState search={search} onAdd={openCreate} t={t} />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="group rounded-xl border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{item.title}</h3>
                    <Badge variant="secondary">{item.category}</Badge>
                    {item.file_name && (
                      <Badge variant="outline" className="gap-1">
                        <FileText className="h-3 w-3" />
                        {item.file_name}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {item.content}
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(item.created_at).toLocaleDateString("nb-NO")}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  onClick={() => openEdit(item)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t('common.previous')}
          </Button>
          <span className="text-sm text-muted-foreground">
            {t('common.pageOf', { page: page + 1, total: totalPages })}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            {t('common.next')}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function KnowledgeEmptyState({
  search,
  onAdd,
  t,
}: {
  search: string;
  onAdd: () => void;
  t: (key: string) => string;
}): React.ReactNode {
  return (
    <EmptyState
      icon={BookOpen}
      title={search ? t('knowledge.noResults') : t('knowledge.empty')}
      description={
        search
          ? `${t('knowledge.noMatch')} "${search}".`
          : t('knowledge.emptyDescription')
      }
    >
      {!search && (
        <Button variant="outline" className="mt-5" onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          {t('knowledge.addFirst')}
        </Button>
      )}
    </EmptyState>
  );
}
