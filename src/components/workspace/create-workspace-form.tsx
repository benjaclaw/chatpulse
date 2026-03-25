"use client";

import { useState } from "react";
import { createWorkspace } from "@/lib/workspace-actions";
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
import { Building2, Loader2, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-actions";
import { createT, type Language } from "@/lib/i18n";

export function CreateWorkspaceForm(): React.ReactNode {
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
    await handleSubmit(() => createWorkspace(formData));
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Building2 className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">
          {t('workspace.createTitle')}
        </CardTitle>
        <CardDescription>
          {t('workspace.createDescription')}
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <FormError message={error} />
          <div className="space-y-2">
            <Label htmlFor="name">{t('workspace.nameLabel')}</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder={t('workspace.namePlaceholder')}
              required
              autoFocus
              disabled={pending}
            />
            <p className="text-xs text-muted-foreground">
              {t('workspace.nameHelp')}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {pending ? t('workspace.creating') : t('workspace.create')}
          </Button>
          <button
            type="button"
            onClick={() => signOut()}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-3 w-3" />
            {t('workspace.signOut')}
          </button>
        </CardFooter>
      </form>
    </Card>
  );
}
