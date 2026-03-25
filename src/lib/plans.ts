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

export const PLAN_FEATURES: Record<PlanId, PlanFeature[]> = {
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

export const PLAN_LIMITS: Record<PlanId, number> = {
  free: 100,
  basic: 1000,
  startup: 3000,
  pro: 15000,
};

export interface PlanDetail {
  id: PlanId;
  name: string;
  priceNok: number;
  messageLimit: number;
  features: PlanFeature[];
}

export const PLAN_DETAILS: PlanDetail[] = [
  {
    id: "free",
    name: "Free",
    priceNok: 0,
    messageLimit: 100,
    features: PLAN_FEATURES.free,
  },
  {
    id: "basic",
    name: "Basic",
    priceNok: 499,
    messageLimit: 1000,
    features: PLAN_FEATURES.basic,
  },
  {
    id: "startup",
    name: "Startup",
    priceNok: 990,
    messageLimit: 3000,
    features: PLAN_FEATURES.startup,
  },
  {
    id: "pro",
    name: "Pro",
    priceNok: 4990,
    messageLimit: 15000,
    features: PLAN_FEATURES.pro,
  },
];

export function hasFeature(planId: string, feature: PlanFeature): boolean {
  const features = PLAN_FEATURES[planId as PlanId];
  if (!features) return false;
  return features.includes(feature);
}

export function getPlanLimit(planId: string): number {
  return PLAN_LIMITS[planId as PlanId] ?? 100;
}

export function getPlanDetail(planId: string): PlanDetail {
  return PLAN_DETAILS.find((p) => p.id === planId) ?? PLAN_DETAILS[0];
}

/** Returns the minimum plan required for a feature */
export function getRequiredPlan(feature: PlanFeature): PlanDetail {
  return PLAN_DETAILS.find((p) => p.features.includes(feature)) ?? PLAN_DETAILS[0];
}
