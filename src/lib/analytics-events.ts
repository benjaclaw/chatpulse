"use client";

/**
 * Push events to GTM dataLayer for Google Analytics tracking.
 * Events follow GA4 recommended event naming conventions.
 */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  }
}

function pushEvent(event: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}

// ─── Auth Events ───

export function trackSignUp(method: "email" | "google"): void {
  pushEvent("sign_up", { method });
}

export function trackLogin(method: "email" | "google"): void {
  pushEvent("login", { method });
}

// ─── Onboarding Events ───

export function trackCreateWorkspace(): void {
  pushEvent("create_workspace");
}

export function trackAddKnowledge(): void {
  pushEvent("add_knowledge");
}

export function trackEmbedWidget(): void {
  pushEvent("embed_widget");
}

// ─── Subscription / Purchase Events ───

export function trackBeginCheckout(plan: string, value?: number): void {
  pushEvent("begin_checkout", {
    currency: "NOK",
    value,
    items: [{ item_name: plan }],
  });
}

export function trackPurchase(plan: string, value: number, transactionId?: string): void {
  pushEvent("purchase", {
    currency: "NOK",
    value,
    transaction_id: transactionId,
    items: [{ item_name: plan }],
  });
}

// ─── Engagement Events ───

export function trackViewPricing(): void {
  pushEvent("view_pricing");
}

export function trackContactSales(): void {
  pushEvent("contact_sales");
}

export function trackCTAClick(ctaName: string, location: string): void {
  pushEvent("cta_click", { cta_name: ctaName, location });
}
