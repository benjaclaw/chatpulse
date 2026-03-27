"use client";

import { useState } from "react";
import type { TranslateFunction } from "@/lib/i18n";

export function HandoffForm({
  primaryColor,
  onSubmit,
  t,
}: {
  primaryColor: string;
  onSubmit: (email: string, name: string) => Promise<void>;
  t: TranslateFunction;
}): React.ReactNode {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Require both email AND name before submit
    if (!email.trim() || !name.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(email.trim(), name.trim());
    } catch (err) {
      console.error('Handoff error:', err);
      setSubmitting(false);
    }
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-muted p-3">
        <form onSubmit={handleSubmit} className="space-y-2">
          <p className="text-xs font-medium text-foreground">
            {t('widget.handoffHeading')}
          </p>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('widget.emailPlaceholder')}
            className="w-full rounded-lg border bg-background px-3 py-1.5 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('widget.namePlaceholder')}
            className="w-full rounded-lg border bg-background px-3 py-1.5 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
          <button
            type="submit"
            disabled={!email.trim() || !name.trim() || submitting}
            className="w-full rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: primaryColor }}
          >
            {submitting ? t('widget.sending') : t('widget.send')}
          </button>
        </form>
      </div>
    </div>
  );
}
