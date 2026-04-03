"use client";

import { useState } from "react";
import Link from "next/link";
import { login } from "@/lib/auth-actions";
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
import { Loader2, Eye, EyeOff } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { useAuthLanguage } from "@/hooks/use-auth-language";

export function LoginForm(): React.ReactNode {
  const { error, pending, handleSubmit } = useFormAction();
  const [showPassword, setShowPassword] = useState(false);
  const { t, redirectParam } = useAuthLanguage();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (redirectParam) {
      formData.set("redirect", redirectParam);
    }
    await handleSubmit(() => login(formData));
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">{t('auth.login.title')}</CardTitle>
        <CardDescription>{t('auth.login.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <GoogleSignInButton redirectTo={redirectParam} />
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
            <Label htmlFor="email">{t('auth.login.email')}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t('auth.login.emailPlaceholder')}
              required
              autoComplete="email"
              disabled={pending}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t('auth.login.password')}</Label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-primary underline-offset-4 transition-colors hover:underline"
              >
                {t('auth.login.forgotPassword')}
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                disabled={pending}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {pending ? t('auth.login.signingIn') : t('auth.login.signIn')}
          </Button>
          <p className="text-sm text-muted-foreground">
            {t('auth.login.noAccount')}{" "}
            <Link
              href={redirectParam ? `/signup?redirect=${encodeURIComponent(redirectParam)}` : "/signup"}
              className="font-medium text-primary underline-offset-4 transition-colors hover:underline"
            >
              {t('auth.login.signUp')}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
