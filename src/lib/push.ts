import { createServiceClient } from "./supabase/service";
import { logError } from "./logger";

interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  sound?: string;
}

/**
 * Send push notifications via Expo Push API.
 * Silently fails — push is best-effort.
 */
async function sendExpoPush(messages: PushMessage[]): Promise<void> {
  if (messages.length === 0) return;

  try {
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messages),
    });

    if (!res.ok) {
      const text = await res.text();
      logError("Expo push send", new Error(`HTTP ${res.status}: ${text}`));
    }
  } catch (err) {
    logError("Expo push send", err);
  }
}

/**
 * Notify all workspace agents about a new waiting conversation.
 */
export async function notifyNewConversation(
  workspaceId: string,
  conversationId: string,
  preview?: string
): Promise<void> {
  const supabase = createServiceClient();

  // Get all members of this workspace
  const { data: members } = await supabase
    .from("members")
    .select("user_id")
    .eq("workspace_id", workspaceId);

  if (!members || members.length === 0) return;

  const userIds = members.map((m: { user_id: string }) => m.user_id);

  // Get push tokens for these users in this workspace
  const { data: tokens } = await supabase
    .from("push_tokens")
    .select("expo_push_token")
    .eq("workspace_id", workspaceId)
    .in("user_id", userIds);

  if (!tokens || tokens.length === 0) return;

  const messages: PushMessage[] = tokens.map((t: { expo_push_token: string }) => ({
    to: t.expo_push_token,
    title: "Ny henvendelse",
    body: preview?.substring(0, 100) || "Ny samtale venter",
    data: { conversationId },
    sound: "default",
  }));

  await sendExpoPush(messages);
}

/**
 * Notify the assigned agent about a new visitor message.
 */
export async function notifyNewMessage(
  conversationId: string,
  content?: string
): Promise<void> {
  const supabase = createServiceClient();

  const { data: conv } = await supabase
    .from("conversations")
    .select("assigned_to, workspace_id")
    .eq("id", conversationId)
    .is("deleted_at", null)
    .single();

  if (!conv?.assigned_to) return;

  const { data: tokens } = await supabase
    .from("push_tokens")
    .select("expo_push_token")
    .eq("user_id", conv.assigned_to)
    .eq("workspace_id", conv.workspace_id);

  if (!tokens || tokens.length === 0) return;

  const messages: PushMessage[] = tokens.map((t: { expo_push_token: string }) => ({
    to: t.expo_push_token,
    title: "Ny melding",
    body: content?.substring(0, 100) || "Ny melding mottatt",
    data: { conversationId },
    sound: "default",
  }));

  await sendExpoPush(messages);
}
