import { AcceptInviteClient } from "@/components/invite/accept-invite";
import { CenteredLayout } from "@/components/auth/centered-layout";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Accept Invite — ChatPulse",
};

export default async function AcceptInvitePage(props: {
  searchParams: Promise<{ token?: string }>;
}): Promise<React.ReactNode> {
  const searchParams = await props.searchParams;
  const token = searchParams.token;

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">Invalid invite link</h1>
          <p className="mt-2 text-muted-foreground">
            This invite link is missing a token.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <CenteredLayout>
      <AcceptInviteClient token={token} />
    </CenteredLayout>
  );
}
