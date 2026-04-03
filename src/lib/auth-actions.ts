"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";
import { isValidEmail } from "@/lib/utils";
import { sendConversionEvent } from "@/lib/meta-conversions";

function safeRedirect(url: string | null): string {
  if (!url || !url.startsWith("/") || url.startsWith("//") || url.includes("://")) {
    return "/dashboard";
  }
  return url;
}

export async function login(formData: FormData): Promise<ActionResult> {
  const email = (formData.get("email") as string)?.trim().slice(0, 254);
  const password = formData.get("password") as string;
  const redirectTo = safeRedirect(formData.get("redirect") as string | null);

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  if (password.length > 128) {
    return { error: "Password is too long" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect(redirectTo);
}

export async function signup(formData: FormData): Promise<ActionResult> {
  const email = (formData.get("email") as string)?.trim().slice(0, 254);
  const password = formData.get("password") as string;
  const name = (formData.get("name") as string)?.trim();

  if (!email || !password || !name) {
    return { error: "All fields are required" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  if (password.length > 128) {
    return { error: "Password is too long" };
  }

  if (name.length > 200) {
    return { error: "Name is too long" };
  }

  if (!isValidEmail(email)) {
    return { error: "Invalid email address" };
  }

  const supabase = await createClient();

  const redirectTo = safeRedirect(formData.get("redirect") as string | null);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Meta Conversions API — CompleteRegistration
  try {
    const hdrs = await headers();
    const clientIp = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
    const clientUa = hdrs.get("user-agent") || undefined;

    sendConversionEvent({
      eventName: "CompleteRegistration",
      email,
      sourceUrl: `${siteUrl}/signup`,
      clientIpAddress: clientIp,
      clientUserAgent: clientUa,
    });
  } catch {
    // Non-blocking — don't fail signup if tracking fails
  }

  redirect("/check-email");
}

export async function forgotPassword(email: string): Promise<ActionResult> {
  if (!email?.trim()) {
    return { error: "Email is required" };
  }

  if (!isValidEmail(email.trim())) {
    return { error: "Invalid email address" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function resetPassword(password: string): Promise<ActionResult> {
  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  if (password.length > 128) {
    return { error: "Password is too long" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  redirect("/login");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
