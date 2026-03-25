"use client";

import { useState, useEffect } from "react";
import { useWorkspace } from "@/contexts/workspace-context";
import { createClient } from "@/lib/supabase/client";
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
import { Plus, BookOpen, Calendar, Pencil } from "lucide-react";
import type { KnowledgeItem } from "@/lib/types";

export function KnowledgePageClient(): React.ReactNode {
  const { id: workspaceId } = useWorkspace();
  const supabase = createClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data } = await supabase
        .from("knowledge")
        .select("id, title, content, category, created_at")
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
          category: category || "Generelt",
        })
        .eq("id", editingItem.id)
        .select("id, title, content, category, created_at")
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
          category: category || "Generelt",
        })
        .select("id, title, content, category, created_at")
        .single();

      if (data) {
        setItems((prev) => [data, ...prev]);
      }
    }

    setDialogOpen(false);
    setEditingItem(null);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kunnskapsbase</h1>
          <p className="mt-1 text-muted-foreground">
            Legg til innhold som chatboten kan bruke til å svare kunder.
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
          <h1 className="text-3xl font-bold tracking-tight">Kunnskapsbase</h1>
          <p className="mt-1 text-muted-foreground">
            Legg til innhold som chatboten kan bruke til å svare kunder.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingItem(null); }}>
          <DialogTrigger render={<Button className="shrink-0" onClick={openCreate} />}>
            <Plus className="mr-2 h-4 w-4" />
            Legg til
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? "Rediger artikkel" : "Ny artikkel"}</DialogTitle>
              <DialogDescription>
                {editingItem
                  ? "Oppdater artikkelen i kunnskapsbasen."
                  : "Legg til en ny artikkel i kunnskapsbasen."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="kb-title">Tittel</Label>
                  <Input
                    id="kb-title"
                    name="title"
                    placeholder="F.eks. Returpolicy"
                    required
                    defaultValue={editingItem?.title ?? ""}
                    key={editingItem?.id ?? "new"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kb-category">Kategori</Label>
                  <Input
                    id="kb-category"
                    name="category"
                    placeholder="F.eks. Frakt, Betaling, Generelt"
                    defaultValue={editingItem?.category ?? ""}
                    key={`cat-${editingItem?.id ?? "new"}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kb-content">Innhold</Label>
                  <Textarea
                    id="kb-content"
                    name="content"
                    placeholder="Skriv innholdet her..."
                    rows={5}
                    required
                    defaultValue={editingItem?.content ?? ""}
                    key={`con-${editingItem?.id ?? "new"}`}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingItem ? "Oppdater" : "Lagre"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Søk i kunnskapsbasen..."
      />

      {/* Items list */}
      {filtered.length === 0 ? (
        <KnowledgeEmptyState search={search} onAdd={openCreate} />
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
}: {
  search: string;
  onAdd: () => void;
}): React.ReactNode {
  return (
    <EmptyState
      icon={BookOpen}
      title={search ? "Ingen resultater" : "Kunnskapsbasen er tom"}
      description={
        search
          ? `Fant ingen artikler som matcher "${search}".`
          : "Legg til artikler som chatboten kan bruke til å svare kundene dine."
      }
    >
      {!search && (
        <Button variant="outline" className="mt-5" onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Legg til din første artikkel
        </Button>
      )}
    </EmptyState>
  );
}
