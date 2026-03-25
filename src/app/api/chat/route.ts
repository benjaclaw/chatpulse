import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

interface ChatRequest {
  chatbotId: string;
  conversationId: string | null;
  message: string;
  visitorId: string;
}

// TODO: Add rate limiting here (e.g. per visitorId or IP)

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

  const { chatbotId, conversationId, message, visitorId } = body;
  if (!chatbotId || !message?.trim() || !visitorId) {
    return Response.json(
      { error: "Mangler chatbotId, message eller visitorId" },
      { status: 400 }
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
- Svar alltid på norsk med mindre brukeren skriver på et annet språk.
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

  // 7. Track unanswered questions for insights
  const isUnanswered = aiResponse.startsWith("[UBESVART]");
  if (isUnanswered) {
    // Strip the tag from the response shown to the user
    aiResponse = aiResponse.replace("[UBESVART]", "").trim();

    // Log to questions table (upsert: increment count if same question exists)
    const { data: existing } = await supabase
      .from("questions")
      .select("id, count")
      .eq("workspace_id", config.workspace_id)
      .ilike("question", message.trim())
      .maybeSingle();

    if (existing) {
      await supabase
        .from("questions")
        .update({ count: existing.count + 1, last_asked_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      await supabase.from("questions").insert({
        workspace_id: config.workspace_id,
        question: message.trim(),
        count: 1,
        answered: false,
      });
    }
  }

  // 8. Return response
  return Response.json({
    response: aiResponse,
    conversationId: activeConversationId,
  });
}
