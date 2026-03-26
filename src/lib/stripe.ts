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

/** Map plan IDs to Stripe Price IDs — fill in after creating products in Stripe */
export const STRIPE_PRICE_MAP: Record<Exclude<PlanId, "free">, string> = {
  basic: "price_1TFIQECWS4OJVOagpmCJTFOr",
  startup: "price_1TFIQFCWS4OJVOagDDG63IHz",
  pro: "price_1TFIQFCWS4OJVOagPQfCDkZN",
};
