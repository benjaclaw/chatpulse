"use client";

import { useState } from "react";
import { mockChatbotConfig } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChatWidget } from "@/components/widget/chat-widget";
import { Bot, Eye } from "lucide-react";

export default function ChatbotConfigPage() {
  const [config, setConfig] = useState(mockChatbotConfig);

  function update<K extends keyof typeof config>(
    key: K,
    value: (typeof config)[K]
  ) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function updateStyling<
    K extends keyof typeof config.widget_styling,
  >(key: K, value: (typeof config.widget_styling)[K]) {
    setConfig((prev) => ({
      ...prev,
      widget_styling: { ...prev.widget_styling, [key]: value },
    }));
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

          <Button className="w-full sm:w-auto">Lagre endringer</Button>
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
