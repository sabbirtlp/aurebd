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
      const groqModels = ["llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "llama3-70b-8192", "mixtral-8x7b-32768"];
      
      for (const model of groqModels) {
        try {
          const groq = new OpenAI({ apiKey: groqKey, baseURL: "https://api.groq.com/openai/v1" });
          const chatCompletion = await groq.chat.completions.create({
            messages: [
              { role: "system", content: systemPrompt },
              ...messages
            ],
            model: model,
            temperature: 0.7,
            max_tokens: 500,
          });

          const text = chatCompletion.choices[0].message.content || "";
          if (text) return NextResponse.json({ text });
        } catch (err: any) {
          console.warn(`Groq Chat model ${model} failed:`, err.message);
          continue;
        }
      }
    }

    // 2. FALLBACK TO GEMINI
    if (geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Transform messages for Gemini (Ensuring correct role mapping)
        const history = messages.slice(0, -1).map((m: any) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }]
        }));
        const lastMessage = messages[messages.length - 1].content;

        const chat = model.startChat({
          history: history,
          generationConfig: { maxOutputTokens: 800 },
        });

        const result = await chat.sendMessage(`CONTEXT: ${systemPrompt}\n\nUSER_MESSAGE: ${lastMessage}`);
        const response = await result.response;
        const text = response.text();
        if (text) return NextResponse.json({ text });
      } catch (err: any) {
        console.error("Gemini Chat Error:", err.message);
      }
    }

    return NextResponse.json({ message: "All AI providers are currently busy. Please try again in a moment." }, { status: 503 });
  } catch (error: any) {
    console.error("Global Chat API Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
