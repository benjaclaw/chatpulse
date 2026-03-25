import {
  LayoutDashboard,
  BookOpen,
  Building2,
  Bot,
  MessageSquare,
  BarChart3,
  Settings,
  Users,
  UserPlus,
} from "lucide-react";
import type { NavItem } from "./types";

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Knowledge Base", href: "/dashboard/knowledge", icon: BookOpen },
  { label: "Company Info", href: "/dashboard/company", icon: Building2 },
  { label: "Chatbot", href: "/dashboard/chatbot", icon: Bot },
  { label: "Conversations", href: "/dashboard/conversations", icon: MessageSquare },
  { label: "Leads", href: "/dashboard/leads", icon: UserPlus },
  { label: "Insights", href: "/dashboard/insights", icon: BarChart3 },
  { label: "Team", href: "/dashboard/team", icon: Users },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];
