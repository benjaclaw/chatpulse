import Stripe from "stripe";
import type { PlanId } from "./plans";

// Lazy init — don't crash at import time if env var is missing
let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

/** Map plan IDs to Stripe Price IDs — lazy read to ensure env vars are available */
export function getStripePriceMap(billing: "monthly" | "annual" = "monthly"): Record<Exclude<PlanId, "free">, string> {
  if (billing === "annual") {
    return {
      basic: process.env.STRIPE_PRICE_BASIC_ANNUAL || "",
      startup: process.env.STRIPE_PRICE_STARTUP_ANNUAL || "",
      pro: process.env.STRIPE_PRICE_PRO_ANNUAL || "",
    };
  }
  return {
    basic: process.env.STRIPE_PRICE_BASIC || "",
    startup: process.env.STRIPE_PRICE_STARTUP || "",
    pro: process.env.STRIPE_PRICE_PRO || "",
  };
}
