/**
 * Send a Supabase Realtime broadcast via channel subscribe+send.
 * Reliable approach — subscribe, send, then cleanup.
 */
import { createClient } from "@supabase/supabase-js";

let _broadcastClient: ReturnType<typeof createClient> | null = null;

function getBroadcastClient() {
  if (_broadcastClient) return _broadcastClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  _broadcastClient = createClient(url, key);
  return _broadcastClient;
}

export async function sendBroadcast(
  topic: string,
  event: string,
  payload: Record<string, unknown>
): Promise<void> {
  try {
    const client = getBroadcastClient();
    const channel = client.channel(topic);
    
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        client.removeChannel(channel);
        reject(new Error("Broadcast subscribe timeout"));
      }, 5000);
      
      channel.subscribe((status: string) => {
        if (status === "SUBSCRIBED") {
          clearTimeout(timeout);
          resolve();
        }
      });
    });
    
    await channel.send({
      type: "broadcast",
      event,
      payload,
    });
    
    client.removeChannel(channel);
  } catch (err) {
    console.error("Broadcast error:", err);
  }
}
