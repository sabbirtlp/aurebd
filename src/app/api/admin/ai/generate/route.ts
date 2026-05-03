import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

// Enhanced URL content extractor
async function fetchUrlContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    
    if (!response.ok) return "";
    
    const html = await response.text();
    const parts: string[] = [];

    // 1. Extract JSON-LD structured data (best source for product info)
    const jsonLdMatches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
    if (jsonLdMatches) {
      for (const match of jsonLdMatches) {
        const jsonStr = match.replace(/<script[^>]*>|<\/script>/gi, "").trim();
        try {
          const data = JSON.parse(jsonStr);
          if (data.name || data.description || data.ingredients) {
            parts.push(`STRUCTURED DATA: ${JSON.stringify(data, null, 0).substring(0, 2000)}`);
          }
        } catch { /* skip invalid json */ }
      }
    }

    // 2. Extract meta description and og tags
    const metaDesc = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
    if (metaDesc) parts.push(`META DESCRIPTION: ${metaDesc[1]}`);
    
    const ogDesc = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i);
    if (ogDesc) parts.push(`OG DESCRIPTION: ${ogDesc[1]}`);

    const title = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (title) parts.push(`PAGE TITLE: ${title[1]}`);

    // 3. Extract visible text content (cleaned)
    let bodyText = html;
    bodyText = bodyText.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    bodyText = bodyText.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
    bodyText = bodyText.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, "");
    bodyText = bodyText.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, "");
    bodyText = bodyText.replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, "");
    bodyText = bodyText.replace(/<[^>]+>/g, " ");
    bodyText = bodyText.replace(/&nbsp;/g, " ");
    bodyText = bodyText.replace(/&amp;/g, "&");
    bodyText = bodyText.replace(/\s+/g, " ").trim();
    
    if (bodyText.length > 100) {
      parts.push(`PAGE CONTENT: ${bodyText.substring(0, 3000)}`);
    }
    
    return parts.join("\n\n") || "";
  } catch (err) {
    console.error("URL Fetch error:", err);
    return "";
  }
}

// Field-specific format instructions
function getFieldFormat(field: string, isBangla: boolean): string {
  const lang = isBangla ? "Bangla" : "English";
  switch (field) {
    case "ingredients":
      return `Return ONLY an HTML <ul> list of the key active ingredients with a short benefit for each. Keep ingredient names in English. Write benefits in ${lang}. Example format:
<ul>
<li><strong>Niacinamide</strong> — ${isBangla ? "ত্বকের দাগ কমায় ও উজ্জ্বলতা বাড়ায়" : "Reduces dark spots and enhances radiance"}</li>
</ul>`;
    case "howToUse":
      return `Return ONLY an HTML <ol> list of clear, simple usage steps in ${lang}. ${isBangla ? 'Example: <ol><li>পরিষ্কার মুখে ২-৩ ফোঁটা সিরাম নিন</li><li>আলতোভাবে ত্বকে মালিশ করুন</li></ol>' : 'Example: <ol><li>Apply 2-3 drops to clean face</li><li>Gently massage into skin</li></ol>'}`;
    case "shortDescription":
      return `Return ONLY 1-2 short, catchy marketing sentences in ${lang}.`;
    case "description":
      return `Return a compelling 3-5 sentence marketing paragraph in ${lang}.`;
    default:
      return `Return the content as plain text in ${lang}.`;
  }
}

// Gemini model names to try (newest first)
const GEMINI_MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite"];

// Groq model names to try
const GROQ_MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];

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
    
    // Detect URL in prompt and browse
    let browsingData = "";
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const foundUrls = customPrompt?.match(urlRegex);
    if (foundUrls && foundUrls.length > 0) {
      browsingData = await fetchUrlContent(foundUrls[0]);
    }

    const isBangla = language === "bn";
    const formatInstruction = getFieldFormat(field, isBangla);

    // ---- BANGLA SYSTEM PROMPT ----
    const banglaSystemPrompt = `You are a professional Bangladeshi beauty copywriter for Aurea BD — a premium Japanese & Korean skincare brand in Bangladesh.

YOUR WRITING STYLE:
- You write fluent, natural Bangla as spoken by educated urban Bangladeshi women.
- Your tone is warm, trustworthy, and premium — like a popular beauty influencer recommending a product to a friend.
- You NEVER translate literally from English. You write original Bangla copy.

VOCABULARY RULES:
- Brand names stay in English: "Axis-y", "Laikou", "COSRX"
- Ingredient names stay in English: "Niacinamide", "Vitamin C", "Hyaluronic Acid"
- Product types use standard Bangla transliterations: সিরাম (serum), টোনার (toner), ময়েশ্চারাইজার (moisturizer), সানস্ক্রিন (sunscreen), ক্রিম (cream), ফেসওয়াশ (face wash)
- NEVER use: "প্রয়োগ করুন" (too formal), "মুখমণ্ডল" (too clinical), "স্ফীত" (wrong word)
- ALWAYS use: "ব্যবহার করুন", "মুখে/ত্বকে লাগান", "মুখে দিন"

GOOD BANGLA EXAMPLES:
- "পরিষ্কার মুখে ২-৩ ফোঁটা সিরাম নিয়ে আলতোভাবে মালিশ করুন"
- "এই সিরাম ত্বকের গভীর থেকে পুষ্টি যোগায় এবং কালো দাগ হালকা করে"
- "প্রতিদিন সকালে ও রাতে ব্যবহার করুন সেরা ফলাফলের জন্য"
- "আপনার ত্বকে প্রাকৃতিক উজ্জ্বলতা ফিরিয়ে আনতে এই সিরাম অসাধারণ কার্যকর"

NEVER WRITE:
- "চুলার জল দিয়ে মুখমণ্ডলকে স্ফীত করুন" — this is nonsense
- "একটি ছোট পরিমাণ আপনার মুখে প্রয়োগ করুন" — too robotic
- Do NOT invent fake ingredient names in Bangla`;

    // ---- ENGLISH SYSTEM PROMPT ----
    const englishSystemPrompt = `You are a professional luxury skincare copywriter for Aurea BD — a premium Japanese & Korean skincare brand.

YOUR WRITING STYLE:
- Elegant, persuasive, and results-focused.
- Think Sephora or Glossier product descriptions.
- Concise but compelling. Every sentence should sell.

RULES:
- Focus on tangible benefits: radiance, hydration, dark spot correction, even skin tone.
- NEVER invent ingredient names. Only mention ingredients found in the provided reference data.
- Keep it professional and premium.`;

    const systemPrompt = isBangla ? banglaSystemPrompt : englishSystemPrompt;

    const userPrompt = `Product: "${name}"
Category: ${category || "Skincare"}
Field to generate: ${field}
${browsingData ? `\nREFERENCE DATA FROM PRODUCT LINK:\n${browsingData}\n\nIMPORTANT: Use the actual product information from the link above. Extract real ingredients, real usage steps, and real product benefits from this data.` : ""}
${customPrompt ? `\nADDITIONAL INSTRUCTIONS: ${customPrompt}` : ""}

FORMAT: ${formatInstruction}

Generate the ${field} now. Output ONLY the final content — no explanations, no intro text, no markdown code fences, no "Here is..." prefix.`;

    // ---- For BANGLA: Try Gemini first (much better at Bangla than Llama) ----
    if (isBangla && geminiKey) {
      const genAI = new GoogleGenerativeAI(geminiKey);
      for (const modelName of GEMINI_MODELS) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
          let output = result.response.text();
          output = output.replace(/```html|```/g, "").trim();
          
          if (output && output.length > 10) {
            return NextResponse.json({ text: output });
          }
        } catch (err: any) {
          console.warn(`Gemini ${modelName} failed:`, err.message);
          continue;
        }
      }
    }

    // ---- For ENGLISH: Try Groq first (faster) ----
    if (!isBangla && groqKey) {
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
          console.warn(`Groq ${model} failed:`, err.message);
          continue;
        }
      }
    }

    // ---- Fallback: Try the other provider ----
    // Bangla fallback → Groq
    if (isBangla && groqKey) {
      try {
        const groq = new OpenAI({ apiKey: groqKey, baseURL: "https://api.groq.com/openai/v1" });
        const completion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.4,
          max_tokens: 1500,
        });
        let result = completion.choices[0].message.content || "";
        result = result.replace(/```html|```/g, "").trim();
        if (result && result.length > 10) return NextResponse.json({ text: result });
      } catch (err: any) {
        console.warn("Groq Bangla fallback failed:", err.message);
      }
    }

    // English fallback → Gemini
    if (!isBangla && geminiKey) {
      const genAI = new GoogleGenerativeAI(geminiKey);
      for (const modelName of GEMINI_MODELS) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
          let output = result.response.text();
          output = output.replace(/```html|```/g, "").trim();
          if (output && output.length > 10) return NextResponse.json({ text: output });
        } catch (err: any) {
          console.warn(`Gemini English fallback ${modelName} failed:`, err.message);
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
