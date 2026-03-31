export type PlanFeature =
  | "basic_chat"
  | "knowledge_base"
  | "insights"
  | "leads"
  | "white_label"
  | "logo"
  | "document_upload"
  | "priority_support"
  | "team_members";

export type PlanId = "free" | "basic" | "startup" | "pro";

const PLAN_FEATURES: Record<PlanId, PlanFeature[]> = {
  free: ["basic_chat", "knowledge_base"],
  basic: ["basic_chat", "knowledge_base", "insights", "leads"],
  startup: [
    "basic_chat",
    "knowledge_base",
    "insights",
    "leads",
    "logo",
    "white_label",
    "document_upload",
  ],
  pro: [
    "basic_chat",
    "knowledge_base",
    "insights",
    "leads",
    "logo",
    "white_label",
    "document_upload",
    "priority_support",
    "team_members",
  ],
};

const PLAN_LIMITS: Record<PlanId, number> = {
  free: 100,
  basic: 1000,
  startup: 3000,
  pro: 15000,
};

export interface PlanDetail {
  id: PlanId;
  name: string;
  priceNok: number;
  /** Price per month when billed annually (20% discount) */
  priceNokAnnual: number;
  messageLimit: number;
  features: PlanFeature[];
  /** Hidden plans are not shown on public pricing pages */
  hidden?: boolean;
}

export const PLAN_DETAILS: PlanDetail[] = [
  {
    id: "free",
    name: "Free",
    priceNok: 0,
    priceNokAnnual: 0,
    messageLimit: 100,
    features: PLAN_FEATURES.free,
    hidden: true,
  },
  {
    id: "basic",
    name: "Basic",
    priceNok: 499,
    priceNokAnnual: 399,
    messageLimit: 1000,
    features: PLAN_FEATURES.basic,
  },
  {
    id: "startup",
    name: "Starter",
    priceNok: 990,
    priceNokAnnual: 790,
    messageLimit: 3000,
    features: PLAN_FEATURES.startup,
  },
  {
    id: "pro",
    name: "Pro",
    priceNok: 4990,
    priceNokAnnual: 3990,
    messageLimit: 15000,
    features: PLAN_FEATURES.pro,
  },
];

/** Plans visible on public-facing pricing pages */
export const VISIBLE_PLAN_DETAILS = PLAN_DETAILS.filter((p) => !p.hidden);

export function hasFeature(planId: string, feature: PlanFeature): boolean {
  const features = PLAN_FEATURES[planId as PlanId];
  if (!features) return false;
  return features.includes(feature);
}

export function getPlanLimit(planId: string): number {
  return PLAN_LIMITS[planId as PlanId] ?? 100;
}

export function getPlanDetail(planId: string): PlanDetail {
  return PLAN_DETAILS.find((p) => p.id === planId) ?? PLAN_DETAILS[1];
}

/** Returns the minimum visible plan required for a feature */
export function getRequiredPlan(feature: PlanFeature): PlanDetail {
  return VISIBLE_PLAN_DETAILS.find((p) => p.features.includes(feature)) ?? VISIBLE_PLAN_DETAILS[0];
}
