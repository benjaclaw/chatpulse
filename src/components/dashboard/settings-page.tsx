"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/contexts/workspace-context";
import { createClient } from "@/lib/supabase/client";
import { useClipboard } from "@/hooks/use-clipboard";
import { useTemporaryFlag } from "@/hooks/use-temporary-flag";
import { useLanguage } from "@/lib/i18n/context";
import type { Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { getPlanDetail, getPlanLimit } from "@/lib/plans";
import type { PlanFeature } from "@/lib/plans";

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
  const { t, language, setLanguage } = useLanguage();
  const [workspaceName, setWorkspaceName] = useState(workspace.name);
  const { active: saved, trigger: triggerSaved } = useTemporaryFlag();
  const [inviteCode, setInviteCode] = useState(() => generateInviteCode());
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
          <div className="flex items-center gap-3">
            <code className="flex h-10 items-center rounded-lg border bg-muted px-4 font-mono text-sm tracking-widest">
              {inviteCode}
            </code>
            <Button variant="outline" size="icon" onClick={() => copy(inviteCode)}>
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setInviteCode(generateInviteCode())}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
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
  workspace: { plan_id: string; message_count: number };
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
          {plan.name} — {plan.priceNok > 0 ? `${plan.priceNok} kr${t('plans.perMonth')}` : t('plans.free')}
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

        {/* Features */}
        <div>
          <p className="text-sm font-medium mb-2">{t('plans.features')}</p>
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {plan.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                {t(`plans.feature.${f}` as string)}
              </li>
            ))}
          </ul>
        </div>

        {/* Upgrade button */}
        {workspace.plan_id !== "pro" && (
          <Button variant="outline" className="w-full sm:w-auto">
            <Zap className="mr-2 h-4 w-4" />
            {t('plans.upgradePlan')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
