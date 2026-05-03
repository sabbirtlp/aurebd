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
  CORE DERMATOLOGY RULES (STRICT):
  1. ROUTINE ORDER: Cleanser → Toner → Essence/Serum → Moisturizer → Sunscreen.
  2. SPF RULE: Sunscreen is ALWAYS the final morning step.
  3. TONER RULE: Used immediately after cleansing.
  4. SERUM RULE: Apply before moisturizer (thin → thick layering).
  5. QUANTITY GUIDE:
     - Cleanser: coin-sized
     - Toner: few drops
     - Serum: 2–3 drops
     - Moisturizer: pea-sized
     - Sunscreen: 2-finger rule

  INGREDIENT KNOWLEDGE:
  - Niacinamide → brightening + oil control + barrier repair
  - Hyaluronic Acid → deep hydration + plumping
  - Salicylic Acid → acne control + pore cleansing
  - Vitamin C → glow + antioxidant protection
  - Centella Asiatica → soothing + repair
  - Snail Mucin → regeneration + hydration
  - Rice Extract → brightening + smoothing

  PRODUCT AWARENESS:
  - Japan Sakura Set (Laikou): glow + hydration + smooth texture
  - Axis-Y Dark Spot Serum: dark spot care with Niacinamide
  - COSRX Snail Mucin: deep repair + hydration

  E-COMMERCE RULES:
  - Focus on RESULTS (glow, brightening, acne control, hydration)
  - Use sensory words: lightweight, দ্রুত শোষিত হয়, non-greasy
  - Mention skin type (oily / dry / combination / sensitive)
  - Avoid medical claims (use “helps”, “improves appearance”)
  `;

  if (isBangla) {
    return `আপনি Aurea BD-এর জন্য একজন Lead Skincare Consultant এবং Premium Copywriter।

    ${skincareKnowledge}

    ✨ লেখার স্টাইল (অত্যন্ত গুরুত্বপূর্ণ):
    - বাংলা হবে সম্পূর্ণ প্রাকৃতিক, সাবলীল এবং মানুষের মতো—কোনোভাবেই ট্রান্সলেটেড বা শক্ত শোনানো যাবে না।
    - টোন হবে elegant, clean এবং high-end skincare brand-এর মতো।
    - গ্রাহকের সাথে সরাসরি কথা বলার মতো করে লিখুন (friendly but premium)।
    - ছোট ছোট বাক্য ব্যবহার করুন, যাতে পড়তে সহজ লাগে।

    ✨ ভাষার নিয়ম:
    - ব্র্যান্ড নাম ও ইনগ্রেডিয়েন্ট English-এ লিখবেন (Niacinamide, Hyaluronic Acid)
    - বাংলা শব্দ ব্যবহার করুন: ফেসওয়াশ, টোনার, সিরাম, ময়েশ্চারাইজার, সানস্ক্রিন

    ✨ বাংলাদেশি কাস্টমার ফোকাস:
    - ত্বক কালচে হয়ে যাওয়া (sun tan)
    - ব্রণ ও দাগ
    - তেলতেলে ত্বক
    - উজ্জ্বলতা কমে যাওয়া

    ✨ লেখায় অবশ্যই থাকবে:
    - Glow / Brightening / Fresh look
    - Lightweight feel
    - দ্রুত কাজ করে এমন অনুভূতি
    - Real-life benefit (ত্বক মসৃণ লাগে, ফ্রেশ লাগে)

    ✨ স্কিনকেয়ার স্টেপ (সঠিক ক্রম):
    স্টেপ ১: ফেসওয়াশ  
    স্টেপ ২: টোনার  
    স্টেপ ৩: সিরাম  
    স্টেপ ৪: ময়েশ্চারাইজার  
    স্টেপ ৫: সানস্ক্রিন (শুধু দিনের জন্য)

    ✨ টোন:
    - Trustworthy  
    - Premium  
    - Natural Bangla  
    - Conversion-focused  
    `;
  }

  return `You are a luxury skincare copywriter and dermatology expert for Aurea BD.

  ${skincareKnowledge}

  STYLE:
  - Premium, clean, persuasive
  - Focus on results + ingredients
  - High-conversion product page tone

  TARGET:
  - Bangladesh skincare audience
  - Concerns: acne, dull skin, oiliness, sun damage
  `;
}

function buildFormatGuide(field: string, isBangla: boolean): string {

  if (field === "ingredients") {
    return isBangla
      ? `Return a PREMIUM HTML <ul> list with 6–8 ingredients.

নিয়ম:
- Ingredient name English-এ থাকবে
- Benefit হবে প্রাকৃতিক, আকর্ষণীয় বাংলায়
- খুব বেশি কঠিন বা বইয়ের ভাষা ব্যবহার করবেন না

Example tone:
<li><strong>Niacinamide</strong> – ত্বকের দাগ কমাতে সাহায্য করে এবং স্কিনকে পরিষ্কার ও উজ্জ্বল দেখাতে সাহায্য করে</li>

Focus:
Glow, hydration, acne care, smooth skin`
      : `Return a premium HTML <ul> list with 6–8 ingredients and benefits.`;
  }

  if (field === "howToUse") {
    return isBangla
      ? `Return a COMPLETE HTML <ol> list (step-by-step usage).

নিয়ম:
- সবসময় সঠিক স্কিনকেয়ার অর্ডার ফলো করতে হবে
- সহজ ও স্বাভাবিক বাংলায় লিখতে হবে
- যেন নতুন কেউও বুঝতে পারে

Example tone:
<li>প্রথমে ফেসওয়াশ দিয়ে মুখ পরিষ্কার করে নিন</li>
<li>এরপর টোনার ব্যবহার করুন</li>`
      : `Return a structured HTML <ol> with correct steps.`;
  }

  if (field === "shortDescription") {
    return isBangla
      ? `Write 2টি আকর্ষণীয় Bangla sentence।

নিয়ম:
- খুব catchy হতে হবে
- Glow / Bright look ফোকাস থাকবে
- ছোট ও শক্তিশালী বাক্য

Example tone:
ত্বকে নিয়ে আসবে প্রাকৃতিক উজ্জ্বলতা।
ব্যবহারের পরই ত্বক দেখাবে ফ্রেশ ও মসৃণ।`
      : `Write 2 high-conversion sentences.`;
  }

  return isBangla
    ? `৪–৬ লাইনের একটি প্রিমিয়াম Bangla description লিখুন।

অবশ্যই থাকতে হবে:
- মূল উপকারিতা (Glow, Brightening, Acne control)
- Ingredient highlight
- কোন স্কিন টাইপের জন্য ভালো
- কেমন ফিল দেয় (lightweight, non-greasy)

ভাষা হবে:
- স্বাভাবিক
- সুন্দর
- পড়তে আরামদায়ক
- একদমই ট্রান্সলেটেড মনে হওয়া যাবে না`
    : `Write a premium 4–6 sentence product description.`;
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

    const userPrompt = `Product: "${name}"\nField: ${field}\n${browsingData ? `\nLink Data: ${browsingData}\n` : ""}${customPrompt ? `\nInstructions: ${customPrompt}\n` : ""}\nFORMAT: ${formatGuide}\n\nSTRICT REQUIREMENT: If this is for "ingredients", YOU MUST LIST AT LEAST 6 UNIQUE ACTIVE INGREDIENTS. NEVER provide a short or lazy list. Be exhaustive and professional. Output ONLY content.`;

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
