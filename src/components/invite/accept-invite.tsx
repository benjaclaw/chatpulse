"use client";

import { useState } from "react";
import { acceptInvite } from "@/lib/invite-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Mail } from "lucide-react";

export function AcceptInviteClient({ token }: { token: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleAccept() {
    setPending(true);
    setError(null);

    const result = await acceptInvite(token);

    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">
          You&apos;ve been invited!
        </CardTitle>
        <CardDescription>
          Click below to join the workspace and start collaborating.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="animate-in fade-in slide-in-from-top-1 rounded-lg bg-destructive/10 p-3 text-sm text-destructive dark:bg-destructive/20">
            {error}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleAccept}
          className="w-full"
          disabled={pending}
        >
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {pending ? "Joining..." : "Accept invite"}
        </Button>
      </CardFooter>
    </Card>
  );
}
