import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!groqKey && !geminiKey) {
      return NextResponse.json({ message: "AI Assistant is resting..." }, { status: 500 });
    }

    const systemPrompt = `You are Aurea AI, the luxury skincare concierge for AureaBD. 
    Your tone is sophisticated, helpful, and knowledgeable about skincare.
    You assist customers with:
    - Product recommendations.
    - Ingredients and their benefits.
    - Skincare routines (morning/night).
    - Order tracking (general info).
    - Brand values: Luxury, Organic, Effective.
    
    Keep responses concise but elegant. Use emojis sparingly (✨, 🌿, 🧴).`;

    // 1. TRY GROQ (Ultra Fast Chat)
    if (groqKey) {
      try {
        const groq = new OpenAI({ apiKey: groqKey, baseURL: "https://api.groq.com/openai/v1" });
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            ...messages
          ],
          model: "llama-3.1-70b-versatile",
          temperature: 0.7,
          max_tokens: 500,
        });

        const text = chatCompletion.choices[0].message.content || "";
        return NextResponse.json({ text });
      } catch (err) {
        console.error("Groq Chat Error:", err);
      }
    }

    // 2. FALLBACK TO GEMINI
    if (geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Transform messages for Gemini
        const history = messages.slice(0, -1).map((m: any) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }]
        }));
        const lastMessage = messages[messages.length - 1].content;

        const chat = model.startChat({
          history: history,
          generationConfig: { maxOutputTokens: 500 },
        });

        const result = await chat.sendMessage(`${systemPrompt}\n\nUser: ${lastMessage}`);
        const response = await result.response;
        return NextResponse.json({ text: response.text() });
      } catch (err) {
        console.error("Gemini Chat Error:", err);
      }
    }

    return NextResponse.json({ message: "Service unavailable" }, { status: 503 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
