import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  chatbotId: string;
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
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

  const { messages, chatbotId } = body;
  if (!messages?.length || !chatbotId) {
    return Response.json({ error: "Mangler meldinger eller chatbotId" }, { status: 400 });
  }

  const supabase = await createClient();

  // Fetch chatbot config
  const { data: config } = await supabase
    .from("chatbot_config")
    .select("prompt, fallback_response, workspace_id")
    .eq("id", chatbotId)
    .single();

  if (!config) {
    return Response.json({ error: "Chatbot ikke funnet" }, { status: 404 });
  }

  // Fetch knowledge base articles for context
  const { data: knowledge } = await supabase
    .from("knowledge")
    .select("title, content, category")
    .eq("workspace_id", config.workspace_id);

  // Build system instruction
  let systemInstruction = config.prompt || "Du er en hjelpsom kundeserviceassistent. Svar alltid på norsk.";

  if (knowledge?.length) {
    systemInstruction += "\n\n## Kunnskapsbase\nBruk følgende informasjon til å svare kunden:\n\n";
    for (const article of knowledge) {
      systemInstruction += `### ${article.title} (${article.category})\n${article.content}\n\n`;
    }
    systemInstruction += "Hvis spørsmålet ikke kan besvares med informasjonen over, si at du ikke har svaret og tilby å sette kunden i kontakt med en medarbeider.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Convert messages to Gemini format (user/model roles)
    const contents = messages.map((msg) => ({
      role: msg.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: msg.content }],
    }));

    const response = await ai.models.generateContentStream({
      model: "gemini-2.5-flash-lite",
      contents,
      config: {
        systemInstruction,
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
    });

    // Stream the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          const fallback = config.fallback_response || "Beklager, noe gikk galt. Prøv igjen senere.";
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: fallback, error: true })}\n\n`)
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          console.error("Gemini streaming error:", err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("Gemini API error:", err);
    return Response.json(
      { reply: config.fallback_response || "Beklager, noe gikk galt." },
      { status: 200 }
    );
  }
}
