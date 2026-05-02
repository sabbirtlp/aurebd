import { GoogleGenerativeAI } from "@google/generative-ai";
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
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!groqKey && !geminiKey) {
      return NextResponse.json({ message: "No AI API Key configured." }, { status: 500 });
    }

    const { messages } = await req.json();
    let text = "";

    // 1. TRY GROQ FIRST
    if (groqKey) {
      const groqModels = ["llama-3.1-70b-versatile", "llama-3.1-8b-instant", "llama3-70b-8192", "llama3-8b-8192"];
      
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

          text = chatCompletion.choices[0].message.content || "";
          if (text) return NextResponse.json({ text });
        } catch (err: any) {
          console.warn(`Groq chat model ${model} failed:`, err.message);
          continue;
        }
      }
    }

    // 2. TRY GEMINI
    if (geminiKey) {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const lastMessage = messages[messages.length - 1].content;

      const result = await model.generateContent(lastMessage);
      const response = await result.response;
      text = response.text();
      if (text) return NextResponse.json({ text });
    }

    throw new Error("AI Chat failed");
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return NextResponse.json({ message: error.message || "AI Chat failed" }, { status: 500 });
  }
}
