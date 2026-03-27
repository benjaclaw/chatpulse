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
        className="flex h-full w-full flex-col items-center justify-center gap-3"
        style={{ color: primaryColor }}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" width={40} height={40} className="animate-pulse rounded-full" />
        ) : (
          <svg className="animate-pulse" width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="currentColor" opacity="0.15" />
            <path d="M12 20h4m4 0h8M12 26h16M12 14h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
        <span className="text-sm animate-pulse opacity-70">Laster…</span>
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
