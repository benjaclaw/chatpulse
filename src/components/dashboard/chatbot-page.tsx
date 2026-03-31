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
import { Bot, Eye, Code2, Copy, Check, Upload, Trash2, Globe, Plus, X, MessageSquare } from "lucide-react";
import type { ChatbotConfig } from "@/lib/types";
import { hasFeature } from "@/lib/plans";
import { UpgradeBanner } from "./upgrade-banner";

const DEFAULT_STYLING = { primary_color: "#6366f1", position: "right" as const };

const LANGUAGE_OPTIONS: { code: string; label: string }[] = [
  { code: "nb", label: "Norsk bokmål" },
  { code: "en", label: "English" },
  { code: "sv", label: "Svenska" },
  { code: "da", label: "Dansk" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "pl", label: "Polski" },
  { code: "nl", label: "Nederlands" },
  { code: "fi", label: "Suomi" },
];

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

  const widgetBase = "https://chatpulse.no";
  const directLink = config.id ? `${widgetBase}/widget/${config.id}` : "";
  const scriptEmbed = config.id ? `<script async\n  src="${widgetBase}/widget.js"\n  data-chatbot-id="${config.id}">\n</script>` : "";
  const iframeEmbed = config.id ? `<iframe\n  src="${widgetBase}/widget/${config.id}"\n  style="width:400px;height:600px;border:none;border-radius:12px;"\n  title="ChatPulse"\n  allow="clipboard-write">\n</iframe>` : "";
  const { active: saved, trigger: triggerSaved } = useTemporaryFlag();
  const [uploading, setUploading] = useState(false);
  const [welcomeMessages, setWelcomeMessages] = useState<Record<string, string>>({});

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "png";
      const path = `${workspace.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("logos").upload(path, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("logos").getPublicUrl(path);
      update("logo_url", urlData.publicUrl);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function handleLogoRemove() {
    update("logo_url", undefined as unknown as string);
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data } = await supabase
        .from("chatbot_config")
        .select("id, workspace_id, name, prompt, welcome_message, welcome_messages, fallback_response, widget_styling, logo_url")
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
            logo_url: data.logo_url ?? undefined,
            widget_styling: data.widget_styling ?? { primary_color: "#6366f1", position: "right" as const },
          });
          const wm = data.welcome_messages as Record<string, string> | null;
          if (wm && Object.keys(wm).length > 0) {
            setWelcomeMessages(wm);
          } else {
            setWelcomeMessages({ nb: data.welcome_message });
          }
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
      welcome_messages: welcomeMessages,
      fallback_response: config.fallback_response,
      logo_url: config.logo_url ?? null,
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
        .select("id, workspace_id, name, prompt, welcome_message, welcome_messages, fallback_response, widget_styling, logo_url")
        .single();
      if (data) {
        setConfig({
          id: data.id,
          workspace_id: data.workspace_id,
          name: data.name,
          prompt: data.prompt,
          welcome_message: data.welcome_message,
          fallback_response: data.fallback_response,
          logo_url: data.logo_url ?? undefined,
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
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] animate-scroll-fade">
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-card p-6 shadow-sm">
                <div className="h-5 w-32 rounded-md bg-muted animate-shimmer" />
                <div className="mt-4 space-y-4">
                  <div className="h-4 w-20 rounded bg-muted animate-shimmer" />
                  <div className="h-10 w-full rounded-lg bg-muted animate-shimmer" />
                </div>
              </div>
            ))}
          </div>
          <div className="hidden lg:block">
            <div className="h-[480px] rounded-xl border bg-muted animate-shimmer" />
          </div>
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
              <div className="space-y-2">
                <Label>{language === "nb" ? "Logo" : "Logo"}</Label>
                {hasFeature(workspace.plan_id, "logo") ? (
                  <div className="flex items-center gap-3">
                    {config.logo_url && (
                      <img
                        src={config.logo_url}
                        alt="Logo"
                        className="h-10 w-10 rounded-full object-cover border"
                      />
                    )}
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                        className="hidden"
                        onChange={handleLogoUpload}
                        disabled={uploading}
                      />
                      <span className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent transition-colors">
                        <Upload className="h-4 w-4" />
                        {uploading
                          ? (language === "nb" ? "Laster opp…" : "Uploading…")
                          : (language === "nb" ? "Last opp logo" : "Upload logo")}
                      </span>
                    </label>
                    {config.logo_url && (
                      <Button variant="ghost" size="sm" onClick={handleLogoRemove}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <UpgradeBanner feature="logo" />
                )}
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

          {/* Multilingual welcome messages */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-semibold">
              <Globe className="h-4 w-4 text-primary" />
              {language === "nb" ? "Flerspråklige velkomstmeldinger" : "Multilingual welcome messages"}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {language === "nb"
                ? "Legg til velkomstmeldinger for ulike språk. Hovedmeldingen over brukes som standard."
                : "Add welcome messages for different languages. The main message above is used as default."}
            </p>
            <div className="mt-4 space-y-3">
              {Object.entries(welcomeMessages).map(([code, msg]) => {
                const langOption = LANGUAGE_OPTIONS.find((l) => l.code === code);
                return (
                  <div key={code} className="flex items-center gap-2">
                    <span className="w-28 shrink-0 text-sm font-medium">
                      {langOption?.label ?? code}
                    </span>
                    <Input
                      value={msg}
                      onChange={(e) =>
                        setWelcomeMessages((prev) => ({ ...prev, [code]: e.target.value }))
                      }
                      placeholder={language === "nb" ? "Velkomstmelding…" : "Welcome message…"}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setWelcomeMessages((prev) => {
                          const next = { ...prev };
                          delete next[code];
                          return next;
                        })
                      }
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                );
              })}
              {(() => {
                const usedCodes = new Set(Object.keys(welcomeMessages));
                const available = LANGUAGE_OPTIONS.filter((l) => !usedCodes.has(l.code));
                if (available.length === 0) return null;
                return (
                  <div className="flex items-center gap-2">
                    <select
                      id="add-lang-select"
                      className="h-9 rounded-md border bg-background px-2 text-sm"
                      defaultValue=""
                      onChange={(e) => {
                        const code = e.target.value;
                        if (code) {
                          setWelcomeMessages((prev) => ({ ...prev, [code]: "" }));
                          e.target.value = "";
                        }
                      }}
                    >
                      <option value="" disabled>
                        {language === "nb" ? "Legg til språk…" : "Add language…"}
                      </option>
                      {available.map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </div>
                );
              })()}
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

          {/* Canned Responses */}
          <CannedResponsesCard workspaceId={workspace.id} t={t} />

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
        <div className="lg:sticky lg:top-8 max-w-full overflow-hidden">
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
              logoUrl={config.logo_url}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface CannedResponseItem {
  id: string;
  shortcut: string;
  title: string;
  content: string;
}

function CannedResponsesCard({
  workspaceId,
  t,
}: {
  workspaceId: string;
  t: (key: string) => string;
}): React.ReactNode {
  const supabase = createClient();
  const [responses, setResponses] = useState<CannedResponseItem[]>([]);
  const [shortcut, setShortcut] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    supabase
      .from("canned_responses")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setResponses(data);
      });
  }, [workspaceId]);

  async function handleAdd() {
    if (!shortcut.trim() || !title.trim() || !content.trim()) return;

    const { data } = await supabase
      .from("canned_responses")
      .insert({
        workspace_id: workspaceId,
        shortcut: shortcut.trim(),
        title: title.trim(),
        content: content.trim(),
      })
      .select()
      .single();

    if (data) {
      setResponses((prev) => [...prev, data]);
      setShortcut("");
      setTitle("");
      setContent("");
    }
  }

  async function handleDelete(id: string) {
    setResponses((prev) => prev.filter((r) => r.id !== id));
    await supabase.from("canned_responses").delete().eq("id", id);
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h3 className="flex items-center gap-2 font-semibold">
        <MessageSquare className="h-4 w-4 text-primary" />
        {t('settings.cannedResponses.title')}
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">{t('settings.cannedResponses.description')}</p>
      <div className="mt-4 space-y-4">
        {responses.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('settings.cannedResponses.empty')}</p>
        ) : (
          <div className="space-y-2">
            {responses.map((r) => (
              <div key={r.id} className="flex items-start gap-2 rounded-lg border p-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">/{r.shortcut}</code>
                    <span className="text-sm font-medium">{r.title}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground truncate">{r.content}</p>
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2 rounded-lg border p-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">{t('settings.cannedResponses.shortcut')}</Label>
              <Input
                value={shortcut}
                onChange={(e) => setShortcut(e.target.value)}
                placeholder={t('settings.cannedResponses.shortcutPlaceholder')}
                className="h-8 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">{t('settings.cannedResponses.titleLabel')}</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('settings.cannedResponses.titlePlaceholder')}
                className="h-8 text-xs mt-1"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">{t('settings.cannedResponses.content')}</Label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('settings.cannedResponses.contentPlaceholder')}
              className="mt-1 flex w-full rounded-lg border border-input bg-background px-3 py-2 text-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              rows={2}
            />
          </div>
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={!shortcut.trim() || !title.trim() || !content.trim()}
            className="h-7 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            {t('settings.cannedResponses.add')}
          </Button>
        </div>
      </div>
    </div>
  );
}
