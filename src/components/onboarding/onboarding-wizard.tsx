"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createT, type Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { FormError } from "@/components/ui/form-error";
import {
  Building2,
  Briefcase,
  Bot,
  BookOpen,
  Loader2,
  Upload,
  FileText,
  Plus,
  X,
  AlertTriangle,
  Check,
} from "lucide-react";

// --- Industry defaults ---

type Industry =
  | "restaurant"
  | "shop"
  | "car_dealer"
  | "real_estate"
  | "health"
  | "tech"
  | "consulting"
  | "other";

const INDUSTRIES: { value: Industry; labelKey: string }[] = [
  { value: "restaurant", labelKey: "onboarding.industryRestaurant" },
  { value: "shop", labelKey: "onboarding.industryShop" },
  { value: "car_dealer", labelKey: "onboarding.industryCarDealer" },
  { value: "real_estate", labelKey: "onboarding.industryRealEstate" },
  { value: "health", labelKey: "onboarding.industryHealth" },
  { value: "tech", labelKey: "onboarding.industryTech" },
  { value: "consulting", labelKey: "onboarding.industryConsulting" },
  { value: "other", labelKey: "onboarding.industryOther" },
];

function getIndustryDefaults(industry: Industry): {
  welcome: string;
  prompt: string;
} {
  switch (industry) {
    case "restaurant":
      return {
        welcome:
          "Hei! Lurer du på menyen, åpningstider eller reservasjon?",
        prompt:
          "Du er en hjelpsom kundeserviceassistent for en restaurant. Hjelp kundene med spørsmål om meny, allergener, reservasjoner og åpningstider. Svar alltid på norsk. Vær vennlig og profesjonell.",
      };
    case "car_dealer":
      return {
        welcome: "Hei! Kan jeg hjelpe deg med å finne riktig bil?",
        prompt:
          "Du er en hjelpsom kundeserviceassistent for en bilforhandler. Hjelp kundene med spørsmål om biler, priser, prøvekjøring og finansiering. Svar alltid på norsk. Vær vennlig og profesjonell.",
      };
    case "shop":
      return {
        welcome:
          "Hei! Trenger du hjelp med bestilling eller produktinfo?",
        prompt:
          "Du er en hjelpsom kundeserviceassistent for en butikk. Hjelp kundene med spørsmål om produkter, frakt, retur og bestillinger. Svar alltid på norsk. Vær vennlig og profesjonell.",
      };
    case "real_estate":
      return {
        welcome: "Hei! Leter du etter bolig eller har du spørsmål om eiendom?",
        prompt:
          "Du er en hjelpsom kundeserviceassistent for et eiendomsselskap. Hjelp kundene med spørsmål om boliger, visninger, priser og kjøpsprosessen. Svar alltid på norsk. Vær vennlig og profesjonell.",
      };
    case "health":
      return {
        welcome: "Hei! Trenger du hjelp med timebestilling eller har du spørsmål?",
        prompt:
          "Du er en hjelpsom kundeserviceassistent for en helsebedrift. Hjelp kundene med spørsmål om tjenester, timebestilling og åpningstider. Svar alltid på norsk. Vær vennlig og profesjonell. Gi aldri medisinsk råd.",
      };
    case "tech":
      return {
        welcome: "Hei! Trenger du teknisk hjelp eller har du spørsmål om våre tjenester?",
        prompt:
          "Du er en hjelpsom kundeserviceassistent for et teknologiselskap. Hjelp kundene med spørsmål om produkter, tjenester, teknisk support og priser. Svar alltid på norsk. Vær vennlig og profesjonell.",
      };
    case "consulting":
      return {
        welcome: "Hei! Kan jeg hjelpe deg med informasjon om våre tjenester?",
        prompt:
          "Du er en hjelpsom kundeserviceassistent for et rådgivningsfirma. Hjelp kundene med spørsmål om tjenester, tilgjengelighet og priser. Svar alltid på norsk. Vær vennlig og profesjonell.",
      };
    default:
      return {
        welcome: "Hei! Hvordan kan jeg hjelpe deg i dag?",
        prompt:
          "Du er en hjelpsom kundeserviceassistent. Svar alltid på norsk. Vær vennlig og profesjonell.",
      };
  }
}

// --- FAQ item type ---
interface FaqItem {
  id: string;
  title: string;
  content: string;
}

interface UploadedFile {
  name: string;
  file: File;
}

// --- Slugify ---
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// --- Step labels ---
const STEP_ICONS = [Building2, Briefcase, Bot, BookOpen];

interface OnboardingWizardProps {
  userEmail?: string;
}

export function OnboardingWizard({ userEmail }: OnboardingWizardProps): React.ReactNode {
  const router = useRouter();
  const supabase = createClient();

  const [language] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("chatpulse-lang") as Language) || "nb";
    }
    return "nb";
  });
  const t = createT(language);

  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Workspace
  const [workspaceName, setWorkspaceName] = useState("");
  const [industry, setIndustry] = useState<Industry | "">("");

  // Step 2: Company info
  const [companyEmail, setCompanyEmail] = useState(userEmail ?? "");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [openingHours, setOpeningHours] = useState("");

  // Step 3: Chatbot
  const [chatbotName, setChatbotName] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Step 4: Knowledge
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [newFaqTitle, setNewFaqTitle] = useState("");
  const [newFaqContent, setNewFaqContent] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize chatbot defaults when industry changes
  const handleIndustryChange = useCallback(
    (value: Industry) => {
      setIndustry(value);
      const defaults = getIndustryDefaults(value);
      setWelcomeMessage(defaults.welcome);
      setSystemPrompt(defaults.prompt);
      if (!chatbotName && workspaceName) {
        setChatbotName(workspaceName + " Bot");
      }
    },
    [chatbotName, workspaceName]
  );

  // Step validation
  const canProceed = (): boolean => {
    if (step === 0) return workspaceName.trim().length > 0;
    return true;
  };

  const handleNext = () => {
    setError("");
    if (step === 0 && !chatbotName) {
      setChatbotName(workspaceName.trim() + " Bot");
    }
    if (step === 0 && !industry) {
      const defaults = getIndustryDefaults("other");
      if (!welcomeMessage) setWelcomeMessage(defaults.welcome);
      if (!systemPrompt) setSystemPrompt(defaults.prompt);
    }
    setStep((s) => Math.min(s + 1, 3));
  };

  const handleBack = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  };

  // Logo handling
  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
    e.target.value = "";
  };

  // File upload for knowledge
  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles: UploadedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      newFiles.push({ name: files[i].name, file: files[i] });
    }
    setUploadedFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    const newFiles: UploadedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      newFiles.push({ name: files[i].name, file: files[i] });
    }
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  // Add FAQ
  const addFaq = () => {
    if (!newFaqTitle.trim() || !newFaqContent.trim()) return;
    setFaqItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: newFaqTitle.trim(), content: newFaqContent.trim() },
    ]);
    setNewFaqTitle("");
    setNewFaqContent("");
  };

  // --- Finish ---
  const handleFinish = async () => {
    setError("");
    setSubmitting(true);

    try {
      // 1. Create workspace
      const baseSlug = slugify(workspaceName);
      const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;

      const { data: workspaceId, error: rpcError } = await supabase.rpc(
        "create_workspace",
        { ws_name: workspaceName.trim(), ws_slug: slug }
      );

      if (rpcError) throw new Error(rpcError.message);
      if (!workspaceId) throw new Error("Failed to create workspace");

      // 2. Insert company_info (use workspace name as company name)
      const companyData: Record<string, string> = {};
      companyData.name = workspaceName;
      if (companyEmail) companyData.email = companyEmail;
      if (phone) companyData.phone = phone;
      if (website) companyData.website = website;
      if (openingHours) companyData.hours = openingHours;
      if (industry) companyData.industry = industry;

      if (Object.keys(companyData).length > 0) {
        await supabase.from("company_info").insert({
          workspace_id: workspaceId,
          data: companyData,
        });
      }

      // 3. Upload logo if present
      let logoUrl: string | null = null;
      if (logoFile) {
        const ext = logoFile.name.split(".").pop() ?? "png";
        const path = `${workspaceId}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("logos")
          .upload(path, logoFile);
        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("logos")
            .getPublicUrl(path);
          logoUrl = urlData.publicUrl;
        }
      }

      // 4. Insert chatbot_config
      const effectiveName = chatbotName || workspaceName.trim() + " Bot";
      const effectiveDefaults = getIndustryDefaults(
        (industry as Industry) || "other"
      );
      const effectiveWelcome = welcomeMessage || effectiveDefaults.welcome;
      const effectivePrompt = systemPrompt || effectiveDefaults.prompt;

      await supabase.from("chatbot_config").insert({
        workspace_id: workspaceId,
        name: effectiveName,
        prompt: effectivePrompt,
        welcome_message: effectiveWelcome,
        welcome_messages: { nb: effectiveWelcome },
        fallback_response:
          "Beklager, jeg fant ikke svaret på det. Vil du snakke med en av våre medarbeidere?",
        logo_url: logoUrl,
        widget_styling: { primary_color: "#6366f1", position: "right" },
      });

      // 5. Insert FAQ knowledge items
      if (faqItems.length > 0) {
        await supabase.from("knowledge").insert(
          faqItems.map((faq) => ({
            workspace_id: workspaceId,
            title: faq.title,
            content: faq.content,
            category: "Generelt",
          }))
        );
      }

      // 6. Upload documents via API
      for (const uf of uploadedFiles) {
        const formData = new FormData();
        formData.append("file", uf.file);
        formData.append("workspace_id", workspaceId);
        await fetch("/api/knowledge/upload", {
          method: "POST",
          body: formData,
        });
      }

      // 7. Redirect to dashboard
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setSubmitting(false);
    }
  };

  const stepLabels = [
    t("onboarding.step1"),
    t("onboarding.step2"),
    t("onboarding.step3"),
    t("onboarding.step4"),
  ];

  const hasKnowledge = uploadedFiles.length > 0 || faqItems.length > 0;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <span className="font-heading text-2xl font-bold text-primary">
          ChatPulse
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">
          {t("onboarding.title")}
        </h1>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2">
        {stepLabels.map((label, i) => {
          const Icon = STEP_ICONS[i];
          const isActive = i === step;
          const isDone = i < step;
          return (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && (
                <div
                  className={`hidden h-0.5 w-8 sm:block ${
                    isDone ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : isDone
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  {isDone ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${
                    isActive
                      ? "text-primary"
                      : isDone
                        ? "text-primary"
                        : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <FormError message={error} />

      {/* Step content */}
      <Card>
        <CardContent className="p-6">
          {/* Step 1: Workspace */}
          {step === 0 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="workspace-name">
                  {t("onboarding.workspaceName")} *
                </Label>
                <Input
                  id="workspace-name"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder={t("onboarding.workspaceNamePlaceholder")}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  {t("onboarding.workspaceNameHelp")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">{t("onboarding.industry")}</Label>
                <select
                  id="industry"
                  value={industry}
                  onChange={(e) =>
                    handleIndustryChange(e.target.value as Industry)
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">
                    {t("onboarding.industryPlaceholder")}
                  </option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind.value} value={ind.value}>
                      {t(ind.labelKey)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Company Info */}
          {step === 1 && (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                {t("onboarding.companyInfoHelp")}
              </p>

              <div className="space-y-2">
                <Label htmlFor="company-email">{t("onboarding.email")}</Label>
                <Input
                  id="company-email"
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  placeholder={userEmail ?? "post@firma.no"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t("onboarding.phone")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("onboarding.phonePlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">{t("onboarding.website")}</Label>
                <Input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder={t("onboarding.websitePlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="opening-hours">
                  {t("onboarding.openingHours")}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">({t("common.optional")})</span>
                </Label>
                <Input
                  id="opening-hours"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  placeholder="Man-Fre 08:00-16:00 / Døgnåpent / La stå tom"
                />
              </div>
            </div>
          )}

          {/* Step 3: Chatbot */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="chatbot-name">
                  {t("onboarding.chatbotName")}
                </Label>
                <Input
                  id="chatbot-name"
                  value={chatbotName}
                  onChange={(e) => setChatbotName(e.target.value)}
                  placeholder={workspaceName + " Bot"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="welcome-message">
                  {t("onboarding.welcomeMessage")}
                </Label>
                <Input
                  id="welcome-message"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="system-prompt">
                  {t("onboarding.systemPrompt")}
                </Label>
                <Textarea
                  id="system-prompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={5}
                />
                <p className="text-xs text-muted-foreground">
                  {t("onboarding.systemPromptHelp")}
                </p>
              </div>

              <div className="space-y-2">
                <Label>{t("onboarding.logo")}</Label>
                <div className="flex items-center gap-3">
                  {logoPreview && (
                    <img
                      src={logoPreview}
                      alt="Logo"
                      className="h-10 w-10 rounded-full border object-cover"
                    />
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      className="hidden"
                      onChange={handleLogoSelect}
                    />
                    <span className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent transition-colors">
                      <Upload className="h-4 w-4" />
                      {t("onboarding.logoUpload")}
                    </span>
                  </label>
                  {logoPreview && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview(null);
                      }}
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Knowledge */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold">
                  {t("onboarding.knowledgeTitle")}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("onboarding.knowledgeDescription")}
                </p>
              </div>

              {/* Upload area */}
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4" />
                  {t("onboarding.uploadDocument")}
                </h4>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className="rounded-lg border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary/50"
                >
                  <p className="text-sm text-muted-foreground">
                    {t("onboarding.uploadDocumentDesc")}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {t("onboarding.uploadDocumentButton")}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.xlsx,.csv,.txt,.md"
                    multiple
                    className="hidden"
                    onChange={handleFileAdd}
                  />
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      {t("onboarding.uploadedFiles")}
                    </p>
                    {uploadedFiles.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {f.name}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setUploadedFiles((prev) =>
                              prev.filter((_, idx) => idx !== i)
                            )
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Manual FAQ */}
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <BookOpen className="h-4 w-4" />
                  {t("onboarding.writeFaq")}
                </h4>
                <div className="space-y-3 rounded-lg border p-4">
                  <div className="space-y-2">
                    <Label htmlFor="faq-title">
                      {t("onboarding.faqTitle")}
                    </Label>
                    <Input
                      id="faq-title"
                      value={newFaqTitle}
                      onChange={(e) => setNewFaqTitle(e.target.value)}
                      placeholder={t("onboarding.faqTitlePlaceholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="faq-content">
                      {t("onboarding.faqContent")}
                    </Label>
                    <Textarea
                      id="faq-content"
                      value={newFaqContent}
                      onChange={(e) => setNewFaqContent(e.target.value)}
                      placeholder={t("onboarding.faqContentPlaceholder")}
                      rows={3}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addFaq}
                    disabled={!newFaqTitle.trim() || !newFaqContent.trim()}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t("onboarding.addFaq")}
                  </Button>
                </div>

                {faqItems.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      {t("onboarding.faqItems")}
                    </p>
                    {faqItems.map((faq) => (
                      <div
                        key={faq.id}
                        className="flex items-start justify-between rounded-md border px-3 py-2 text-sm"
                      >
                        <div>
                          <p className="font-medium">{faq.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                            {faq.content}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setFaqItems((prev) =>
                              prev.filter((f) => f.id !== faq.id)
                            )
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Skip warning */}
              {!hasKnowledge && (
                <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900 dark:bg-yellow-950">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600 dark:text-yellow-500" />
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    {t("onboarding.skipWarning")}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 0 || submitting}
        >
          {t("onboarding.back")}
        </Button>

        {step < 3 ? (
          <Button onClick={handleNext} disabled={!canProceed()}>
            {t("onboarding.next")}
          </Button>
        ) : (
          <Button onClick={handleFinish} disabled={submitting}>
            {submitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {submitting
              ? t("onboarding.finishing")
              : t("onboarding.finish")}
          </Button>
        )}
      </div>
    </div>
  );
}
