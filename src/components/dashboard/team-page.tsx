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
import { UserPlus } from "lucide-react";

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
    // In a real flow, workspaceId comes from context.
    // For now we pass it as a hidden field or from shell context.
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">
            Manage your workspace members and invitations.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>
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
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-role">Role</Label>
                  <select
                    id="invite-role"
                    name="role"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    defaultValue="member"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={pending}>
                  {pending ? "Sending..." : "Send invite"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            People with access to this workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 rounded-lg border p-4">
            <Avatar>
              <AvatarFallback className="bg-primary/10 text-primary">
                Y
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">You</p>
              <p className="text-xs text-muted-foreground">
                Signed in user
              </p>
            </div>
            <Badge variant="secondary">Owner</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
