"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";

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

  const baseSlug = slugify(name);
  const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;

  // Create workspace
  const { data: workspace, error: wsError } = await supabase
    .from("workspaces")
    .insert({ name: name.trim(), slug })
    .select()
    .single();

  if (wsError) {
    return { error: wsError.message };
  }

  // Add creator as owner
  const { error: memberError } = await supabase
    .from("members")
    .insert({ user_id: user.id, workspace_id: workspace.id, role: "owner" });

  if (memberError) {
    return { error: memberError.message };
  }

  redirect(`/dashboard`);
}

export async function getUserWorkspaces(): Promise<Record<string, unknown>[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("members")
    .select("workspace:workspaces(*), role")
    .eq("user_id", user.id);

  return data ?? [];
}
