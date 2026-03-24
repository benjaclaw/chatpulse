"use client";

import { useState } from "react";
import { createWorkspace } from "@/lib/workspace-actions";
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

export function CreateWorkspaceForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createWorkspace(formData);

    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          Create your workspace
        </CardTitle>
        <CardDescription>
          A workspace is where your team manages your AI chatbot
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Workspace name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Acme Inc."
              required
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Usually your company or team name
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Creating..." : "Create workspace"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
