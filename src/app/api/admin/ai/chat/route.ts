import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_CONTEXT = `
You are the Aurea BD Admin Assistant. Aurea BD is a luxury Japanese skincare brand in Bangladesh.
Brand Tone: Premium, Sophisticated, Trustworthy, and Helpful.
Core Products: Sakura-based skincare sets, radiance serums, hydration creams, and UV protection.
Your Goal: Help the admin manage the website, generate marketing copy, write product descriptions, or answer questions about the brand's digital presence.
Always maintain a professional and helpful tone. Format your responses using clean HTML or simple text.
`;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ message: "AI API Key not configured." }, { status: 500 });
    }

    // Initialize inside handler to ensure fresh ENV
    const genAI = new GoogleGenerativeAI(apiKey);
    const { messages } = await req.json();

    // Fallback logic for models
    const modelNames = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
    let text = "";
    let lastError = null;

    const lastMessage = messages[messages.length - 1].content;

    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const chat = model.startChat({
          history: [
            { role: "user", parts: [{ text: SYSTEM_CONTEXT }] },
            { role: "model", parts: [{ text: "Understood. I am the Aurea BD Admin Assistant, ready to help manage the luxury skincare platform." }] },
            ...messages.slice(0, -1).map((m: any) => ({
              role: m.role === "user" ? "user" : "model",
              parts: [{ text: m.content }]
            }))
          ],
        });

        const result = await chat.sendMessage(lastMessage);
        const response = await result.response;
        text = response.text();
        if (text) break;
      } catch (err: any) {
        console.warn(`Model ${modelName} failed in chat, trying next...`, err.message);
        lastError = err;
        continue;
      }
    }

    if (!text) {
      throw lastError || new Error("All AI chat models failed to respond");
    }

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    const errorMessage = error.message || "AI Chat failed";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
