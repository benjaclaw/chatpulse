import { InboxPageClient } from "@/components/dashboard/inbox-page";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Inbox",
};

export default function InboxPage(): React.ReactNode {
  return <InboxPageClient />;
}
