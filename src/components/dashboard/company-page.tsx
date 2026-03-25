"use client";

import { useState, useEffect } from "react";
import { useWorkspace } from "@/contexts/workspace-context";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Check, Loader2 } from "lucide-react";
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
  const [data, setData] = useState<CompanyData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { active: saved, trigger: triggerSaved } = useTemporaryFlag();
  const [existingId, setExistingId] = useState<string | null>(null);

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

  async function handleSave() {
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
          <h1 className="text-3xl font-bold tracking-tight">Bedriftsinfo</h1>
          <p className="mt-1 text-muted-foreground">Laster...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bedriftsinfo</h1>
        <p className="mt-1 text-muted-foreground">
          Informasjon chatboten bruker for å hjelpe kunder med kontakt og generelle spørsmål.
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="flex items-center gap-2 font-semibold">
            <Building2 className="h-4 w-4 text-primary" />
            Grunnleggende info
          </h3>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Bedriftsnavn</Label>
              <Input
                id="company-name"
                value={data.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Firmaet AS"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-desc">Kort beskrivelse</Label>
              <Textarea
                id="company-desc"
                value={data.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Vi er et selskap som..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="font-semibold">Kontaktinformasjon</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Chatboten bruker dette for å henvise kunder som trenger menneskelig hjelp.
          </p>
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company-email">E-post</Label>
                <Input
                  id="company-email"
                  type="email"
                  value={data.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="post@firma.no"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-phone">Telefon</Label>
                <Input
                  id="company-phone"
                  type="tel"
                  value={data.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+47 123 45 678"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-address">Adresse</Label>
              <Input
                id="company-address"
                value={data.address}
                onChange={(e) => update("address", e.target.value)}
                placeholder="Storgata 1, 5003 Bergen"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-website">Nettside</Label>
              <Input
                id="company-website"
                type="url"
                value={data.website}
                onChange={(e) => update("website", e.target.value)}
                placeholder="https://firma.no"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-hours">Åpningstider</Label>
              <Input
                id="company-hours"
                value={data.hours}
                onChange={(e) => update("hours", e.target.value)}
                placeholder="Man-Fre 08:00-16:00"
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Lagrer...</>
          ) : saved ? (
            <><Check className="mr-2 h-4 w-4" />Lagret!</>
          ) : (
            "Lagre bedriftsinfo"
          )}
        </Button>
      </div>
    </div>
  );
}
