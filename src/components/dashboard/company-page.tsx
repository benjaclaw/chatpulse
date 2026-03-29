"use client";

import { useState, useEffect } from "react";
import { useWorkspace } from "@/contexts/workspace-context";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Check, Loader2, AlertCircle } from "lucide-react";
import { useTemporaryFlag } from "@/hooks/use-temporary-flag";

interface CompanyData {
  name: string;
  email: string;
  phone: string;
  address: string;
  hours: string;
  website: string;
  description: string;
}

const emptyData: CompanyData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  hours: "",
  website: "",
  description: "",
};

export function CompanyPageClient(): React.ReactNode {
  const workspace = useWorkspace();
  const supabase = createClient();
  const { t } = useLanguage();
  const [data, setData] = useState<CompanyData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { active: saved, trigger: triggerSaved } = useTemporaryFlag();
  const [existingId, setExistingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof CompanyData, string>>>({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data: row } = await supabase
        .from("company_info")
        .select("id, data")
        .eq("workspace_id", workspace.id)
        .maybeSingle();
      if (!cancelled) {
        if (row) {
          setExistingId(row.id);
          setData({ ...emptyData, ...(row.data as CompanyData) });
        }
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [workspace.id, supabase]);

  function update(key: keyof CompanyData, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof CompanyData, string>> = {};
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = t('company.invalidEmail');
    }
    if (data.phone && !/^\+?[\d\s\-().]{7,20}$/.test(data.phone)) {
      newErrors.phone = t('company.invalidPhone');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    if (existingId) {
      await supabase
        .from("company_info")
        .update({ data })
        .eq("id", existingId);
    } else {
      const { data: row } = await supabase
        .from("company_info")
        .insert({ workspace_id: workspace.id, data })
        .select("id")
        .single();
      if (row) setExistingId(row.id);
    }
    setSaving(false);
    triggerSaved();
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('company.title')}</h1>
          <p className="mt-1 text-muted-foreground">{t('company.description')}</p>
        </div>
        <div className="max-w-2xl space-y-6 animate-scroll-fade">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="h-5 w-28 rounded-md bg-muted animate-shimmer" />
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <div className="h-4 w-20 rounded bg-muted animate-shimmer" />
                  <div className="h-10 w-full rounded-lg bg-muted animate-shimmer" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-24 rounded bg-muted animate-shimmer" />
                  <div className="h-20 w-full rounded-lg bg-muted animate-shimmer" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('company.title')}</h1>
        <p className="mt-1 text-muted-foreground">
          {t('company.description')}
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="flex items-center gap-2 font-semibold">
            <Building2 className="h-4 w-4 text-primary" />
            {t('company.basicInfo')}
          </h3>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">{t('company.companyName')}</Label>
              <Input
                id="company-name"
                value={data.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder={t('company.companyNamePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-desc">{t('company.shortDescription')}</Label>
              <Textarea
                id="company-desc"
                value={data.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder={t('company.shortDescriptionPlaceholder')}
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold">{t('company.contactInfo')}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('company.contactInfoHelp')}
          </p>
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company-email">{t('company.email')}</Label>
                <Input
                  id="company-email"
                  type="email"
                  value={data.email}
                  onChange={(e) => { update("email", e.target.value); setErrors((prev) => ({ ...prev, email: undefined })); }}
                  placeholder={t('company.emailPlaceholder')}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />{errors.email}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-phone">{t('company.phone')}</Label>
                <Input
                  id="company-phone"
                  type="tel"
                  value={data.phone}
                  onChange={(e) => { update("phone", e.target.value); setErrors((prev) => ({ ...prev, phone: undefined })); }}
                  placeholder={t('company.phonePlaceholder')}
                  className={errors.phone ? "border-destructive" : ""}
                />
                {errors.phone && (
                  <p className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />{errors.phone}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-address">{t('company.address')}</Label>
              <Input
                id="company-address"
                value={data.address}
                onChange={(e) => update("address", e.target.value)}
                placeholder={t('company.addressPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-website">{t('company.website')}</Label>
              <Input
                id="company-website"
                type="url"
                value={data.website}
                onChange={(e) => update("website", e.target.value)}
                placeholder={t('company.websitePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-hours">{t('company.openingHours')}</Label>
              <Input
                id="company-hours"
                value={data.hours}
                onChange={(e) => update("hours", e.target.value)}
                placeholder={t('company.openingHoursPlaceholder')}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('company.saving')}</>
            ) : saved ? (
              <><Check className="mr-2 h-4 w-4" />{t('common.saved')}</>
            ) : (
              t('company.saveButton')
            )}
          </Button>
          {saved && (
            <span className="text-sm text-green-600 dark:text-green-400 animate-in fade-in">
              {t('company.savedSuccess')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
