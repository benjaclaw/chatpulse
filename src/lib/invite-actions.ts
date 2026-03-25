"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { ActionResult, InviteRecord, MemberRecord } from "@/lib/types";

export async function sendInvite(workspaceId: string, formData: FormData): Promise<ActionResult> {
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

export async function acceptInvite(token: string): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/invite/accept?token=${token}`);
  }

  // Find invite
  const { data: invite, error: inviteError } = await supabase
    .from("invites")
    .select("*")
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

  // Check email matches
  if (invite.email !== user.email?.toLowerCase()) {
    return { error: "This invite was sent to a different email address" };
  }

  // Add as member
  const { error: memberError } = await supabase.from("members").insert({
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

  // Mark invite as accepted
  const { error: updateError } = await supabase
    .from("invites")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invite.id);

  if (updateError) {
    return { error: updateError.message };
  }

  redirect("/dashboard");
}

export async function getWorkspaceInvites(workspaceId: string): Promise<InviteRecord[]> {
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
  const supabase = await createClient();

  const { data } = await supabase
    .from("members")
    .select("*, user:user_id(email, raw_user_meta_data)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });

  return (data ?? []) as MemberRecord[];
}
