export const metadata = {
  title: "Dashboard — ChatPulse",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to ChatPulse. Get started by adding knowledge to your chatbot.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="font-semibold">Knowledge Base</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add content your chatbot can use to answer questions.
          </p>
          <p className="mt-4 text-3xl font-bold">0</p>
          <p className="text-xs text-muted-foreground">articles</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="font-semibold">Conversations</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Chat sessions from your website visitors.
          </p>
          <p className="mt-4 text-3xl font-bold">0</p>
          <p className="text-xs text-muted-foreground">total</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="font-semibold">Unanswered Questions</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Questions your chatbot couldn&apos;t answer.
          </p>
          <p className="mt-4 text-3xl font-bold">0</p>
          <p className="text-xs text-muted-foreground">pending</p>
        </div>
      </div>
    </div>
  );
}
