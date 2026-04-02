import { Suspense } from "react";
import { InboxPageClient } from "@/components/dashboard/inbox-page";

export const metadata = {
  title: "Inbox",
};

export default function InboxPage(): React.ReactNode {
  return (
    <Suspense>
      <InboxPageClient />
    </Suspense>
  );
}
