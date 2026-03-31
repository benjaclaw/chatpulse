"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useWorkspace } from "@/contexts/workspace-context";
import { createClient } from "@/lib/supabase/client";
import { useClipboard } from "@/hooks/use-clipboard";
import { useTemporaryFlag } from "@/hooks/use-temporary-flag";
import { useLanguage } from "@/lib/i18n/context";
import type { Language } from "@/lib/i18n";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  Settings,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  AlertTriangle,
  CreditCard,
  Zap,
  Clock,
  Smartphone,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getPlanDetail, getPlanLimit } from "@/lib/plans";

type DaySchedule = { start: string; end: string } | null;
type BusinessHours = {
  enabled: boolean;
  timezone: string;
  schedule: Record<string, DaySchedule>;
};

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

const DEFAULT_BH: BusinessHours = {
  enabled: false,
  timezone: "Europe/Oslo",
  schedule: {
    mon: { start: "09:00", end: "16:00" },
    tue: { start: "09:00", end: "16:00" },
    wed: { start: "09:00", end: "16:00" },
    thu: { start: "09:00", end: "16:00" },
    fri: { start: "09:00", end: "16:00" },
    sat: null,
    sun: null,
  },
};

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function SettingsPageClient(): React.ReactNode {
  const workspace = useWorkspace();
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language, setLanguage } = useLanguage();
  const [workspaceName, setWorkspaceName] = useState(workspace.name);
  const { active: saved, trigger: triggerSaved } = useTemporaryFlag();
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(false);
  const [inviteCode, setInviteCode] = useState(() => generateInviteCode());
  const [inviteExpiry, setInviteExpiry] = useState<string | null>(null);
  const [inviteSaving, setInviteSaving] = useState(false);

  useEffect(() => {
    if (searchParams.get("upgrade") === "success") {
      setShowUpgradeSuccess(true);
      router.replace("/dashboard/settings");
      const timeout = setTimeout(() => setShowUpgradeSuccess(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [searchParams, router]);
  const { copied, copy } = useClipboard();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  async function handleSave() {
    await supabase
      .from("workspaces")
      .update({ name: workspaceName })
      .eq("id", workspace.id);
    triggerSaved();
    router.refresh();
  }

  async function handleDelete() {
    await supabase
      .from("workspaces")
      .delete()
      .eq("id", workspace.id);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {showUpgradeSuccess && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/50 dark:text-green-300">
          <Check className="h-4 w-4 shrink-0" />
          Plan oppgradert! Endringene trer i kraft umiddelbart.
        </div>
      )}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="mt-1 text-muted-foreground">
          {t('settings.description')}
        </p>
      </div>

      {/* Plan & Usage */}
      <PlanCard workspace={workspace} t={t} />

      {/* Workspace name */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-4 w-4 text-primary" />
            {t('settings.general')}
          </CardTitle>
          <CardDescription>
            {t('settings.generalDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="ws-name">{t('settings.workspaceName')}</Label>
            <Input
              id="ws-name"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={!workspaceName.trim()}>
            {saved ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                {t('common.saved')}
              </>
            ) : (
              t('common.saveChanges')
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Invite code */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('settings.inviteCode')}</CardTitle>
          <CardDescription>
            {t('settings.inviteCodeDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <code className="flex h-10 items-center rounded-lg border bg-muted px-4 font-mono text-sm tracking-widest overflow-x-auto max-w-xs">
                {`https://chatpulse.no/invite/accept?token=${inviteCode}`}
              </code>
              <Button variant="outline" size="icon" onClick={() => copy(`https://chatpulse.no/invite/accept?token=${inviteCode}`)} disabled={inviteSaving}>
                {copied ? (
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={inviteSaving}
                onClick={async () => {
                  setInviteSaving(true);
                  try {
                    // Delete old open invites for this workspace
                    await supabase
                      .from("invites")
                      .delete()
                      .eq("workspace_id", workspace.id)
                      .eq("email", "");
                    const newCode = generateInviteCode();
                    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;
                    await supabase.from("invites").insert({
                      workspace_id: workspace.id,
                      email: "",
                      token: newCode,
                      role: "member",
                      invited_by: user.id,
                      expires_at: expiresAt,
                    });
                    setInviteCode(newCode);
                    setInviteExpiry(expiresAt);
                  } finally {
                    setInviteSaving(false);
                  }
                }}
              >
                <RefreshCw className={cn("h-4 w-4", inviteSaving && "animate-spin")} />
              </Button>
            </div>
            {inviteExpiry && (
              <p className="text-xs text-muted-foreground">
                Koden er gyldig i 7 dager (utløper {new Date(inviteExpiry).toLocaleDateString("nb-NO")})
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('settings.language')}</CardTitle>
          <CardDescription>
            {t('settings.languageDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <select
            value={language}
            onChange={async (e) => {
              const lang = e.target.value as Language;
              setLanguage(lang);
              await supabase
                .from("workspaces")
                .update({ language: lang })
                .eq("id", workspace.id);
              router.refresh();
            }}
            className="flex h-10 w-full max-w-xs rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <option value="nb">Norsk</option>
            <option value="en">English</option>
          </select>
        </CardContent>
      </Card>

      {/* Business Hours */}
      <BusinessHoursCard workspaceId={workspace.id} t={t} />

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-destructive">
            <AlertTriangle className="h-4 w-4" />
            {t('settings.dangerZone')}
          </CardTitle>
          <CardDescription>
            {t('settings.dangerDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">{t('settings.deleteWorkspace')}</p>
              <p className="text-sm text-muted-foreground">
                {t('settings.deleteDescription')}
              </p>
            </div>
            <Dialog
              open={deleteDialogOpen}
              onOpenChange={(open) => {
                setDeleteDialogOpen(open);
                if (!open) setDeleteConfirm("");
              }}
            >
              <DialogTrigger
                render={<Button variant="destructive" className="shrink-0" />}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('settings.deleteWorkspace')}
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('settings.deleteConfirmTitle')}</DialogTitle>
                  <DialogDescription>
                    {t('settings.deleteConfirmDescription')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 py-4">
                  <Label htmlFor="delete-confirm">
                    {t('settings.deleteConfirmLabel', { name: workspaceName })}
                  </Label>
                  <Input
                    id="delete-confirm"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder={workspaceName}
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDeleteDialogOpen(false)}
                  >
                    {t('settings.cancel')}
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={deleteConfirm !== workspaceName}
                    onClick={handleDelete}
                  >
                    {t('settings.deletePermanent')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PlanCard({
  workspace,
  t,
}: {
  workspace: { id: string; plan_id: string; message_count: number };
  t: (key: string, params?: Record<string, string | number>) => string;
}): React.ReactNode {
  const plan = getPlanDetail(workspace.plan_id);
  const limit = getPlanLimit(workspace.plan_id);
  const used = workspace.message_count;
  const pct = Math.min((used / limit) * 100, 100);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CreditCard className="h-4 w-4 text-primary" />
          {t('plans.currentPlan')}
        </CardTitle>
        <CardDescription>
          {workspace.plan_id === "free" ? "Intern plan" : `${plan.name} — ${plan.priceNok > 0 ? `${plan.priceNok} kr${t('plans.perMonth')}` : t('plans.free')}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Usage bar */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {t('plans.usage', { used, limit })}
          </p>
          <div className="h-2.5 w-full rounded-full bg-muted">
            <div
              className="h-2.5 rounded-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Plan actions */}
        <div className="flex flex-col gap-2 sm:flex-row">
          {workspace.plan_id !== "pro" && (
            <Link
              href="/dashboard/upgrade"
              className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}
            >
              <Zap className="mr-2 h-4 w-4" />
              {t('plans.upgradePlan')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          )}
          {workspace.plan_id !== "free" && (
            <ManageSubscriptionButton workspaceId={workspace.id} t={t} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ManageSubscriptionButton({
  workspaceId,
  t,
}: {
  workspaceId: string;
  t: (key: string) => string;
}): React.ReactNode {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="ghost" onClick={handleClick} disabled={loading} className="w-full sm:w-auto">
      <CreditCard className="mr-2 h-4 w-4" />
      {loading ? "..." : t('plans.managePlan')}
    </Button>
  );
}

function BusinessHoursCard({
  workspaceId,
  t,
}: {
  workspaceId: string;
  t: (key: string) => string;
}): React.ReactNode {
  const supabase = createClient();
  const [bh, setBh] = useState<BusinessHours>(DEFAULT_BH);
  const { active: saved, trigger: triggerSaved } = useTemporaryFlag();

  useEffect(() => {
    supabase
      .from("workspaces")
      .select("business_hours")
      .eq("id", workspaceId)
      .single()
      .then(({ data }) => {
        if (data?.business_hours) {
          const saved = data.business_hours as Partial<BusinessHours>;
          setBh({
            enabled: saved.enabled ?? false,
            timezone: saved.timezone ?? DEFAULT_BH.timezone,
            schedule: saved.schedule ?? DEFAULT_BH.schedule,
          });
        }
      });
  }, [workspaceId]);

  async function handleSave() {
    await supabase
      .from("workspaces")
      .update({ business_hours: bh as unknown as Record<string, unknown> })
      .eq("id", workspaceId);
    triggerSaved();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-4 w-4 text-primary" />
          {t('settings.businessHours.title')}
        </CardTitle>
        <CardDescription>{t('settings.businessHours.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setBh({ ...bh, enabled: !bh.enabled })}
            role="switch"
            aria-checked={bh.enabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              bh.enabled ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                bh.enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-sm">
            {bh.enabled ? t('settings.businessHours.enabled') : t('settings.businessHours.disabled')}
          </span>
        </div>

        {bh.enabled && (
          <div className="space-y-3 sm:space-y-2">
            {DAYS.map((day) => {
              const schedule = bh.schedule[day];
              const isClosed = schedule === null;
              return (
                <div key={day} className="flex flex-col gap-2 rounded-lg border p-2.5 sm:flex-row sm:items-center sm:border-0 sm:p-0 sm:rounded-none">
                  <span className="w-20 shrink-0 text-sm font-medium">
                    {t(`settings.businessHours.day.${day}`)}
                  </span>
                  <button
                    onClick={() => {
                      const newSchedule = { ...bh.schedule };
                      newSchedule[day] = isClosed ? { start: "09:00", end: "16:00" } : null;
                      setBh({ ...bh, schedule: newSchedule });
                    }}
                    className={`shrink-0 self-start rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isClosed
                        ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                        : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                    }`}
                  >
                    {isClosed ? t('settings.businessHours.closedLabel') : t('settings.businessHours.enabled')}
                  </button>
                  {!isClosed && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={schedule.start}
                        onChange={(e) => {
                          const newSchedule = { ...bh.schedule };
                          newSchedule[day] = { ...schedule, start: e.target.value };
                          setBh({ ...bh, schedule: newSchedule });
                        }}
                        className="h-8 w-28 text-xs"
                      />
                      <span className="text-xs text-muted-foreground">–</span>
                      <Input
                        type="time"
                        value={schedule.end}
                        onChange={(e) => {
                          const newSchedule = { ...bh.schedule };
                          newSchedule[day] = { ...schedule, end: e.target.value };
                          setBh({ ...bh, schedule: newSchedule });
                        }}
                        className="h-8 w-28 text-xs"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>
          {saved ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              {t('common.saved')}
            </>
          ) : (
            t('common.saveChanges')
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

