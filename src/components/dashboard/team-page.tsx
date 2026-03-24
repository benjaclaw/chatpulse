"use client";

import { useState } from "react";
import { sendInvite } from "@/lib/invite-actions";
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
import { UserPlus, Users, Loader2, CheckCircle2 } from "lucide-react";

export function TeamPageClient() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await sendInvite("placeholder", formData);

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => {
        setDialogOpen(false);
        setSuccess(false);
      }, 1500);
    }
    setPending(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your workspace members and invitations.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button className="shrink-0" />}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite member
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite team member</DialogTitle>
              <DialogDescription>
                Send an invitation email to add a new member to your workspace.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInvite}>
              <div className="space-y-4 py-4">
                {error && (
                  <div className="animate-in fade-in slide-in-from-top-1 rounded-lg bg-destructive/10 p-3 text-sm text-destructive dark:bg-destructive/20">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="animate-in fade-in slide-in-from-top-1 flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-green-700 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Invitation sent successfully!
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Email address</Label>
                  <Input
                    id="invite-email"
                    name="email"
                    type="email"
                    placeholder="colleague@company.com"
                    required
                    disabled={pending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-role">Role</Label>
                  <select
                    id="invite-role"
                    name="role"
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-50"
                    defaultValue="member"
                    disabled={pending}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={pending}>
                  {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {pending ? "Sending..." : "Send invite"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Members card */}
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            People with access to this workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
            <Avatar>
              <AvatarFallback className="bg-primary/10 text-primary">
                Y
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">You</p>
              <p className="text-xs text-muted-foreground truncate">
                Signed in user
              </p>
            </div>
            <Badge variant="secondary">Owner</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Empty state hint */}
      <div className="rounded-xl border border-dashed bg-card/50 p-8 text-center dark:bg-card/20">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Users className="h-7 w-7 text-primary" />
        </div>
        <h3 className="mt-4 text-base font-semibold">Better together</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Invite your teammates to collaborate on your chatbot. They&apos;ll be able to manage knowledge, view conversations, and more.
        </p>
        <Button
          variant="outline"
          className="mt-5"
          onClick={() => setDialogOpen(true)}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Invite your first teammate
        </Button>
      </div>
    </div>
  );
}
