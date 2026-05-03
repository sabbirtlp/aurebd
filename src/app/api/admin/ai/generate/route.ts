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
      },
    });
    
    if (!response.ok) return "";
    
    const html = await response.text();
    const parts: string[] = [];

    // 1. Extract JSON-LD structured data
    const jsonLdMatches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
    if (jsonLdMatches) {
      for (const match of jsonLdMatches) {
        const jsonStr = match.replace(/<script[^>]*>|<\/script>/gi, "").trim();
        try {
          const data = JSON.parse(jsonStr);
          if (data.name || data.description || data.ingredients) {
            parts.push(`PRODUCT DATA: ${JSON.stringify(data, null, 0).substring(0, 2000)}`);
          }
        } catch { /* skip */ }
      }
    }

    // 2. Extract meta tags
    const metaDesc = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
    if (metaDesc) parts.push(`META: ${metaDesc[1]}`);
    
    const ogDesc = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i);
    if (ogDesc) parts.push(`OG: ${ogDesc[1]}`);

    const title = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (title) parts.push(`TITLE: ${title[1]}`);

    // 3. Clean body text
    let bodyText = html;
    bodyText = bodyText.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    bodyText = bodyText.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
    bodyText = bodyText.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, "");
    bodyText = bodyText.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, "");
    bodyText = bodyText.replace(/<[^>]+>/g, " ");
    bodyText = bodyText.replace(/&nbsp;|&amp;|&lt;|&gt;/g, " ");
    bodyText = bodyText.replace(/\s+/g, " ").trim();
    
    if (bodyText.length > 100) {
      parts.push(`CONTENT: ${bodyText.substring(0, 3000)}`);
    }
    
    return parts.join("\n") || "";
  } catch (err) {
    console.error("URL Fetch error:", err);
    return "";
  }
}

// ---- API CALLERS ----

// Direct Groq API call
async function callGroq(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "llama3-8b-8192"];
  let lastErr = null;

  for (const model of models) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.4,
          max_tokens: 1500,
        }),
      });

      if (response.status === 429) {
        console.warn(`Groq ${model} rate limited, trying next...`);
        continue;
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq ${model} ${response.status}: ${errText.substring(0, 100)}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || "";
    } catch (err: any) {
      lastErr = err;
      console.warn(`Groq ${model} failed:`, err.message);
      continue;
    }
  }
  throw lastErr || new Error("All Groq models failed");
}

// Direct OpenRouter API call
async function callOpenRouter(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const models = [
    "google/gemma-2-9b-it:free",
    "meta-llama/llama-3.1-8b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
    "openrouter/auto-free"
  ];

  for (const model of models) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://aureabd.vercel.app",
          "X-Title": "Aurea BD",
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.4,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.warn(`OpenRouter ${model} failed: ${response.status} - ${err.substring(0, 50)}`);
        continue;
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || "";
      if (text && text.trim().length > 10) return text.trim();
    } catch (err: any) {
      console.warn(`OpenRouter ${model} error:`, err.message);
      continue;
    }
  }
  return "";
}

// Direct Gemini API call
async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const models = ["gemini-2.0-flash", "gemini-1.5-flash-latest"];
  
  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 1500 },
          }),
        }
      );

      if (!response.ok) continue;

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch {
      continue;
    }
  }
  return "";
}

// ---- PROMPT BUILDERS ----

function buildSystemPrompt(isBangla: boolean): string {
  if (isBangla) {
    return `You are a professional Bangladeshi beauty copywriter for Aurea BD — a premium Japanese & Korean skincare brand in Bangladesh.

WRITING STYLE:
- Write fluent, natural Bangla as spoken by educated urban Bangladeshi women.
- Warm, trustworthy, and premium tone — like a popular beauty influencer.
- NEVER translate literally from English. Write original Bangla.

VOCABULARY:
- Brand names stay in English: "Axis-y", "Laikou", "COSRX"
- Ingredient names stay in English: "Niacinamide", "Vitamin C", "Hyaluronic Acid"  
- Product types: সিরাম, টোনার, ময়েশ্চারাইজার, সানস্ক্রিন, ক্রিম, ফেসওয়াশ
- Use: "ব্যবহার করুন", "মুখে লাগান", "ত্বকে দিন", "মালিশ করুন"
- NEVER use: "প্রয়োগ করুন", "মুখমণ্ডল", "স্ফীত করুন"

EXAMPLE GOOD BANGLA:
- "পরিষ্কার মুখে ২-৩ ফোঁটা সিরাম নিয়ে আলতোভাবে মালিশ করুন"
- "এই সিরাম ত্বকের কালো দাগ হালকা করে এবং উজ্জ্বলতা বাড়ায়"
- "প্রতিদিন সকালে ও রাতে ব্যবহার করুন সেরা ফলাফলের জন্য"`;
  }

  return `You are a professional luxury skincare copywriter for Aurea BD — a premium Japanese & Korean skincare brand. Write elegant, persuasive English. Focus on radiance, hydration, and real benefits. Never invent ingredients.`;
}

function buildFormatGuide(field: string, isBangla: boolean): string {
  if (field === "ingredients") {
    return isBangla
      ? `Return ONLY an HTML <ul> list. Ingredient names in English, benefits in Bangla.
Example: <ul><li><strong>Niacinamide</strong> — ত্বকের দাগ কমায় ও উজ্জ্বলতা বাড়ায়</li></ul>`
      : `Return ONLY an HTML <ul> list of key ingredients with benefits.
Example: <ul><li><strong>Niacinamide</strong> — Reduces dark spots and enhances radiance</li></ul>`;
  }
  if (field === "howToUse") {
    return isBangla
      ? `Return ONLY an HTML <ol> list in natural Bangla.
Example: <ol><li>পরিষ্কার মুখে ২-৩ ফোঁটা সিরাম নিন</li><li>আলতোভাবে ত্বকে মালিশ করুন</li></ol>`
      : `Return ONLY an HTML <ol> list of usage steps.`;
  }
  if (field === "shortDescription") {
    return "Return ONLY 1-2 catchy marketing sentences.";
  }
  return "Return a compelling 3-5 sentence marketing paragraph.";
}

// ---- MAIN HANDLER ----

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    if (!groqKey && !geminiKey && !openRouterKey) {
      return NextResponse.json({ 
        message: "No AI API Key configured. Add GROQ_API_KEY, OPENROUTER_API_KEY, or GEMINI_API_KEY to environment." 
      }, { status: 500 });
    }

    const { name, category, field, customPrompt, language } = await req.json();
    
    // Extract URL content if present
    let browsingData = "";
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const foundUrls = customPrompt?.match(urlRegex);
    if (foundUrls && foundUrls.length > 0) {
      browsingData = await fetchUrlContent(foundUrls[0]);
    }

    const isBangla = language === "bn";
    const systemPrompt = buildSystemPrompt(isBangla);
    const formatGuide = buildFormatGuide(field, isBangla);

    const userPrompt = `Product: "${name}"
Category: ${category || "Skincare"}
Field: ${field}
${browsingData ? `\nREFERENCE DATA FROM PRODUCT LINK:\n${browsingData}\n\nUse the real product info from the link above.` : ""}
${customPrompt ? `\nInstructions: ${customPrompt}` : ""}

FORMAT: ${formatGuide}

Output ONLY the final content. No explanations, no code fences, no "Here is..." prefix.`;

    const errors: string[] = [];

    // Define priority based on language
    const providers = isBangla 
      ? [
          { name: 'gemini', key: geminiKey, call: () => callGemini(geminiKey!, `${systemPrompt}\n\n${userPrompt}`) },
          { name: 'openrouter', key: openRouterKey, call: () => callOpenRouter(openRouterKey!, systemPrompt, userPrompt) },
          { name: 'groq', key: groqKey, call: () => callGroq(groqKey!, systemPrompt, userPrompt) }
        ]
      : [
          { name: 'groq', key: groqKey, call: () => callGroq(groqKey!, systemPrompt, userPrompt) },
          { name: 'gemini', key: geminiKey, call: () => callGemini(geminiKey!, `${systemPrompt}\n\n${userPrompt}`) },
          { name: 'openrouter', key: openRouterKey, call: () => callOpenRouter(openRouterKey!, systemPrompt, userPrompt) }
        ];

    for (const provider of providers) {
      if (provider.key) {
        try {
          let result = await provider.call();
          if (result) {
            result = result.replace(/```html|```/g, "").trim();
            if (result.length > 5) {
              return NextResponse.json({ text: result });
            }
          }
          errors.push(`${provider.name} returned empty`);
        } catch (err: any) {
          errors.push(`${provider.name}: ${err.message}`);
          console.error(`${provider.name} failed:`, err.message);
        }
      }
    }

    return NextResponse.json({ 
      message: `AI generation failed. ${errors.join(" | ")}` 
    }, { status: 500 });

  } catch (error: any) {
    console.error("API Error:", error.message);
    return NextResponse.json({ message: error.message || "Failed to generate content" }, { status: 500 });
  }
}
