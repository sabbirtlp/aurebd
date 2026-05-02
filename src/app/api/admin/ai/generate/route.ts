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

    const { name, category, features, field, customPrompt } = await req.json();
    let text = "";

    // 1. TRY GROQ FIRST (Completely Free & Ultra Fast)
    if (groqKey) {
      const groqModels = ["llama-3.1-70b-versatile", "llama-3.1-8b-instant", "llama3-70b-8192", "llama3-8b-8192"];
      
      const prompt = `
        ### CRITICAL INSTRUCTIONS
        ${customPrompt ? `PRIORITY: The user has specified these exact instructions which YOU MUST FOLLOW: "${customPrompt}"` : 'Follow the default luxury brand tone.'}

        ### CONTEXT
        Product: ${name}
        Category: ${category}
        Key Features: ${features}
        Target Field: ${field}

        ### REQUIREMENTS
        - Style: Professional, high-end luxury skincare brand tone.
        - Language: English (unless specified otherwise in critical instructions).
        ${field === 'description' ? '- Format: A single elegant paragraph (100-150 words).' : ''}
        ${field === 'ingredients' ? '- Format: An HTML <ul> list of premium ingredients. ONLY return the <ul> content.' : ''}
        ${field === 'howToUse' ? '- Format: An HTML <ol> list of 3-5 steps. ONLY return the <ol> content.' : ''}
      `;

      for (const model of groqModels) {
        try {
          const groq = new OpenAI({
            apiKey: groqKey,
            baseURL: "https://api.groq.com/openai/v1",
          });

          const chatCompletion = await groq.chat.completions.create({
            messages: [
              { role: "system", content: "You are an expert luxury skincare copywriter. You follow user instructions with extreme precision." },
              { role: "user", content: prompt }
            ],
            model: model,
            temperature: 0.7,
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
      
      const prompt = `
        ACT AS A LUXURY SKINCARE COPYWRITER.
        
        USER INSTRUCTION (PRIORITY): ${customPrompt || "No specific instructions."}
        
        TASK: Generate the ${field} for "${name}" in "${category}".
        KEY FEATURES: ${features}
        
        FORMATTING:
        - If ingredients: Provide ONLY an HTML <ul> list.
        - If howToUse: Provide ONLY an HTML <ol> list.
        - If description: Provide one elegant paragraph.
        
        Ensure you follow the USER INSTRUCTION above with absolute precision.
      `;

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
