import { ChatWidget } from "@/components/widget/chat-widget";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function WidgetPage({
  params,
  searchParams,
}: {
  params: Promise<{ chatbotId: string }>;
  searchParams: Promise<{ color?: string; position?: string }>;
}): Promise<React.ReactNode> {
  const { chatbotId } = await params;
  const query = await searchParams;

  const supabase = await createClient();
  const { data: config } = await supabase
    .from("chatbot_config")
    .select("name, welcome_message, widget_styling, logo_url")
    .eq("id", chatbotId)
    .maybeSingle();

  const botName = config?.name ?? "ChatPulse";
  const welcomeMessage = config?.welcome_message ?? "Hi! How can I help you?";
  const styling = config?.widget_styling as { primary_color?: string; position?: string } | null;
  const primaryColor = query.color ?? styling?.primary_color ?? "#6366f1";
  const logoUrl = (config?.logo_url as string | undefined) ?? undefined;

  return (
    <div className="flex h-dvh w-full flex-col">
      <ChatWidget
        inline
        chatbotId={chatbotId}
        botName={botName}
        welcomeMessage={welcomeMessage}
        primaryColor={primaryColor}
        logoUrl={logoUrl}
        className="h-full w-full !rounded-none border-0 shadow-none"
      />
    </div>
  );
}
