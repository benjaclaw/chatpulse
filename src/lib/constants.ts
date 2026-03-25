import {
  LayoutDashboard,
  BookOpen,
  Building2,
  Bot,
  MessageSquare,
  MessageCircle,
  BarChart3,
  TrendingUp,
  Settings,
  Users,
  UserPlus,
} from "lucide-react";
import type { NavItem } from "./types";

export const NAV_ITEMS: NavItem[] = [
  { labelKey: "nav.dashboard", href: "/dashboard", icon: LayoutDashboard },
  { labelKey: "nav.knowledge", href: "/dashboard/knowledge", icon: BookOpen },
  { labelKey: "nav.company", href: "/dashboard/company", icon: Building2 },
  { labelKey: "nav.chatbot", href: "/dashboard/chatbot", icon: Bot },
  { labelKey: "nav.inbox", href: "/dashboard/inbox", icon: MessageCircle },
  { labelKey: "nav.conversations", href: "/dashboard/conversations", icon: MessageSquare },
  { labelKey: "nav.leads", href: "/dashboard/leads", icon: UserPlus, requiredFeature: "leads" },
  { labelKey: "nav.insights", href: "/dashboard/insights", icon: BarChart3, requiredFeature: "insights" },
  { labelKey: "nav.analytics", href: "/dashboard/analytics", icon: TrendingUp },
  { labelKey: "nav.team", href: "/dashboard/team", icon: Users, requiredFeature: "team_members" },
  { labelKey: "nav.settings", href: "/dashboard/settings", icon: Settings },
];
