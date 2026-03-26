import { Suspense } from "react";
import { ChatbotPageClient } from "@/components/dashboard/chatbot-page";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Chatbot",
};

export default function ChatbotPage(): React.ReactNode {
  return (
    <Suspense>
      <ChatbotPageClient />
    </Suspense>
  );
}
