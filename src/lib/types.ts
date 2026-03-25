import type { LucideIcon } from "lucide-react";

// --- Server action types ---

export type ActionResult =
  | { error: string; success?: never }
  | { error?: never; success: true }
  | void;

// --- Member roles ---

export type MemberRole = "owner" | "admin" | "member";

// --- Dashboard shell types ---

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  role: MemberRole;
  language?: string;
  plan_id: string;
  message_count: number;
  billing_cycle_start: string | null;
};

export type UserInfo = {
  id: string;
  email: string;
  name?: string;
};

// --- Navigation ---

export interface NavItem {
  labelKey: string;
  href: string;
  icon: LucideIcon;
  requiredFeature?: string;
}

// --- Mock data types ---

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  file_url?: string;
  file_name?: string;
}

export interface ChatbotConfig {
  id: string;
  workspace_id: string;
  name: string;
  prompt: string;
  welcome_message: string;
  welcome_messages?: Record<string, string>;
  fallback_response: string;
  logo_url?: string;
  widget_styling: {
    primary_color: string;
    position: "left" | "right";
  };
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  visitor_id: string;
  started_at: string;
  message_count: number;
  messages: ChatMessage[];
}

export interface Question {
  id: string;
  question: string;
  count: number;
  last_asked_at: string;
  answered: boolean;
}

export type LeadStatus = "new" | "contacted" | "resolved" | "archived";

export interface Lead {
  id: string;
  workspace_id: string;
  conversation_id: string | null;
  email: string;
  name: string | null;
  status: LeadStatus;
  notes: string | null;
  created_at: string;
}

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  new: "Ny",
  contacted: "Kontaktet",
  resolved: "Løst",
  archived: "Arkivert",
};

export const LEAD_STATUS_VARIANT: Record<LeadStatus, "default" | "secondary" | "outline" | "destructive"> = {
  new: "default",
  contacted: "secondary",
  resolved: "outline",
  archived: "outline",
};

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  avatar_initials: string;
}

export type ActivityType = "conversation" | "knowledge" | "question" | "team";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  description: string;
  time: string;
}

export interface DashboardStats {
  totalConversations: number;
  messagesToday: number;
  unansweredQuestions: number;
  teamMembers: number;
  knowledgeArticles: number;
}

export interface WidgetConfig {
  name: string;
  welcomeMessage: string;
  primaryColor: string;
}

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  is_super_admin: boolean;
  workspace_id: string;
  workspace_name: string;
  created_at: string;
};

export type AdminWorkspace = {
  id: string;
  name: string;
  slug: string;
  member_count: number;
  created_at: string;
  members: { id: string; name: string; email: string; role: string }[];
};

export interface AdminStats {
  totalUsers: number;
  totalWorkspaces: number;
  totalConversations: number;
  totalMessages: number;
}

// --- Supabase join result types ---

export interface WorkspaceMembership {
  workspace: {
    id: string;
    name: string;
    slug: string;
    language?: string;
    plan_id: string;
    message_count: number;
    billing_cycle_start: string | null;
  };
  role: MemberRole;
}

export interface InviteRecord {
  id: string;
  workspace_id: string;
  email: string;
  role: string;
  invited_by: string;
  accepted_at: string | null;
  created_at: string;
}

export interface MemberRecord {
  id: string;
  user_id: string;
  workspace_id: string;
  role: MemberRole;
  created_at: string;
  user: { email: string; raw_user_meta_data: Record<string, unknown> } | null;
}

export const ROLE_BADGE_VARIANT: Record<MemberRole, "default" | "secondary" | "outline"> = {
  owner: "default",
  admin: "secondary",
  member: "outline",
};

export const ROLE_LABEL: Record<MemberRole, string> = {
  owner: "Eier",
  admin: "Admin",
  member: "Medlem",
};
