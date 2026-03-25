"use client";

import { useState, useEffect } from "react";
import { useWorkspace } from "@/contexts/workspace-context";
import { createClient } from "@/lib/supabase/client";
import { useClipboard } from "@/hooks/use-clipboard";
import { useTemporaryFlag } from "@/hooks/use-temporary-flag";
import { useLanguage } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChatWidget } from "@/components/widget/chat-widget";
import { Bot, Eye, Code2, Copy, Check } from "lucide-react";
import type { ChatbotConfig } from "@/lib/types";

const DEFAULT_STYLING = { primary_color: "#6366f1", position: "right" as const };

export function ChatbotPageClient(): React.ReactNode {
  const workspace = useWorkspace();
  const supabase = createClient();
  const { t, language } = useLanguage();
  const [config, setConfig] = useState<ChatbotConfig>({
    id: "",
    workspace_id: workspace.id,
    name: "Chatbot",
    prompt: t('chatbot.defaultPrompt'),
    welcome_message: t('chatbot.defaultWelcome'),
    fallback_response: t('chatbot.defaultFallback'),
    widget_styling: DEFAULT_STYLING,
  });
  const [loading, setLoading] = useState(true);
  const { copied, copy } = useClipboard();

  const widgetBase = "https://chatpulse-ten.vercel.app";
  const directLink = config.id ? `${widgetBase}/widget/${config.id}` : "";
  const scriptEmbed = config.id ? `<script async\n  src="${widgetBase}/widget.js"\n  data-chatbot-id="${config.id}"\n  data-primary-color="${config.widget_styling.primary_color}"\n  data-position="${config.widget_styling.position}">\n</script>` : "";
  const iframeEmbed = config.id ? `<iframe\n  src="${widgetBase}/widget/${config.id}"\n  style="width:400px;height:600px;border:none;border-radius:12px;"\n  title="ChatPulse"\n  allow="clipboard-write">\n</iframe>` : "";
  const { active: saved, trigger: triggerSaved } = useTemporaryFlag();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data } = await supabase
        .from("chatbot_config")
        .select("id, workspace_id, name, prompt, welcome_message, fallback_response, widget_styling")
        .eq("workspace_id", workspace.id)
        .limit(1)
        .maybeSingle();
      if (!cancelled) {
        if (data) {
          setConfig({
            id: data.id,
            workspace_id: data.workspace_id,
            name: data.name,
            prompt: data.prompt,
            welcome_message: data.welcome_message,
            fallback_response: data.fallback_response,
            widget_styling: data.widget_styling ?? { primary_color: "#6366f1", position: "right" as const },
          });
        }
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [workspace.id, supabase]);

  function update<K extends keyof ChatbotConfig>(
    key: K,
    value: ChatbotConfig[K]
  ) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function updateStyling<
    K extends keyof ChatbotConfig["widget_styling"],
  >(key: K, value: ChatbotConfig["widget_styling"][K]) {
    setConfig((prev) => ({
      ...prev,
      widget_styling: { ...prev.widget_styling, [key]: value },
    }));
  }

  async function handleSave() {
    const payload = {
      name: config.name,
      prompt: config.prompt,
      welcome_message: config.welcome_message,
      fallback_response: config.fallback_response,
      widget_styling: config.widget_styling,
    };

    if (config.id) {
      await supabase
        .from("chatbot_config")
        .update(payload)
        .eq("id", config.id);
    } else {
      const { data } = await supabase
        .from("chatbot_config")
        .insert({ ...payload, workspace_id: workspace.id })
        .select("id, workspace_id, name, prompt, welcome_message, fallback_response, widget_styling")
        .single();
      if (data) {
        setConfig({
          id: data.id,
          workspace_id: data.workspace_id,
          name: data.name,
          prompt: data.prompt,
          welcome_message: data.welcome_message,
          fallback_response: data.fallback_response,
          widget_styling: data.widget_styling ?? { primary_color: "#6366f1", position: "right" as const },
        });
      }
    }
    triggerSaved();
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('chatbot.title')}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {t('chatbot.description')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('chatbot.title')}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t('chatbot.description')}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Config form */}
        <div className="space-y-6">
          {/* Bot name */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-semibold">
              <Bot className="h-4 w-4 text-primary" />
              {t('chatbot.general')}
            </h3>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bot-name">{t('chatbot.botName')}</Label>
                <Input
                  id="bot-name"
                  value={config.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Prompts */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold">{t('chatbot.messages')}</h3>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="system-prompt">{t('chatbot.systemPrompt')}</Label>
                <Textarea
                  id="system-prompt"
                  value={config.prompt}
                  onChange={(e) => update("prompt", e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  {t('chatbot.systemPromptHelp')}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="welcome-msg">{t('chatbot.welcomeMessage')}</Label>
                <Input
                  id="welcome-msg"
                  value={config.welcome_message}
                  onChange={(e) => update("welcome_message", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fallback-msg">{t('chatbot.fallbackResponse')}</Label>
                <Input
                  id="fallback-msg"
                  value={config.fallback_response}
                  onChange={(e) => update("fallback_response", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {t('chatbot.fallbackHelp')}
                </p>
              </div>
            </div>
          </div>

          {/* Widget styling */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-semibold">
              <Eye className="h-4 w-4 text-primary" />
              {t('chatbot.widgetAppearance')}
            </h3>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primary-color">{t('chatbot.primaryColor')}</Label>
                <div className="flex items-center gap-3">
                  <input
                    id="primary-color"
                    type="color"
                    value={config.widget_styling.primary_color}
                    onChange={(e) =>
                      updateStyling("primary_color", e.target.value)
                    }
                    className="h-10 w-14 cursor-pointer rounded-lg border bg-background p-1"
                  />
                  <Input
                    value={config.widget_styling.primary_color}
                    onChange={(e) =>
                      updateStyling("primary_color", e.target.value)
                    }
                    className="max-w-[140px] font-mono text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('chatbot.position')}</Label>
                <div className="flex gap-2">
                  <Button
                    variant={
                      config.widget_styling.position === "left"
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => updateStyling("position", "left")}
                  >
                    {t('chatbot.positionLeft')}
                  </Button>
                  <Button
                    variant={
                      config.widget_styling.position === "right"
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => updateStyling("position", "right")}
                  >
                    {t('chatbot.positionRight')}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Button className="w-full sm:w-auto" onClick={handleSave}>
            {saved ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                {t('common.saved')}
              </>
            ) : (
              t('common.saveChanges')
            )}
          </Button>

          {/* Share & Embed */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-semibold">
              <Code2 className="h-4 w-4 text-primary" />
              {t('chatbot.embed')}
            </h3>

            <div className="mt-4 space-y-4">
              {/* Direct link */}
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{language === "nb" ? "Direkte lenke" : "Direct link"}</p>
                    <p className="text-xs text-muted-foreground">{language === "nb" ? "Del denne lenken — ingen embed nødvendig" : "Share this link — no embed needed"}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => copy(directLink)}>
                    {copied ? <><Check className="mr-1.5 h-3.5 w-3.5" />{t('common.copied')}</> : <><Copy className="mr-1.5 h-3.5 w-3.5" />{t('common.copy')}</>}
                  </Button>
                </div>
                <code className="mt-2 block truncate rounded bg-muted px-3 py-2 text-xs font-mono text-muted-foreground">{directLink}</code>
              </div>

              {/* Script embed (floating widget) */}
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium">{language === "nb" ? "Flytende widget (script)" : "Floating widget (script)"}</p>
                <p className="text-xs text-muted-foreground mb-3">
                  {t('chatbot.embedHelp')}{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">&lt;/body&gt;</code>{" "}
                  {t('chatbot.embedHelpSuffix')}
                </p>
                <div className="relative">
                  <pre className="overflow-x-auto rounded-lg border bg-muted/50 p-3 text-xs font-mono leading-relaxed">
                    <code>{scriptEmbed}</code>
                  </pre>
                  <Button variant="outline" size="sm" className="absolute right-2 top-2" onClick={() => copy(scriptEmbed)}>
                    {copied ? <><Check className="mr-1.5 h-3.5 w-3.5" />{t('common.copied')}</> : <><Copy className="mr-1.5 h-3.5 w-3.5" />{t('common.copyCode')}</>}
                  </Button>
                </div>
              </div>

              {/* Inline iframe */}
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium">{language === "nb" ? "Inline iframe" : "Inline iframe"}</p>
                <p className="text-xs text-muted-foreground mb-3">{language === "nb" ? "Embed direkte i en div på siden" : "Embed directly in a div on your page"}</p>
                <div className="relative">
                  <pre className="overflow-x-auto rounded-lg border bg-muted/50 p-3 text-xs font-mono leading-relaxed">
                    <code>{iframeEmbed}</code>
                  </pre>
                  <Button variant="outline" size="sm" className="absolute right-2 top-2" onClick={() => copy(iframeEmbed)}>
                    {copied ? <><Check className="mr-1.5 h-3.5 w-3.5" />{t('common.copied')}</> : <><Copy className="mr-1.5 h-3.5 w-3.5" />{t('common.copyCode')}</>}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live preview */}
        <div className="lg:sticky lg:top-8">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Eye className="h-4 w-4" />
              {t('chatbot.preview')}
            </h3>
            <ChatWidget
              inline
              chatbotId={config.id || undefined}
              botName={config.name}
              welcomeMessage={config.welcome_message}
              primaryColor={config.widget_styling.primary_color}
              position={config.widget_styling.position}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
