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

/** Map plan IDs to Stripe Price IDs — read from environment */
export const STRIPE_PRICE_MAP: Record<Exclude<PlanId, "free">, string> = {
  basic: process.env.STRIPE_PRICE_BASIC || "",
  startup: process.env.STRIPE_PRICE_STARTUP || "",
  pro: process.env.STRIPE_PRICE_PRO || "",
};
