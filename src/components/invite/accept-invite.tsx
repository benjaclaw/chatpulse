"use client";

import { useState } from "react";
import { acceptInvite } from "@/lib/invite-actions";
import { useFormAction } from "@/hooks/use-form-action";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Mail } from "lucide-react";
import { createT, type Language } from "@/lib/i18n";

export function AcceptInviteClient({ token }: { token: string }): React.ReactNode {
  const { error, pending, handleSubmit } = useFormAction();
  const [language] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('chatpulse_lang') as Language) || 'nb';
    }
    return 'nb';
  });
  const t = createT(language);

  async function handleAccept(): Promise<void> {
    await handleSubmit(() => acceptInvite(token));
  }

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
      <CardContent>
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
