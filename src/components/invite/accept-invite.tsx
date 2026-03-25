"use client";

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

export function AcceptInviteClient({ token }: { token: string }): React.ReactNode {
  const { error, pending, handleSubmit } = useFormAction();

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
          You&apos;ve been invited!
        </CardTitle>
        <CardDescription>
          Click below to join the workspace and start collaborating.
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
          {pending ? "Joining..." : "Accept invite"}
        </Button>
      </CardFooter>
    </Card>
  );
}
