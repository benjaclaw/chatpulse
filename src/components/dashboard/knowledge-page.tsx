"use client";

import { useState, useEffect, useRef } from "react";
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
import { Plus, BookOpen, Calendar, Pencil, Upload, FileText, Loader2 } from "lucide-react";
import type { KnowledgeItem } from "@/lib/types";

const ACCEPTED_FILE_TYPES = ".pdf,.docx,.xlsx,.csv,.txt,.md";

export function KnowledgePageClient(): React.ReactNode {
  const { id: workspaceId } = useWorkspace();
  const supabase = createClient();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data } = await supabase
        .from("knowledge")
        .select("id, title, content, category, created_at, file_url, file_name")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });
      if (!cancelled) {
        setItems(data ?? []);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [workspaceId, supabase]);

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.content.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

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
        setItems((prev) => [data, ...prev]);
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

      setItems((prev) => [result, ...prev]);
    } catch {
      setUploadError(t('knowledge.uploadFailedNetwork'));
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('knowledge.title')}</h1>
          <p className="mt-1 text-muted-foreground">
            {t('knowledge.description')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('knowledge.title')}</h1>
          <p className="mt-1 text-muted-foreground">
            {t('knowledge.description')}
          </p>
        </div>
        <div className="flex items-center gap-2">
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
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingItem(null); }}>
            <DialogTrigger render={<Button className="shrink-0" onClick={openCreate} />}>
              <Plus className="mr-2 h-4 w-4" />
              {t('knowledge.add')}
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingItem ? t('knowledge.editArticle') : t('knowledge.newArticle')}</DialogTitle>
                <DialogDescription>
                  {editingItem
                    ? t('knowledge.editDescription')
                    : t('knowledge.newDescription')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
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
                      className="max-h-[50vh] resize-y"
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
      {filtered.length === 0 ? (
        <KnowledgeEmptyState search={search} onAdd={openCreate} t={t} />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group rounded-xl border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md"
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
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => openEdit(item)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
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
