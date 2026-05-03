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
    "google/gemini-2.0-flash-exp:free",
    "google/gemma-2-9b-it:free",
    "meta-llama/llama-3.1-8b-instruct:free",
    "mistralai/mistral-7b-instruct:free"
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

// Note: Direct Gemini API removed — using OpenRouter's free Gemini model instead

// ---- PROMPT BUILDERS ----
function buildSystemPrompt(isBangla: boolean): string {
  const skincareKnowledge = `
  CORE DERMATOLOGY RULES (STRICT):
  1. ROUTINE ORDER: Cleanser → Toner → Essence/Serum → Eye Cream → Moisturizer → Sunscreen.
  2. SPF RULE: Sunscreen is ALWAYS the final morning step.
  3. TONER RULE: Used immediately after cleansing.
  4. SERUM RULE: Apply before heavier creams (thin → thick layering).
  5. EYE CREAM RULE: Apply gently around the eyes after serum, before moisturizer.
  6. QUANTITY GUIDE:
     - Cleanser: coin-sized
     - Toner: few drops
     - Serum: 2–3 drops
     - Eye Cream: rice-grain amount (each eye)
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

  E-COMMERCE RULES:
  - Focus on RESULTS (glow, brightening, acne control, hydration)
  - Use sensory words: lightweight, fast-absorbing, non-greasy
  - Mention skin type (oily / dry / combination / sensitive)
  - Avoid repeating same phrases
  - Each benefit must feel unique and real
  - Write like a human expert, NOT a translator
  `;

  if (isBangla) {
    return `আপনি Aurea BD-এর জন্য একজন Lead Skincare Consultant এবং Premium Copywriter।

    ${skincareKnowledge}

    ✨ লেখার স্টাইল:
    - বাংলা হবে একদম natural, সাবলীল এবং মানুষের মতো
    - কোনোভাবেই ট্রান্সলেটেড মনে হওয়া যাবে না
    - একই ধরনের বাক্য বা শব্দ বারবার ব্যবহার করা যাবে না

    ✨ টোন:
    - Premium ও elegant
    - সহজ কিন্তু professional
    - গ্রাহকের সাথে সরাসরি কথা বলার মতো

    ✨ ভাষার নিয়ম:
    - Ingredient ও brand নাম English-এ থাকবে (Niacinamide, Vitamin C)
    - বাংলা শব্দ ব্যবহার করুন: ফেসওয়াশ, টোনার, সিরাম, আই ক্রিম, ময়েশ্চারাইজার, সানস্ক্রিন

    ✨ বাংলাদেশি কাস্টমার ফোকাস:
    - রোদে ত্বক কালচে হওয়া
    - ব্রণ ও দাগ
    - তেলতেলে ত্বক
    - চোখের নিচে কালচে ভাব / ফোলা ভাব

    ✨ স্কিনকেয়ার স্টেপ:
    স্টেপ ১: ফেসওয়াশ  
    স্টেপ ২: টোনার  
    স্টেপ ৩: সিরাম  
    স্টেপ ৪: আই ক্রিম  
    স্টেপ ৫: ময়েশ্চারাইজার  
    স্টেপ ৬: সানস্ক্রিন (শুধু দিনের জন্য)

    ✨ IMPORTANT:
    - কোনো generic লাইন ব্যবহার করা যাবে না
    - প্রতিটি benefit আলাদা ভাবে explain করতে হবে
    `;
  }

  return `You are a luxury skincare copywriter and dermatology expert for Aurea BD.

  ${skincareKnowledge}

  STYLE:
  - Premium, clean, persuasive
  - Non-repetitive and human-like
  - Focus on real benefits

  TARGET:
  - Bangladesh skincare audience
  `;
}

function buildFormatGuide(field: string, isBangla: boolean): string {

  if (field === "ingredients") {
    return isBangla
      ? `Return a PREMIUM HTML <ul> list with 6–8 ingredients.

নিয়ম:
- Ingredient name English-এ থাকবে
- Benefit হবে natural Bangla-তে
- প্রতিটি লাইনে আলাদা benefit থাকবে
- কোনো repetition থাকবে না

Example tone:
<li><strong>Hyaluronic Acid</strong> – ত্বকের গভীরে আর্দ্রতা ধরে রেখে স্কিনকে নরম ও ভরাট দেখাতে সাহায্য করে</li>`
      : `Return a premium HTML <ul> list with 6–8 ingredients.`;
  }

  if (field === "howToUse") {
    return isBangla
      ? `Return a COMPLETE HTML <ol> list (step-by-step routine).

নিয়ম:
- সঠিক skincare order follow করতে হবে
- Eye Cream অবশ্যই include করতে হবে (Serum-এর পরে)
- সহজ ও natural Bangla ব্যবহার করতে হবে

Example tone:
<li>প্রথমে ফেসওয়াশ দিয়ে মুখ পরিষ্কার করুন</li>
<li>এরপর টোনার ব্যবহার করুন</li>
<li>তারপর সিরাম লাগান</li>
<li>চোখের চারপাশে হালকাভাবে আই ক্রিম ব্যবহার করুন</li>
<li>ময়েশ্চারাইজার দিয়ে স্কিন লক করুন</li>
<li>দিনে হলে সানস্ক্রিন দিয়ে শেষ করুন</li>`
      : `Return structured HTML <ol> with correct routine including eye cream.`;
  }

  if (field === "shortDescription") {
    return isBangla
      ? `Write 2টি আকর্ষণীয় Bangla sentence।

নিয়ম:
- ছোট, catchy এবং powerful হতে হবে
- Glow / fresh look focus থাকবে

Example:
ত্বককে দেখাবে ফ্রেশ ও উজ্জ্বল।
ব্যবহারের পরই পাবেন নরম ও স্মুথ ফিল।`
      : `Write 2 high-conversion sentences.`;
  }

  return isBangla
    ? `৪–৬ লাইনের একটি premium Bangla description লিখুন।

অবশ্যই থাকতে হবে:
- Glow / Brightening / Hydration
- Key ingredient mention
- Skin type suitability
- Lightweight feel

ভাষা:
- Natural
- Smooth
- Human-like`
    : `Write a premium 4–6 sentence description.`;
}
// ---- MAIN HANDLER ----

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const groqKey = process.env.GROQ_API_KEY;
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
        { name: 'openrouter', key: openRouterKey, call: () => callOpenRouter(openRouterKey!, systemPrompt, userPrompt) },
        { name: 'groq', key: groqKey, call: () => callGroq(groqKey!, systemPrompt, userPrompt) }
      ]
      : [
        { name: 'groq', key: groqKey, call: () => callGroq(groqKey!, systemPrompt, userPrompt) },
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
