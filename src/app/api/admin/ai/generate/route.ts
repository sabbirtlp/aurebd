import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!groqKey && !geminiKey) {
      return NextResponse.json({ message: "No AI API Key configured. Please add GROQ_API_KEY or GEMINI_API_KEY to your .env.local" }, { status: 500 });
    }

    const { name, category, features, field } = await req.json();
    let text = "";

    // 1. TRY GROQ FIRST (Completely Free & Ultra Fast)
    if (groqKey) {
      const groqModels = ["llama-3.1-70b-versatile", "llama-3.1-8b-instant", "llama3-70b-8192", "llama3-8b-8192"];
      
      const prompt = `Generate a luxury skincare product ${field} for a product named "${name}" in the "${category}" category. 
      Key features: ${features}. 
      Field: ${field}.
      ${field === 'description' ? 'Format: A single elegant paragraph (100-150 words).' : ''}
      ${field === 'ingredients' ? 'Format: An HTML <ul> list of premium ingredients.' : ''}
      ${field === 'howToUse' ? 'Format: An HTML <ol> list of 3-5 steps.' : ''}
      Style: Professional, luxury skincare brand tone.`;

      for (const model of groqModels) {
        try {
          const groq = new OpenAI({
            apiKey: groqKey,
            baseURL: "https://api.groq.com/openai/v1",
          });

          const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: model,
          });

          text = chatCompletion.choices[0].message.content || "";
          if (text) return NextResponse.json({ text });
        } catch (err: any) {
          console.warn(`Groq model ${model} failed:`, err.message);
          continue;
        }
      }
    }

    // 2. FALLBACK TO GEMINI
    if (geminiKey) {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const modelNames = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
      
      let prompt = "";
      if (field === "description") {
        prompt = `Generate a luxury skincare product description for a product named "${name}" in the "${category}" category. 
        Key features: ${features}. Style: Elegant. Format: One paragraph.`;
      } else if (field === "ingredients") {
        prompt = `Generate an HTML <ul> list of ingredients for "${name}" (${category}).`;
      } else if (field === "howToUse") {
        prompt = `Generate an HTML <ol> list of instructions for "${name}" (${category}).`;
      }

      for (const modelName of modelNames) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          const response = await result.response;
          text = response.text();
          if (text) return NextResponse.json({ text });
        } catch (err: any) {
          console.warn(`Gemini ${modelName} failed...`, err.message);
        }
      }
    }

    throw new Error("All AI providers failed to respond");
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ message: error.message || "AI Generation failed" }, { status: 500 });
  }
}
