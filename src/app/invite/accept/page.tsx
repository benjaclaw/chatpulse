import { AcceptInviteClient } from "@/components/invite/accept-invite";

export const metadata = {
  title: "Accept Invite — ChatPulse",
};

export default async function AcceptInvitePage(props: {
  searchParams: Promise<{ token?: string }>;
}) {
  const searchParams = await props.searchParams;
  const token = searchParams.token;

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Invalid invite link</h1>
          <p className="mt-2 text-muted-foreground">
            This invite link is missing a token.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <AcceptInviteClient token={token} />
    </div>
  );
}
