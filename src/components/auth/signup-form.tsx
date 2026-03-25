"use client";

import { useState } from "react";
import Link from "next/link";
import { signup } from "@/lib/auth-actions";
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
import { Loader2 } from "lucide-react";
import { createT, type Language } from "@/lib/i18n";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

export function SignupForm(): React.ReactNode {
  const { error, pending, handleSubmit } = useFormAction();
  const [language] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('chatpulse_lang') as Language) || 'nb';
    }
    return 'nb';
  });
  const t = createT(language);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await handleSubmit(() => signup(formData));
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">{t('auth.signup.title')}</CardTitle>
        <CardDescription>
          {t('auth.signup.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <GoogleSignInButton />
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">eller</span>
          </div>
        </div>
      </CardContent>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <FormError message={error} />
          <div className="space-y-2">
            <Label htmlFor="name">{t('auth.signup.name')}</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder={t('auth.signup.namePlaceholder')}
              required
              autoComplete="name"
              disabled={pending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.signup.email')}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t('auth.signup.emailPlaceholder')}
              required
              autoComplete="email"
              disabled={pending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('auth.signup.password')}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              disabled={pending}
            />
            <p className="text-xs text-muted-foreground">
              {t('auth.signup.passwordHelp')}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {pending ? t('auth.signup.creating') : t('auth.signup.create')}
          </Button>
          <p className="text-sm text-muted-foreground">
            {t('auth.signup.hasAccount')}{" "}
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 transition-colors hover:underline"
            >
              {t('auth.signup.signIn')}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
