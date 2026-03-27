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
    .select("name, welcome_message, welcome_messages, widget_styling, logo_url, workspace:workspaces!workspace_id(plan_id)")
    .eq("id", chatbotId)
    .maybeSingle();

  const botName = config?.name ?? "ChatPulse";
  const lang = query.lang ?? undefined;
  const welcomeMessagesMap = (config?.welcome_messages as Record<string, string> | null) ?? {};
  const welcomeMessage =
    (lang && welcomeMessagesMap[lang]) || config?.welcome_message || "Hei! Hvordan kan jeg hjelpe deg?";
  const styling = config?.widget_styling as { primary_color?: string; position?: string } | null;
  const primaryColor = styling?.primary_color ?? query.color ?? "#6366f1";
  const rawLogoUrl = (config?.logo_url as string | undefined) ?? undefined;

  // Check workspace plan features (fetched via join above — no extra query)
  let hideWatermark = false;
  let showLogo = false;
  const ws = config?.workspace as unknown as { plan_id: string } | null;
  if (ws?.plan_id) {
    hideWatermark = hasFeature(ws.plan_id, "white_label");
    showLogo = hasFeature(ws.plan_id, "logo");
  }
  const logoUrl = showLogo ? rawLogoUrl : undefined;

  return (
    <div className="flex h-dvh w-full flex-col">
      {/* Inline loading state — visible until React hydrates and mounts ChatWidget */}
      <div
        id="widget-loader"
        className="flex h-full w-full flex-col bg-card border"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 animate-pulse" />
            <div>
              <p className="text-sm font-semibold text-white">ChatPulse</p>
              <p className="flex items-center gap-1.5 text-xs text-white/70">AI-assistent</p>
            </div>
          </div>
        </div>
        {/* Message area (empty, skeleton) */}
        <div className="relative flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-muted h-10 animate-pulse rounded-bl-md" />
            </div>
            <div className="flex justify-start">
              <div className="max-w-[60%] rounded-2xl px-4 py-2 bg-muted h-10 animate-pulse rounded-bl-md" />
            </div>
          </div>
        </div>
        {/* Input area (disabled) */}
        <div className="border-t p-3">
          <div className="flex items-end gap-2">
            <div className="flex-1 h-10 rounded-lg bg-muted animate-pulse" />
            <div className="h-9 w-9 rounded-lg bg-muted animate-pulse" />
          </div>
        </div>
      </div>
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
