import { ChatWidget } from "@/components/widget/chat-widget";
import { createClient } from "@/lib/supabase/server";
import { hasFeature } from "@/lib/plans";

export const dynamic = "force-dynamic";

export default async function WidgetPage({
  params,
  searchParams,
}: {
  params: Promise<{ chatbotId: string }>;
  searchParams: Promise<{ color?: string; position?: string; lang?: string }>;
}): Promise<React.ReactNode> {
  const { chatbotId } = await params;
  const query = await searchParams;

  const supabase = await createClient();
  const { data: config } = await supabase
    .from("chatbot_config")
    .select("name, welcome_message, welcome_messages, widget_styling, logo_url, workspace_id")
    .eq("id", chatbotId)
    .maybeSingle();

  const botName = config?.name ?? "ChatPulse";
  const lang = query.lang ?? undefined;
  const welcomeMessagesMap = (config?.welcome_messages as Record<string, string> | null) ?? {};
  const welcomeMessage =
    (lang && welcomeMessagesMap[lang]) || config?.welcome_message || "Hi! How can I help you?";
  const styling = config?.widget_styling as { primary_color?: string; position?: string } | null;
  const primaryColor = query.color ?? styling?.primary_color ?? "#6366f1";
  const rawLogoUrl = (config?.logo_url as string | undefined) ?? undefined;

  // Fetch workspace plan for feature checks
  let hideWatermark = false;
  let showLogo = false;
  if (config?.workspace_id) {
    const { data: ws } = await supabase
      .from("workspaces")
      .select("plan_id")
      .eq("id", config.workspace_id)
      .maybeSingle();
    if (ws?.plan_id) {
      hideWatermark = hasFeature(ws.plan_id, "white_label");
      showLogo = hasFeature(ws.plan_id, "logo");
    }
  }
  const logoUrl = showLogo ? rawLogoUrl : undefined;

  return (
    <div className="flex h-dvh w-full flex-col">
      <ChatWidget
        inline
        chatbotId={chatbotId}
        botName={botName}
        welcomeMessage={welcomeMessage}
        primaryColor={primaryColor}
        logoUrl={logoUrl}
        language={lang}
        hideWatermark={hideWatermark}
        className="h-full w-full !rounded-none border-0 shadow-none"
      />
    </div>
  );
}
