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
};

export type UserInfo = {
  id: string;
  email: string;
  name?: string;
};

// --- Navigation ---

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

// --- Mock data types ---

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

export interface ChatbotConfig {
  id: string;
  workspace_id: string;
  name: string;
  prompt: string;
  welcome_message: string;
  fallback_response: string;
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

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  avatar_initials: string;
}

export interface ActivityItem {
  id: string;
  type: "conversation" | "knowledge" | "question" | "team";
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
