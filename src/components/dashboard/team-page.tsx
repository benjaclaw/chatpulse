"use client";

import { useState, useRef, useEffect } from "react";
import { mockTeamMembers } from "@/lib/mock-data";
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
import { ROLE_BADGE_VARIANT, ROLE_LABEL } from "@/lib/types";

export function TeamPageClient(): React.ReactNode {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleInvite(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    setSuccess(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setDialogOpen(false);
      setSuccess(false);
    }, 1500);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="mt-1 text-muted-foreground">
            Administrer teammedlemmer og invitasjoner.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button className="shrink-0" />}>
            <UserPlus className="mr-2 h-4 w-4" />
            Inviter medlem
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Inviter teammedlem</DialogTitle>
              <DialogDescription>
                Send en invitasjon for å legge til et nytt medlem i workspacen.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInvite}>
              <div className="space-y-4 py-4">
                {success && (
                  <div className="animate-in fade-in slide-in-from-top-1 flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-green-700 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Invitasjon sendt!
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="invite-email">E-postadresse</Label>
                  <Input
                    id="invite-email"
                    name="email"
                    type="email"
                    placeholder="kollega@bedrift.no"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-role">Rolle</Label>
                  <select
                    id="invite-role"
                    name="role"
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-50"
                    defaultValue="member"
                  >
                    <option value="member">Medlem</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Send invitasjon</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Members card */}
      <Card>
        <CardHeader>
          <CardTitle>Medlemmer</CardTitle>
          <CardDescription>
            Personer med tilgang til denne workspacen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockTeamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
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
                  {ROLE_LABEL[member.role] ?? member.role}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
