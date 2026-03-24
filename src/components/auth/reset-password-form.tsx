"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/auth-actions";
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
import { Loader2, ArrowLeft, KeyRound } from "lucide-react";

export function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passordene samsvarer ikke.");
      setPending(false);
      return;
    }

    if (password.length < 6) {
      setError("Passordet må være minst 6 tegn.");
      setPending(false);
      return;
    }

    const result = await resetPassword(password);

    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <KeyRound className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Nytt passord</CardTitle>
        <CardDescription>
          Velg et nytt passord for kontoen din.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="animate-in fade-in slide-in-from-top-1 rounded-lg bg-destructive/10 p-3 text-sm text-destructive dark:bg-destructive/20">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="password">Nytt passord</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              disabled={pending}
              placeholder="Minst 6 tegn"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Bekreft passord</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              disabled={pending}
              placeholder="Gjenta passordet"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {pending ? "Oppdaterer..." : "Oppdater passord"}
          </Button>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Tilbake til innlogging
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
