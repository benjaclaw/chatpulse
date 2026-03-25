"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/lib/auth-actions";
import { useFormAction } from "@/hooks/use-form-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

export function ForgotPasswordForm(): React.ReactNode {
  const { error, pending, handleSubmit } = useFormAction();
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    await handleSubmit(async () => {
      const result = await forgotPassword(email);
      if (result?.success) {
        setSent(true);
      }
      return result;
    });
  }

  if (sent) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Sjekk e-posten din</CardTitle>
          <CardDescription>
            Vi har sendt en lenke for &#229; tilbakestille passordet ditt. Sjekk innboksen din.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 transition-colors hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Tilbake til innlogging
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Glemt passord?</CardTitle>
        <CardDescription>
          Skriv inn e-posten din, s&#229; sender vi deg en lenke for &#229; tilbakestille passordet.
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <FormError message={error} />
          <div className="space-y-2">
            <Label htmlFor="email">E-post</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="deg@bedrift.no"
              required
              autoComplete="email"
              disabled={pending}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {pending ? "Sender..." : "Send reset-lenke"}
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
