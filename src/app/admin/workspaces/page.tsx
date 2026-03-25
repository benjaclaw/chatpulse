"use client";

import { useState } from "react";
import { Search, Users, ChevronDown, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockAdminWorkspaces } from "@/lib/mock-data";

export default function AdminWorkspacesPage(): React.ReactNode {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = mockAdminWorkspaces.filter(
    (ws) =>
      ws.name.toLowerCase().includes(search.toLowerCase()) ||
      ws.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Workspaces</h1>
        <p className="mt-1 text-muted-foreground">
          Alle workspaces på plattformen.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Søk etter workspace..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Navn</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Medlemmer</TableHead>
              <TableHead>Opprettet</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Ingen workspaces funnet.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((ws) => {
                const isExpanded = expandedId === ws.id;
                return (
                  <TableRow key={ws.id} className="group">
                    <TableCell colSpan={5} className="p-0">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : ws.id)}
                        className="flex w-full items-center gap-0 text-left transition-colors hover:bg-muted/50"
                      >
                        <div className="flex w-8 items-center justify-center p-2">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 p-2 font-medium">{ws.name}</div>
                        <div className="flex-1 p-2 text-sm text-muted-foreground">
                          {ws.slug}
                        </div>
                        <div className="flex-1 p-2">
                          <Badge variant="secondary" className="gap-1">
                            <Users className="h-3 w-3" />
                            {ws.member_count}
                          </Badge>
                        </div>
                        <div className="flex-1 p-2 text-sm text-muted-foreground">
                          {new Date(ws.created_at).toLocaleDateString("nb-NO")}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t bg-muted/30 px-10 py-3">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Medlemmer
                          </p>
                          <ul className="space-y-1">
                            {ws.members.map((m) => (
                              <li
                                key={m.id}
                                className="flex items-center gap-3 text-sm"
                              >
                                <span className="font-medium">{m.name}</span>
                                <span className="text-muted-foreground">
                                  {m.email}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {m.role}
                                </Badge>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
