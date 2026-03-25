"use client";

import { useState } from "react";
import { mockKnowledgeItems } from "@/lib/mock-data";
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
import { Plus, BookOpen, Calendar } from "lucide-react";

export function KnowledgePageClient(): React.ReactNode {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [items, setItems] = useState(mockKnowledgeItems);

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.content.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = fd.get("title") as string;
    const content = fd.get("content") as string;
    const category = fd.get("category") as string;

    setItems((prev) => [
      {
        id: `k${Date.now()}`,
        title,
        content,
        category: category || "Generelt",
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
    setDialogOpen(false);
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button className="shrink-0" />}>
            <Plus className="mr-2 h-4 w-4" />
            Legg til
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ny artikkel</DialogTitle>
              <DialogDescription>
                Legg til en ny artikkel i kunnskapsbasen.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="kb-title">Tittel</Label>
                  <Input
                    id="kb-title"
                    name="title"
                    placeholder="F.eks. Returpolicy"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kb-category">Kategori</Label>
                  <Input
                    id="kb-category"
                    name="category"
                    placeholder="F.eks. Frakt, Betaling, Generelt"
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
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Lagre</Button>
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
        <KnowledgeEmptyState search={search} onAdd={() => setDialogOpen(true)} />
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
