import { createHash } from "crypto";

const PIXEL_ID = "813334724604818";
const API_VERSION = "v21.0";

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

interface ConversionEventOptions {
  eventName: string;
  email?: string;
  sourceUrl: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbc?: string;
  fbp?: string;
  eventId?: string;
}

export async function sendConversionEvent({
  eventName,
  email,
  sourceUrl,
  clientIpAddress,
  clientUserAgent,
  fbc,
  fbp,
  eventId,
}: ConversionEventOptions): Promise<void> {
  const accessToken = process.env.META_CONVERSIONS_API_TOKEN;
  if (!accessToken) {
    console.warn("[Meta CAPI] META_CONVERSIONS_API_TOKEN not set, skipping event");
    return;
  }

  const userData: Record<string, string> = {};
  if (email) (userData as Record<string, unknown>).em = [sha256(email)];
  if (clientIpAddress) userData.client_ip_address = clientIpAddress;
  if (clientUserAgent) userData.client_user_agent = clientUserAgent;
  if (fbc) userData.fbc = fbc;
  if (fbp) userData.fbp = fbp;

  const eventData: Record<string, unknown> = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    action_source: "website",
    event_source_url: sourceUrl,
    user_data: userData,
  };

  if (eventId) {
    eventData.event_id = eventId;
  }

  const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [eventData],
        access_token: accessToken,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[Meta CAPI] Error ${res.status}: ${body}`);
    }
  } catch (err) {
    console.error("[Meta CAPI] Failed to send event:", err);
  }
}
