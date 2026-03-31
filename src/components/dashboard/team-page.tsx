"use client";

import { useState, useEffect } from "react";
import { useWorkspace } from "@/contexts/workspace-context";
import { createClient } from "@/lib/supabase/client";
import { useTemporaryFlag } from "@/hooks/use-temporary-flag";
import { useLanguage } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, CheckCircle2 } from "lucide-react";
import { ROLE_BADGE_VARIANT } from "@/lib/types";
import { hasFeature } from "@/lib/plans";
import { UpgradeBanner } from "./upgrade-banner";
import type { TeamMember, MemberRole } from "@/lib/types";

export function TeamPageClient(): React.ReactNode {
  const workspace = useWorkspace();
  const { id: workspaceId } = workspace;
  const supabase = createClient();
  const { t } = useLanguage();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { active: success, trigger: triggerSuccess } = useTemporaryFlag(1500);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data } = await supabase
        .from("members")
        .select("id, user_id, role, created_at, profiles(email)")
        .eq("workspace_id", workspaceId);
      if (!cancelled) {
        const mapped: TeamMember[] = (data ?? []).map((m: Record<string, unknown>) => {
          const profiles = m.profiles as { email: string }[] | { email: string } | null;
          const email = Array.isArray(profiles) ? profiles[0]?.email ?? "" : profiles?.email ?? "";
          const name = email.split("@")[0] || t('common.unknown');
          const initials = name.slice(0, 2).toUpperCase();
          return {
            id: m.id as string,
            name,
            email,
            role: m.role as MemberRole,
            avatar_initials: initials,
          };
        });
        setMembers(mapped);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [workspaceId, supabase]);

  async function handleInvite(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = fd.get("email") as string;
    const role = fd.get("role") as string;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("invites").insert({
      workspace_id: workspaceId,
      email,
      role,
      token: crypto.randomUUID(),
      invited_by: user.id,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    triggerSuccess();
    setTimeout(() => setDialogOpen(false), 1500);
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-scroll-fade">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('team.title')}</h1>
          <p className="mt-1 text-muted-foreground">
            {t('team.description')}
          </p>
        </div>
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="p-6 space-y-1.5">
            <div className="h-6 w-32 rounded bg-muted animate-shimmer" />
            <div className="h-4 w-56 rounded bg-muted animate-shimmer" style={{ animationDelay: "50ms" }} />
          </div>
          <div className="px-6 pb-6 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
                <div className="h-10 w-10 shrink-0 rounded-full bg-muted animate-shimmer" style={{ animationDelay: `${100 + i * 100}ms` }} />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-32 rounded bg-muted animate-shimmer" style={{ animationDelay: `${125 + i * 100}ms` }} />
                  <div className="h-3 w-48 rounded bg-muted animate-shimmer" style={{ animationDelay: `${150 + i * 100}ms` }} />
                </div>
                <div className="h-6 w-16 rounded-full bg-muted animate-shimmer" style={{ animationDelay: `${175 + i * 100}ms` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('team.title')}</h1>
          <p className="mt-1 text-muted-foreground">
            {t('team.description')}
          </p>
        </div>
        {hasFeature(workspace.plan_id, "team_members") ? (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button className="shrink-0" />}>
            <UserPlus className="mr-2 h-4 w-4" />
            {t('team.invite')}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('team.inviteTitle')}</DialogTitle>
              <DialogDescription>
                {t('team.inviteDescription')}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInvite}>
              <div className="space-y-4 py-4">
                {success && (
                  <div className="animate-in fade-in slide-in-from-top-1 flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-green-700 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    {t('team.inviteSent')}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="invite-email">{t('team.emailLabel')}</Label>
                  <Input
                    id="invite-email"
                    name="email"
                    type="email"
                    placeholder={t('team.emailPlaceholder')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-role">{t('team.roleLabel')}</Label>
                  <select
                    id="invite-role"
                    name="role"
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-50"
                    defaultValue="member"
                  >
                    <option value="member">{t('team.roleMember')}</option>
                    <option value="admin">{t('team.roleAdmin')}</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{t('team.sendInvite')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        ) : null}
      </div>

      {!hasFeature(workspace.plan_id, "team_members") && (
        <UpgradeBanner feature="team_members" />
      )}

      {members.length === 1 && (
        <p className="text-sm text-muted-foreground italic">
          {t('team.onlyMember')} {t('hint.team.solo')}
        </p>
      )}

      {/* Members card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('team.membersTitle')}</CardTitle>
          <CardDescription>
            {t('team.membersDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {t('team.noMembers')}
            </p>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 rounded-lg border p-4 transition-all duration-200 hover:bg-muted/50 hover:shadow-sm hover:border-primary/20"
                >
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {member.avatar_initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {member.email}
                    </p>
                  </div>
                  <Badge variant={ROLE_BADGE_VARIANT[member.role] ?? "outline"}>
                    {t(`role.${member.role}`)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
