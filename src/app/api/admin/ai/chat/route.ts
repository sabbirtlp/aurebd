import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

const SYSTEM_CONTEXT = `
You are the Aurea BD Admin Assistant. Aurea BD is a luxury Japanese skincare brand in Bangladesh.
Brand Tone: Premium, Sophisticated, Trustworthy, and Helpful.
Format: Clean text or simple HTML.
`;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const groqKey = process.env.GROQ_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    if (!groqKey && !openRouterKey) {
      return NextResponse.json({ message: "No AI API Key configured." }, { status: 500 });
    }

    const { messages } = await req.json();

    // 1. TRY GROQ FIRST
    if (groqKey) {
      const groqModels = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
      
      for (const model of groqModels) {
        try {
          const groq = new OpenAI({
            apiKey: groqKey,
            baseURL: "https://api.groq.com/openai/v1",
          });

          const chatCompletion = await groq.chat.completions.create({
            messages: [
              { role: "system", content: SYSTEM_CONTEXT },
              ...messages.map((m: any) => ({
                role: m.role === "ai" ? "assistant" : "user",
                content: m.content
              }))
            ],
            model: model,
          });

          const text = chatCompletion.choices[0].message.content || "";
          if (text) return NextResponse.json({ text });
        } catch (err: any) {
          console.warn(`Groq chat model ${model} failed:`, err.message);
          continue;
        }
      }
    }

    // 2. TRY OPENROUTER (Gemini via OpenRouter - no card needed)
    if (openRouterKey) {
      try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openRouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://aureabd.com",
            "X-Title": "AureaBD",
          },
          body: JSON.stringify({
            model: "google/gemini-2.0-flash-exp:free",
            messages: [
              { role: "system", content: SYSTEM_CONTEXT },
              ...messages.map((m: any) => ({
                role: m.role === "ai" ? "assistant" : "user",
                content: m.content
              }))
            ],
            temperature: 0.3,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.choices?.[0]?.message?.content || "";
          if (text) return NextResponse.json({ text });
        }
      } catch (err: any) {
        console.warn("OpenRouter admin chat failed:", err.message);
      }
    }

    throw new Error("AI Chat failed");
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return NextResponse.json({ message: error.message || "AI Chat failed" }, { status: 500 });
  }
}
