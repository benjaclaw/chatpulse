"use client";

import { use } from "react";
import { ChatWidget } from "@/components/widget/chat-widget";
import { mockWidgetConfigs, fallbackWidgetConfig } from "@/lib/mock-data";

export default function WidgetPage({
  params,
  searchParams,
}: {
  params: Promise<{ chatbotId: string }>;
  searchParams: Promise<{ color?: string; position?: string }>;
}): React.ReactNode {
  const { chatbotId } = use(params);
  const query = use(searchParams);

  const config = mockWidgetConfigs[chatbotId] ?? fallbackWidgetConfig;
  const primaryColor = query.color ?? config.primaryColor;

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
