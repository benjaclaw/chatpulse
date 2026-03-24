"use client";

import { useState } from "react";
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
} from "lucide-react";

function generateInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function SettingsPageClient() {
  const [workspaceName, setWorkspaceName] = useState("ChatPulse Demo");
  const [saved, setSaved] = useState(false);
  const [inviteCode, setInviteCode] = useState(() => generateInviteCode());
  const [copied, setCopied] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  function handleSaveName() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleCopy() {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleRegenerateCode() {
    setInviteCode(generateInviteCode());
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Innstillinger</h1>
        <p className="mt-1 text-muted-foreground">
          Administrer workspace-innstillinger.
        </p>
      </div>

      {/* Workspace name */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-4 w-4 text-primary" />
            Generelt
          </CardTitle>
          <CardDescription>
            Grunnleggende innstillinger for workspacen din.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="ws-name">Workspace-navn</Label>
            <Input
              id="ws-name"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveName} disabled={!workspaceName.trim()}>
            {saved ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Lagret!
              </>
            ) : (
              "Lagre endringer"
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Invite code */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invitasjonskode</CardTitle>
          <CardDescription>
            Del denne koden med kollegaer for å gi dem tilgang til workspacen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <code className="flex h-10 items-center rounded-lg border bg-muted px-4 font-mono text-sm tracking-widest">
              {inviteCode}
            </code>
            <Button variant="outline" size="icon" onClick={handleCopy}>
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRegenerateCode}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Faresone
          </CardTitle>
          <CardDescription>
            Irreversible handlinger. Vær forsiktig.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Slett workspace</p>
              <p className="text-sm text-muted-foreground">
                Sletter all data permanent. Dette kan ikke angres.
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
                Slett workspace
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Er du sikker?</DialogTitle>
                  <DialogDescription>
                    Denne handlingen kan ikke angres. All data, inkludert
                    samtaler, kunnskapsbase og teammedlemmer, vil bli permanent
                    slettet.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 py-4">
                  <Label htmlFor="delete-confirm">
                    Skriv <strong>{workspaceName}</strong> for å bekrefte
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
                    Avbryt
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={deleteConfirm !== workspaceName}
                    onClick={() => setDeleteDialogOpen(false)}
                  >
                    Slett permanent
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
