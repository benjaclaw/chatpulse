"use client";

import { useState } from "react";
import Link from "next/link";
import { acceptInvite } from "@/lib/invite-actions";
import { useFormAction } from "@/hooks/use-form-action";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Mail, CheckCircle2, LogIn } from "lucide-react";
import { createT, type Language } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Props {
  token: string;
  isAuthenticated: boolean;
}

export function AcceptInviteClient({ token, isAuthenticated }: Props): React.ReactNode {
  const { error, pending, handleSubmit } = useFormAction();
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);
  const [language] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('chatpulse_lang') as Language) || 'nb';
    }
    return 'nb';
  });
  const t = createT(language);

  const redirectPath = `/invite/accept?token=${encodeURIComponent(token)}`;

  async function handleAccept(): Promise<void> {
    await handleSubmit(async () => {
      const result = await acceptInvite(token);
      if (result && 'success' in result && result.success) {
        setWorkspaceName(result.workspaceName);
      }
      return result;
    });
  }

  // Success state
  if (workspaceName) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {t('invite.successTitle')}
          </CardTitle>
          <CardDescription>
            {t('invite.successDescription').replace('{workspace}', workspaceName)}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/dashboard" className={cn(buttonVariants(), "w-full")}>
            {t('invite.goToDashboard')}
          </Link>
        </CardFooter>
      </Card>
    );
  }

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {t('invite.title')}
          </CardTitle>
          <CardDescription>
            {t('invite.loginRequired')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href={`/login?redirect=${encodeURIComponent(redirectPath)}`} className={cn(buttonVariants(), "w-full")}>
            {t('invite.loginToJoin')}
          </Link>
          <Link href={`/signup?redirect=${encodeURIComponent(redirectPath)}`} className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
            {t('invite.signupToJoin')}
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Authenticated state — show accept button
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">
          {t('invite.title')}
        </CardTitle>
        <CardDescription>
          {t('invite.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <FormError message={error} />
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleAccept}
          className="w-full"
          disabled={pending}
        >
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {pending ? t('invite.joining') : t('invite.accept')}
        </Button>
      </CardFooter>
    </Card>
  );
}
