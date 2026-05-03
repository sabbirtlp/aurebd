import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

// Utility to fetch and clean URL content
async function fetchUrlContent(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) return "";
    
    let html = await response.text();
    // Simple cleaning: remove scripts, styles, and tags
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
    html = html.replace(/<[^>]+>/g, " ");
    html = html.replace(/\s+/g, " ").trim();
    
    return html.substring(0, 5000); // Limit context size
  } catch (err) {
    console.error("URL Fetch error:", err);
    return "";
  }
}

// Build field-specific formatting instructions
function getFieldFormat(field: string): string {
  switch (field) {
    case "ingredients":
      return "Return ONLY an HTML <ul> list of key ingredients with their skin benefits. No intro text.";
    case "howToUse":
      return "Return ONLY an HTML <ol> list of step-by-step usage instructions. No intro text.";
    case "shortDescription":
      return "Return ONLY 1-2 short, catchy marketing sentences.";
    case "description":
      return "Return a compelling 3-5 sentence marketing paragraph.";
    default:
      return "Return the content as plain text.";
  }
}

// Gemini model names to try in order (newest first)
const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash-latest",
];

// Groq model names to try in order
const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
];

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

    const { name, category, field, customPrompt, existingContent, language } = await req.json();
    
    // Detect URL in prompt and browse if exists
    let browsingData = "";
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const foundUrls = customPrompt?.match(urlRegex);
    if (foundUrls && foundUrls.length > 0) {
      browsingData = await fetchUrlContent(foundUrls[0]);
    }

    const isBangla = language === "bn";
    const langLabel = isBangla ? "Bangla (Bengali)" : "English";
    const formatInstruction = getFieldFormat(field);

    // --- Build a unified, high-quality prompt ---
    const systemPrompt = isBangla
      ? `You are a professional luxury skincare copywriter who writes in natural, fluent Bangla for the Bangladeshi market. 
You work for Aurea BD, a premium Japanese & Korean skincare brand.

CRITICAL RULES:
- Write ONLY in Bangla. Every word of your output must be in Bangla script.
- Keep brand names (like "Axis-y", "Laikou", "COSRX") in English/Latin script.
- Keep well-known ingredient names in English (e.g., Niacinamide, Vitamin C, Hyaluronic Acid) — do NOT transliterate them into Bangla.
- NEVER invent fake ingredient names. Only mention ingredients if they appear in the provided reference data.
- Use "সিরাম" for Serum, "ময়েশ্চারাইজার" for Moisturizer, "টোনার" for Toner.
- Write naturally — like a trusted Bangladeshi beauty influencer, not like a robot translating from English.
- Focus on real skin benefits: উজ্জ্বলতা (brightness), দাগ দূর করা (dark spot removal), আর্দ্রতা (hydration), সতেজতা (freshness).`
      : `You are a professional luxury skincare copywriter who writes elegant, persuasive English content.
You work for Aurea BD, a premium Japanese & Korean skincare brand.

CRITICAL RULES:
- Write polished, high-end marketing copy.
- Focus on benefits: radiance, hydration, dark spot correction, youthful glow.
- Keep it concise and compelling. No filler words.
- NEVER invent fake ingredient names. Only mention ingredients if they appear in the provided reference data.`;

    const userPrompt = `Product: "${name}"
Category: ${category || "Skincare"}
Field to generate: ${field}

${browsingData ? `REFERENCE DATA FROM LINK:\n${browsingData}\n` : ""}${customPrompt ? `ADDITIONAL INSTRUCTIONS: ${customPrompt}\n` : ""}
FORMAT: ${formatInstruction}

Generate the ${field} now. Output ONLY the content — no explanations, no markdown code fences.`;

    // --- Try Groq first (faster, more reliable for both languages) ---
    if (groqKey) {
      for (const model of GROQ_MODELS) {
        try {
          const groq = new OpenAI({ apiKey: groqKey, baseURL: "https://api.groq.com/openai/v1" });
          const completion = await groq.chat.completions.create({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            model,
            temperature: 0.4,
            max_tokens: 1500,
          });

          let result = completion.choices[0].message.content || "";
          result = result.replace(/```html|```/g, "").trim();
          
          if (result && result.length > 10) {
            return NextResponse.json({ text: result });
          }
        } catch (err: any) {
          console.warn(`Groq model ${model} failed:`, err.message);
          continue;
        }
      }
    }

    // --- Fallback to Gemini ---
    if (geminiKey) {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
      
      for (const modelName of GEMINI_MODELS) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(fullPrompt);
          let output = result.response.text();
          output = output.replace(/```html|```/g, "").trim();
          
          if (output && output.length > 10) {
            return NextResponse.json({ text: output });
          }
        } catch (err: any) {
          console.warn(`Gemini model ${modelName} failed:`, err.message);
          continue;
        }
      }
    }

    throw new Error("All AI models failed to generate content");
  } catch (error: any) {
    console.error("API Error in AI Generate:", error.message);
    return NextResponse.json({ message: error.message || "Failed to generate content" }, { status: 500 });
  }
}
