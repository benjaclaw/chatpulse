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
        <CardTitle className="text-2xl font-bold">
          You&apos;ve been invited!
        </CardTitle>
        <CardDescription>
          Click below to join the workspace and start collaborating.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
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
          {pending ? "Joining..." : "Accept invite"}
        </Button>
      </CardFooter>
    </Card>
  );
}
