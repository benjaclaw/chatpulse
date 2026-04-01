"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/auth-actions";
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
import { Loader2, ArrowLeft, KeyRound } from "lucide-react";
import { useAuthLanguage } from "@/hooks/use-auth-language";

export function ResetPasswordForm(): React.ReactNode {
  const { error, pending, handleSubmit } = useFormAction();
  const [clientError, setClientError] = useState<string | null>(null);
  const { t } = useAuthLanguage();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setClientError(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setClientError(t('auth.reset.mismatch'));
      return;
    }

    if (password.length < 8) {
      setClientError(t('auth.reset.tooShort'));
      return;
    }

    await handleSubmit(() => resetPassword(password));
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <KeyRound className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">{t('auth.reset.title')}</CardTitle>
        <CardDescription>
          {t('auth.reset.description')}
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <FormError message={clientError ?? error} />
          <div className="space-y-2">
            <Label htmlFor="password">{t('auth.reset.newPassword')}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              disabled={pending}
              placeholder={t('auth.reset.newPasswordPlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('auth.reset.confirmPassword')}</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              disabled={pending}
              placeholder={t('auth.reset.confirmPlaceholder')}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {pending ? t('auth.reset.updating') : t('auth.reset.update')}
          </Button>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('auth.reset.backToLogin')}
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
