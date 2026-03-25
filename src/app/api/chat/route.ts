import { createServiceClient } from "@/lib/supabase/service";
import { getPlanLimit } from "@/lib/plans";

export const runtime = "nodejs";

interface ChatRequest {
  chatbotId: string;
  conversationId: string | null;
  message: string;
  visitorId: string;
  language?: string;
}

// --- In-memory rate limiting ---
interface RateBucket {
  count: number;
  resetAt: number;
}

const visitorRateMap = new Map<string, RateBucket>();
const chatbotRateMap = new Map<string, RateBucket>();

const VISITOR_LIMIT = 20; // per minute
const CHATBOT_LIMIT = 100; // per minute
const WINDOW_MS = 60_000;

// Cleanup stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60_000;
let lastCleanup = Date.now();

function cleanupMaps(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, bucket] of visitorRateMap) {
    if (now > bucket.resetAt) visitorRateMap.delete(key);
  }
  for (const [key, bucket] of chatbotRateMap) {
    if (now > bucket.resetAt) chatbotRateMap.delete(key);
  }
}

function checkRate(map: Map<string, RateBucket>, key: string, limit: number): boolean {
  cleanupMaps();
  const now = Date.now();
  const bucket = map.get(key);
  if (!bucket || now > bucket.resetAt) {
    map.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  bucket.count++;
  return bucket.count <= limit;
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "AI er ikke konfigurert" },
      { status: 500 }
    );
  }

  let body: ChatRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Ugyldig forespørsel" }, { status: 400 });
  }

  const { chatbotId, conversationId, message, visitorId, language: detectedLanguage } = body;
  if (!chatbotId || !message?.trim() || !visitorId) {
    return Response.json(
      { error: "Mangler chatbotId, message eller visitorId" },
      { status: 400 }
    );
  }

  // Rate limit per visitor
  if (!checkRate(visitorRateMap, visitorId, VISITOR_LIMIT)) {
    return Response.json(
      { error: "Du sender for mange meldinger. Vennligst vent litt før du prøver igjen." },
      { status: 429 }
    );
  }

  // Rate limit per chatbot
  if (!checkRate(chatbotRateMap, chatbotId, CHATBOT_LIMIT)) {
    return Response.json(
      { error: "Denne chatboten mottar for mange forespørsler akkurat nå. Prøv igjen om litt." },
      { status: 429 }
    );
  }

  const supabase = createServiceClient();

  // 1. Fetch chatbot config
  const { data: config } = await supabase
    .from("chatbot_config")
    .select("workspace_id, prompt, welcome_message, fallback_response")
    .eq("id", chatbotId)
    .single();

  if (!config) {
    return Response.json({ error: "Chatbot ikke funnet" }, { status: 404 });
  }

  // Check message limit for workspace plan
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("plan_id, message_count, billing_cycle_start")
    .eq("id", config.workspace_id)
    .single();

  if (workspace) {
    // Reset monthly counter if billing cycle has elapsed
    const cycleStart = workspace.billing_cycle_start
      ? new Date(workspace.billing_cycle_start)
      : new Date();
    const now = new Date();
    const monthMs = 30 * 24 * 60 * 60 * 1000;
    if (now.getTime() - cycleStart.getTime() > monthMs) {
      await supabase
        .from("workspaces")
        .update({ message_count: 0, billing_cycle_start: now.toISOString() })
        .eq("id", config.workspace_id);
      workspace.message_count = 0;
    }

    const limit = getPlanLimit(workspace.plan_id ?? "basic");
    if (workspace.message_count >= limit) {
      return Response.json(
        { error: "Meldingsgrensen er nådd for denne måneden" },
        { status: 429 }
      );
    }
  }

  const fallback =
    config.fallback_response || "Beklager, noe gikk galt. Prøv igjen senere.";

  // 2. Get conversation history (last 10 messages) if conversationId exists
  let history: { role: string; content: string }[] = [];
  if (conversationId) {
    const { data: msgs } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(10);
    if (msgs) {
      history = msgs;
    }
  }

  // 3. Fetch company info if available
  const { data: companyInfo } = await supabase
    .from("company_info")
    .select("data")
    .eq("workspace_id", config.workspace_id)
    .maybeSingle();

  // 4. Search knowledge base with ILIKE on keywords from the message
  const words = message
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 5);

  let knowledgeContext = "";
  if (words.length > 0) {
    const orFilter = words
      .map((w) => {
        // Escape special characters for PostgREST ILIKE
        const safe = w.replace(/[%_'"()]/g, "");
        return `title.ilike.%${safe}%,content.ilike.%${safe}%`;
      })
      .join(",");

    const { data: articles, error: kbError } = await supabase
      .from("knowledge")
      .select("title, content")
      .eq("workspace_id", config.workspace_id)
      .or(orFilter)
      .limit(5);

    if (kbError) {
      console.error("Knowledge search error:", kbError);
    }

    if (articles?.length) {
      knowledgeContext = articles
        .map((a, i) => `[${i + 1}] ${a.title}\n${a.content}`)
        .join("\n\n");
    }
  }

  // 4. Build prompt
  // Build company context
  let companyContext = "";
  if (companyInfo?.data && typeof companyInfo.data === "object") {
    const d = companyInfo.data as Record<string, string>;
    const parts: string[] = [];
    if (d.name) parts.push(`Bedrift: ${d.name}`);
    if (d.email) parts.push(`E-post: ${d.email}`);
    if (d.phone) parts.push(`Telefon: ${d.phone}`);
    if (d.address) parts.push(`Adresse: ${d.address}`);
    if (d.hours) parts.push(`Åpningstider: ${d.hours}`);
    if (d.website) parts.push(`Nettside: ${d.website}`);
    if (d.description) parts.push(`Om bedriften: ${d.description}`);
    if (parts.length > 0) companyContext = parts.join("\n");
  }

  const systemPrompt = `${config.prompt || "Du er en hjelpsom kundeserviceassistent."}

VIKTIGE REGLER:
- Svar KUN basert på informasjonen i kunnskapsbasen og bedriftsinformasjonen under.
- ALDRI finn på, anta eller hallusinér informasjon som ikke finnes i kunnskapsbasen.
- ALDRI lov noe du ikke kan gjennomføre (f.eks. å videreformidle til noen, sende e-post, overføre samtaler).
- Du er en chatbot og kan IKKE utføre handlinger — kun gi informasjon.
- Hvis brukeren vil snakke med et menneske, gi kontaktinformasjonen til bedriften (e-post, telefon) hvis tilgjengelig.
- Hvis du ikke finner svaret i kunnskapsbasen, start svaret med [UBESVART] og si høflig at du ikke har informasjon om dette.${companyContext ? ` Henvis til bedriftens kontaktinformasjon slik at de kan få hjelp.` : ""}
- Hvis brukeren ønsker å snakke med et menneske, kontakte kundeservice, eller få personlig hjelp, inkluder taggen [HANDOFF] i starten av svaret. Gi et vennlig svar om at du vil koble dem med et menneske, og be dem oppgi e-postadressen sin.
- Detect the language the user writes in and respond in that same language. If unsure, use ${detectedLanguage || "nb"} as the default language.
- Vær vennlig, konsis og profesjonell.`;

  let fullPrompt = `System: ${systemPrompt}\n\n`;

  if (companyContext) {
    fullPrompt += `Bedriftsinformasjon:\n${companyContext}\n\n`;
  }

  if (knowledgeContext) {
    fullPrompt += `Kunnskapsbase:\n${knowledgeContext}\n\n`;
  }

  for (const msg of history) {
    const label = msg.role === "user" ? "Bruker" : "Assistent";
    fullPrompt += `${label}: ${msg.content}\n`;
  }

  fullPrompt += `Bruker: ${message}\nAssistent:`;

  // 5. Call Gemini API (plain fetch, no SDK)
  let aiResponse: string;
  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
        }),
      }
    );

    if (!geminiRes.ok) {
      console.error("Gemini API error:", geminiRes.status, await geminiRes.text());
      aiResponse = fallback;
    } else {
      const data = await geminiRes.json();
      aiResponse =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || fallback;
    }
  } catch (err) {
    console.error("Gemini fetch error:", err);
    aiResponse = fallback;
  }

  // 6. Create conversation if needed, then save messages
  let activeConversationId = conversationId;

  if (!activeConversationId) {
    const { data: newConvo, error: convoError } = await supabase
      .from("conversations")
      .insert({
        workspace_id: config.workspace_id,
        visitor_id: visitorId,
      })
      .select("id")
      .single();

    if (convoError) {
      console.error("Conversation insert error:", convoError);
    }

    activeConversationId = newConvo?.id ?? null;
  }

  if (activeConversationId) {
    await supabase.from("messages").insert([
      {
        conversation_id: activeConversationId,
        role: "user",
        content: message,
      },
      {
        conversation_id: activeConversationId,
        role: "assistant",
        content: aiResponse,
      },
    ]);
  }

  // 6b. Increment workspace message count
  if (workspace) {
    await supabase
      .from("workspaces")
      .update({ message_count: (workspace.message_count ?? 0) + 1 })
      .eq("id", config.workspace_id);
  }

  // 7. Detect handoff tag
  const isHandoff = aiResponse.startsWith("[HANDOFF]");
  if (isHandoff) {
    aiResponse = aiResponse.replace("[HANDOFF]", "").trim();
  }

  // 8. Track ALL questions for insights
  const isUnanswered = aiResponse.startsWith("[UBESVART]");
  if (isUnanswered) {
    aiResponse = aiResponse.replace("[UBESVART]", "").trim();
  }

  // Log every user question — find similar using multi-strategy matching
  const questionText = message.trim();
  if (questionText.length > 2) {
    const normalized = questionText.toLowerCase().replace(/[?!.,;:'"()]/g, "").trim();
    const words = normalized.split(/\s+/).filter((w) => w.length > 2);

    let matched = false;
    const { data: candidates } = await supabase
      .from("questions")
      .select("id, question, count, answered")
      .eq("workspace_id", config.workspace_id)
      .limit(200);

    if (candidates && candidates.length > 0) {
      for (const candidate of candidates) {
        const candNorm = candidate.question.toLowerCase().replace(/[?!.,;:'"()]/g, "").trim();

        // Strategy 1: One contains the other (substring match)
        if (candNorm.includes(normalized) || normalized.includes(candNorm)) {
          matched = true;
        }

        // Strategy 2: Any significant word appears in the other (catches "menneske" vs "menneske plis")
        if (!matched && words.length > 0) {
          const candWords = candNorm.split(/\s+/).filter((w: string) => w.length > 2);
          // Check if ANY word from one appears in the other (bi-directional)
          const anyNewInCand = words.some((w) => candWords.some((cw: string) => cw.includes(w) || w.includes(cw)));
          const anyCandInNew = candWords.some((cw: string) => words.some((w) => w.includes(cw) || cw.includes(w)));
          
          if (anyNewInCand || anyCandInNew) {
            // At least one shared root word — check overlap ratio too
            const newInCand = words.filter((w) => candWords.some((cw: string) => cw.includes(w) || w.includes(cw))).length;
            const shorter = Math.min(words.length, candWords.length);
            // If the shorter question has >50% of its words matched, it's similar
            if (shorter > 0 && newInCand / shorter >= 0.5) {
              matched = true;
            }
          }
        }

        if (matched) {
          // Keep the longer/more descriptive question as the canonical text
          const updateData: Record<string, unknown> = {
            count: candidate.count + 1,
            last_asked_at: new Date().toISOString(),
            answered: candidate.answered || !isUnanswered,
          };
          if (questionText.length > candidate.question.length) {
            updateData.question = questionText;
          }
          await supabase
            .from("questions")
            .update(updateData)
            .eq("id", candidate.id);
          break;
        }
      }
    }

    if (!matched) {
      await supabase.from("questions").insert({
        workspace_id: config.workspace_id,
        question: questionText,
        count: 1,
        answered: !isUnanswered,
      });
    }
  }

  // 9. Return response
  return Response.json({
    response: aiResponse,
    conversationId: activeConversationId,
    workspaceId: config.workspace_id,
    ...(isHandoff && { handoff: true }),
  });
}
