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

      if (response.status === 429) continue;
      if (!response.ok) throw new Error(`Groq ${response.status}`);

      const data = await response.json();
      return data.choices?.[0]?.message?.content || "";
    } catch (err: any) {
      lastErr = err;
      continue;
    }
  }
  throw lastErr || new Error("Groq failed");
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

      if (!response.ok) continue;

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || "";
      if (text && text.trim().length > 10) return text.trim();
    } catch {
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
  const skincareKnowledge = `
    CORE SKINCARE RULES (NEVER VIOLATE):
    1. ROUTINE ORDER: Cleanser -> Toner -> Essence/Serum -> Moisturizer -> Sunscreen (SPF).
    2. SPF RULE: Sunscreen is ALWAYS the final step of a morning routine. Never apply it first.
    3. TONER RULE: Toner is used immediately after washing the face to prep skin.
    4. SERUM RULE: Serums are applied before moisturizers.
    5. QUANTITY: Serum (2-3 drops), Moisturizer (pea-sized), Sunscreen (generous amount).

    POPULAR PRODUCT KNOWLEDGE BASE:
    - Japan Sakura Skincare Set (Laikou): Contains Cherry Blossom Extract (antioxidant), Niacinamide (brightening), Rice Water (smoothing), and Hyaluronic Acid (hydration).
    - Axis-Y Dark Spot Serum: Contains 5% Niacinamide and Squalane.
    - COSRX Snail Mucin: Focuses on skin repair and deep hydration.
    - Rice Skincare: Focuses on enzyme-based brightening and smoothing.
  `;

  if (isBangla) {
    return `You are a Lead Dermatological Consultant & Copywriter for Aurea BD. 
    ${skincareKnowledge}

    WRITING STYLE:
    - You have "Web Research" capabilities. Even without a link, use your training data to provide ACTUAL facts for famous products like "Japan Sakura Set".
    - Write professional, natural Bangla for high-end skincare customers.
    - Keep brand names and ingredients in English characters (e.g., Axis-y, Niacinamide).
    - Use natural terms: সিরাম, টোনার, ময়েশ্চারাইজার, সানস্ক্রিন, ফেসওয়াশ।
    
    SKINCARE ROUTINE STEPS (BANGLA):
    - স্টেপ ১: ফেসওয়াশ (ত্বক পরিষ্কার করুন)
    - স্টেপ ২: টোনার (ত্বক প্রস্তুত করুন)
    - স্টেপ ৩: সিরাম (ত্বকের পুষ্টি যোগান)
    - স্টেপ ৪: ময়েশ্চারাইজার (আর্দ্রতা ধরে রাখুন)
    - স্টেপ ৫: সানস্ক্রিন (ত্বক রক্ষা করুন - শুধুমাত্র দিনে)
    
    - TONE: Professional, trustworthy, and native.`;
  }

  return `You are a professional luxury skincare copywriter and dermatological expert for Aurea BD. 
  ${skincareKnowledge}
  You have "Web Research" capabilities. Even without a link, use your training data to provide ACTUAL facts for famous products like "Japan Sakura Set".
  Ensure routines follow the thin-to-thick principle. SPF is always the final daytime step.`;
}

function buildFormatGuide(field: string, isBangla: boolean): string {
  if (field === "ingredients") {
    return isBangla
      ? `Return a COMPREHENSIVE HTML <ul> list (5-8 key items). 
         Ingredient names in English, benefits in professional, catchy Bangla.
         STYLE EXAMPLE: 
         <li><strong>Cherry Blossom Extract</strong> — অক্সিজেন নিরোধক এবং ত্বকের শোষণ ক্ষমতা বৃদ্ধি করে</li>
         <li><strong>Niacinamide</strong> — ত্বকের দাগ কমায় ও উজ্জ্বলতা বাড়ায়</li>`
      : `Return a COMPREHENSIVE HTML <ul> list of 5-8 key active ingredients with their specific skin benefits.`;
  }
  if (field === "howToUse") {
    return isBangla
      ? `Return a detailed HTML <ol> list of the CORRECT skincare steps. 
         For SETS (e.g. 5pcs set), list the order for ALL items in the set.
         Example: <ol><li>প্রথমে ফেসওয়াশ দিয়ে মুখ পরিষ্কার করে নিন।</li><li>এরপর টোনার ব্যবহার করুন...</li></ol>`
      : `Return a detailed HTML <ol> list of correct usage steps. For sets, include the sequence for all products.`;
  }
  if (field === "shortDescription") {
    return "Return 2 punchy, high-conversion marketing sentences.";
  }
  return "Return a compelling, luxurious 4-6 sentence detailed description focusing on results and science.";
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

    const { name, category, field, customPrompt, language } = await req.json();
    
    let browsingData = "";
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const foundUrls = customPrompt?.match(urlRegex);
    if (foundUrls && foundUrls.length > 0) {
      browsingData = await fetchUrlContent(foundUrls[0]);
    }

    const isBangla = language === "bn";
    const systemPrompt = buildSystemPrompt(isBangla);
    const formatGuide = buildFormatGuide(field, isBangla);

    const userPrompt = `Product: "${name}"\nField: ${field}\n${browsingData ? `\nLink Data: ${browsingData}\n` : ""}${customPrompt ? `\nInstructions: ${customPrompt}\n` : ""}\nFORMAT: ${formatGuide}\nOutput ONLY content.`;

    const errors: string[] = [];
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
            if (result.length > 5) return NextResponse.json({ text: result });
          }
        } catch (err: any) {
          errors.push(`${provider.name}: ${err.message}`);
        }
      }
    }

    return NextResponse.json({ message: `AI failed. ${errors.join(" | ")}` }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
