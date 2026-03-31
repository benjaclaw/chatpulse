"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { redirect } from "next/navigation";
import type { ActionResult, AcceptInviteResult, InviteRecord, MemberRecord } from "@/lib/types";
import { isValidUUID } from "@/lib/utils";

function isValidToken(value: string): boolean {
  return typeof value === "string" && value.length > 0 && value.length <= 100;
}

export async function sendInvite(workspaceId: string, formData: FormData): Promise<ActionResult> {
  if (!isValidUUID(workspaceId)) {
    return { error: "Invalid workspaceId" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Verify user is admin/owner
  const { data: membership } = await supabase
    .from("members")
    .select("role")
    .eq("user_id", user.id)
    .eq("workspace_id", workspaceId)
    .single();

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return { error: "You don't have permission to invite members" };
  }

  const email = formData.get("email") as string;
  const role = (formData.get("role") as string) || "member";

  if (!email?.trim()) {
    return { error: "Email is required" };
  }

  // Validate role — only allow member and admin (owners can't be invited)
  if (!["member", "admin"].includes(role)) {
    return { error: "Invalid role" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { error: "Invalid email address" };
  }

  // Check for existing invite
  const { data: existingInvite } = await supabase
    .from("invites")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("email", email.toLowerCase())
    .is("accepted_at", null)
    .single();

  if (existingInvite) {
    return { error: "An invite has already been sent to this email" };
  }

  const { error } = await supabase.from("invites").insert({
    workspace_id: workspaceId,
    email: email.toLowerCase().trim(),
    role,
    invited_by: user.id,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function acceptInvite(token: string): Promise<AcceptInviteResult> {
  if (!isValidToken(token)) {
    return { error: "Invalid or expired invite" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Use service client for DB operations to bypass RLS
  const serviceClient = createServiceClient();

  // Find invite
  const { data: invite, error: inviteError } = await serviceClient
    .from("invites")
    .select("*, workspace:workspaces(name)")
    .eq("token", token)
    .is("accepted_at", null)
    .single();

  if (inviteError || !invite) {
    return { error: "Invalid or expired invite" };
  }

  // Check if expired
  if (new Date(invite.expires_at) < new Date()) {
    return { error: "This invite has expired" };
  }

  // Check email matches (skip for open invites with blank email)
  if (invite.email && invite.email !== user.email?.toLowerCase()) {
    return { error: "This invite was sent to a different email address" };
  }

  // Add as member (service client bypasses RLS)
  const { error: memberError } = await serviceClient.from("members").insert({
    user_id: user.id,
    workspace_id: invite.workspace_id,
    role: invite.role,
  });

  if (memberError) {
    if (memberError.code === "23505") {
      return { error: "You are already a member of this workspace" };
    }
    return { error: memberError.message };
  }

  // Mark invite as accepted (service client bypasses RLS)
  const { error: updateError } = await serviceClient
    .from("invites")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invite.id);

  if (updateError) {
    return { error: updateError.message };
  }

  const workspaceName = (invite.workspace as { name: string } | null)?.name ?? "workspace";

  return { success: true, workspaceName };
}

export async function getWorkspaceInvites(workspaceId: string): Promise<InviteRecord[]> {
  if (!isValidUUID(workspaceId)) return [];

  const supabase = await createClient();

  const { data } = await supabase
    .from("invites")
    .select("*")
    .eq("workspace_id", workspaceId)
    .is("accepted_at", null)
    .order("created_at", { ascending: false });

  return (data ?? []) as InviteRecord[];
}

export async function getWorkspaceMembers(workspaceId: string): Promise<MemberRecord[]> {
  if (!isValidUUID(workspaceId)) return [];

  const supabase = await createClient();

  const { data } = await supabase
    .from("members")
    .select("*, user:user_id(email, raw_user_meta_data)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });

  return (data ?? []) as MemberRecord[];
}
