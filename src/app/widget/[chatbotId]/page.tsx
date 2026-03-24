"use client";

import { use } from "react";
import { ChatWidget } from "@/components/widget/chat-widget";

// Mock chatbot configs — will be replaced with real DB lookups
const mockConfigs: Record<
  string,
  { name: string; welcomeMessage: string; primaryColor: string }
> = {
  abc123: {
    name: "Kundeservice Bot",
    welcomeMessage: "Hei! Hvordan kan jeg hjelpe deg i dag? 👋",
    primaryColor: "#6366f1",
  },
  demo: {
    name: "ChatPulse Demo",
    welcomeMessage: "Hei! Prøv å stille meg et spørsmål 😊",
    primaryColor: "#6366f1",
  },
};

const fallbackConfig = {
  name: "ChatPulse",
  welcomeMessage: "Hei! Hvordan kan jeg hjelpe deg? 👋",
  primaryColor: "#6366f1",
};

export default function WidgetPage({
  params,
  searchParams,
}: {
  params: Promise<{ chatbotId: string }>;
  searchParams: Promise<{ color?: string; position?: string }>;
}) {
  const { chatbotId } = use(params);
  const query = use(searchParams);

  const config = mockConfigs[chatbotId] || fallbackConfig;
  const primaryColor = query.color || config.primaryColor;

  return (
    <div className="flex h-dvh w-full flex-col">
      <ChatWidget
        inline
        botName={config.name}
        welcomeMessage={config.welcomeMessage}
        primaryColor={primaryColor}
        className="h-full w-full !rounded-none border-0 shadow-none"
      />
    </div>
  );
}
