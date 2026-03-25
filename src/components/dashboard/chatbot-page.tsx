"use client";

import { useState, useEffect } from "react";
import { useWorkspace } from "@/contexts/workspace-context";
import { createClient } from "@/lib/supabase/client";
import { useClipboard } from "@/hooks/use-clipboard";
import { useTemporaryFlag } from "@/hooks/use-temporary-flag";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChatWidget } from "@/components/widget/chat-widget";
import { Bot, Eye, Code2, Copy, Check } from "lucide-react";
import type { ChatbotConfig } from "@/lib/types";

const defaultConfig = (workspaceId: string): ChatbotConfig => ({
  id: "",
  workspace_id: workspaceId,
  name: "Chatbot",
  prompt: "Du er en hjelpsom kundeserviceassistent. Svar alltid på norsk. Vær vennlig og profesjonell.",
  welcome_message: "Hei! Hvordan kan jeg hjelpe deg i dag?",
  fallback_response: "Beklager, jeg fant ikke svaret på det. Vil du snakke med en av våre medarbeidere?",
  widget_styling: {
    primary_color: "#6366f1",
    position: "right",
  },
});

export function ChatbotPageClient(): React.ReactNode {
  const workspace = useWorkspace();
  const supabase = createClient();
  const [config, setConfig] = useState<ChatbotConfig>(defaultConfig(workspace.id));
  const [loading, setLoading] = useState(true);
  const { copied, copy } = useClipboard();
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
            Chatbot-konfigurasjon
          </h1>
          <p className="mt-1 text-muted-foreground">
            Tilpass chatboten og se en live forhåndsvisning.
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
          Chatbot-konfigurasjon
        </h1>
        <p className="mt-1 text-muted-foreground">
          Tilpass chatboten og se en live forhåndsvisning.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Config form */}
        <div className="space-y-6">
          {/* Bot name */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-semibold">
              <Bot className="h-4 w-4 text-primary" />
              Generelt
            </h3>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bot-name">Chatbot-navn</Label>
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
            <h3 className="font-semibold">Meldinger</h3>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="system-prompt">System prompt</Label>
                <Textarea
                  id="system-prompt"
                  value={config.prompt}
                  onChange={(e) => update("prompt", e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Instruksjoner som styrer chatbotens oppførsel.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="welcome-msg">Velkomstmelding</Label>
                <Input
                  id="welcome-msg"
                  value={config.welcome_message}
                  onChange={(e) => update("welcome_message", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fallback-msg">Fallback-respons</Label>
                <Input
                  id="fallback-msg"
                  value={config.fallback_response}
                  onChange={(e) => update("fallback_response", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Vises når chatboten ikke finner et svar.
                </p>
              </div>
            </div>
          </div>

          {/* Widget styling */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-semibold">
              <Eye className="h-4 w-4 text-primary" />
              Widget-utseende
            </h3>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primærfarge</Label>
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
                <Label>Posisjon</Label>
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
                    Venstre
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
                    Høyre
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Button className="w-full sm:w-auto" onClick={handleSave}>
            {saved ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Lagret!
              </>
            ) : (
              "Lagre endringer"
            )}
          </Button>

          {/* Embed code */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-semibold">
              <Code2 className="h-4 w-4 text-primary" />
              Embed på nettside
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Lim inn denne kodesnutten rett før{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
                &lt;/body&gt;
              </code>{" "}
              på nettsiden din.
            </p>
            <div className="relative mt-4">
              <pre className="overflow-x-auto rounded-lg border bg-muted/50 p-4 text-sm font-mono leading-relaxed">
                <code>{`<script
  src="https://chatpulse-ten.vercel.app/widget.js"
  data-chatbot-id="${config.id}"
  data-primary-color="${config.widget_styling.primary_color}"
  data-position="${config.widget_styling.position}">
</script>`}</code>
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute right-2 top-2"
                onClick={() =>
                  copy(
                    `<script src="https://chatpulse-ten.vercel.app/widget.js" data-chatbot-id="${config.id}" data-primary-color="${config.widget_styling.primary_color}" data-position="${config.widget_styling.position}"></script>`
                  )
                }
              >
                {copied ? (
                  <>
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                    Kopiert!
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 h-3.5 w-3.5" />
                    Kopier kode
                  </>
                )}
              </Button>
            </div>
            {/* Mini preview */}
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Forhåndsvisning av knapp
              </p>
              <div className="flex items-center gap-3 rounded-lg border bg-background p-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full shadow-md"
                  style={{
                    backgroundColor: config.widget_styling.primary_color,
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <span className="text-sm text-muted-foreground">
                  Denne knappen vises nederst{" "}
                  {config.widget_styling.position === "right"
                    ? "til høyre"
                    : "til venstre"}{" "}
                  på nettsiden
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live preview */}
        <div className="lg:sticky lg:top-8">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Eye className="h-4 w-4" />
              Forhåndsvisning
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
