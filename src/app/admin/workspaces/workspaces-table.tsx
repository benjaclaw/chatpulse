"use client";

import { useState } from "react";
import { Users, ChevronDown, ChevronRight } from "lucide-react";
import { SearchInput } from "@/components/dashboard/search-input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminWorkspace } from "@/lib/types";
import { createT } from "@/lib/i18n";

const t = createT("nb");

export function WorkspacesTable({ workspaces }: { workspaces: AdminWorkspace[] }): React.ReactNode {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = workspaces.filter(
    (ws) =>
      ws.name.toLowerCase().includes(search.toLowerCase()) ||
      ws.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder={t('admin.workspaces.search')}
        className="max-w-sm"
      />

      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>{t('admin.workspaces.name')}</TableHead>
              <TableHead>{t('admin.workspaces.slug')}</TableHead>
              <TableHead>{t('admin.workspaces.members')}</TableHead>
              <TableHead>{t('admin.workspaces.created')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  {t('admin.workspaces.noWorkspaces')}
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
                            {t('admin.workspaces.membersSection')}
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
    </>
  );
}
