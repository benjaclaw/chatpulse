"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult, WorkspaceMembership } from "@/lib/types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createWorkspace(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const name = formData.get("name") as string;
  if (!name?.trim()) {
    return { error: "Workspace name is required" };
  }

  if (name.trim().length > 100) {
    return { error: "Workspace name is too long (max 100 characters)" };
  }

  const baseSlug = slugify(name);
  const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;

  // Create workspace + add creator as owner atomically via RPC
  // (Direct INSERT + SELECT fails because RLS SELECT requires membership that doesn't exist yet)
  const { data: workspaceId, error: rpcError } = await supabase
    .rpc("create_workspace", { ws_name: name.trim(), ws_slug: slug });

  if (rpcError) {
    return { error: rpcError.message };
  }

  redirect(`/dashboard`);
}

export async function getUserWorkspaces(): Promise<WorkspaceMembership[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("members")
    .select("workspace:workspaces(*), role")
    .eq("user_id", user.id);

  return (data ?? []) as unknown as WorkspaceMembership[];
}
