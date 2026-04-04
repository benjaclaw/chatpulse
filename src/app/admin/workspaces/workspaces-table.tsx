"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, ChevronDown, ChevronRight, Trash2, ArrowUpCircle, CreditCard, AlertTriangle } from "lucide-react";
import { SearchInput } from "@/components/dashboard/search-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
const PLANS = ["free", "basic", "startup", "pro"];

export function WorkspacesTable({ workspaces }: { workspaces: AdminWorkspace[] }): React.ReactNode {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleChangePlan(wsId: string, newPlan: string) {
    if (!confirm(`Endre plan til ${newPlan.toUpperCase()}?`)) return;
    setLoading(wsId);
    try {
      const res = await fetch("/api/admin/workspaces", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: wsId, plan_id: newPlan }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Feil"); return; }
      router.refresh();
    } finally { setLoading(null); }
  }

  async function handleDelete(wsId: string, wsName: string) {
    if (!confirm(`Er du sikker på at du vil slette "${wsName}"? Dette kan ikke angres.`)) return;
    if (!confirm(`Siste sjanse: Slett "${wsName}" permanent?`)) return;
    setLoading(wsId);
    try {
      const res = await fetch(`/api/admin/workspaces?workspaceId=${wsId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Feil"); return; }
      router.refresh();
    } finally { setLoading(null); }
  }

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
              <TableHead>Plan</TableHead>
              <TableHead>Meldinger</TableHead>
              <TableHead>Stripe</TableHead>
              <TableHead>{t('admin.workspaces.members')}</TableHead>
              <TableHead>{t('admin.workspaces.created')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                  {t('admin.workspaces.noWorkspaces')}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((ws) => {
                const isExpanded = expandedId === ws.id;
                return (
                  <TableRow key={ws.id} className="group">
                    <TableCell colSpan={8} className="p-0">
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
                        <div className="flex-1 p-2">
                          <Badge
                            variant={ws.plan_id === "free" ? "outline" : ws.plan_id === "pro" ? "default" : "secondary"}
                            className="text-xs uppercase"
                          >
                            {ws.plan_id}
                          </Badge>
                        </div>
                        <div className="flex-1 p-2">
                          {ws.stripe_subscription_id ? (
                            <Badge variant="default" className="gap-1 text-xs bg-emerald-600">
                              <CreditCard className="h-3 w-3" />
                              Aktiv
                            </Badge>
                          ) : ws.plan_id !== "free" ? (
                            <Badge variant="destructive" className="gap-1 text-xs">
                              <AlertTriangle className="h-3 w-3" />
                              Mangler
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </div>
                        <div className="flex-1 p-2 text-sm text-muted-foreground">
                          {ws.message_count.toLocaleString("nb-NO")}
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
                        <div className="border-t bg-muted/30 px-10 py-4 space-y-4">
                          <div>
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

                          {/* Admin actions */}
                          <div className="flex items-center gap-3 border-t pt-3">
                            <div className="flex items-center gap-2">
                              <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
                              <span className="text-xs font-medium text-muted-foreground">Endre plan:</span>
                              {PLANS.map((p) => (
                                <Button
                                  key={p}
                                  variant={ws.plan_id === p ? "default" : "outline"}
                                  size="sm"
                                  className="h-7 text-xs"
                                  disabled={ws.plan_id === p || loading === ws.id}
                                  onClick={(e) => { e.stopPropagation(); handleChangePlan(ws.id, p); }}
                                >
                                  {p.toUpperCase()}
                                </Button>
                              ))}
                            </div>
                            <div className="ml-auto">
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-7 text-xs"
                                disabled={loading === ws.id}
                                onClick={(e) => { e.stopPropagation(); handleDelete(ws.id, ws.name); }}
                              >
                                <Trash2 className="mr-1 h-3 w-3" />
                                Slett
                              </Button>
                            </div>
                          </div>
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
