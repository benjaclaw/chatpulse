import { createServiceClient } from "@/lib/supabase/service";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  let body: { conversationId: string; rating: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { conversationId, rating } = body;

  if (!conversationId || !rating) {
    return Response.json({ error: "Missing conversationId or rating" }, { status: 400 });
  }

  if (!["good", "ok", "bad"].includes(rating)) {
    return Response.json({ error: "Invalid rating" }, { status: 400 });
  }

  const service = createServiceClient();

  const { error } = await service
    .from("conversations")
    .update({ rating })
    .eq("id", conversationId);

  if (error) {
    logError("ratings", error);
    return Response.json({ error: "Failed to save rating" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
