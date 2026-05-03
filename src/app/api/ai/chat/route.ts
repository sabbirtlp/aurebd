import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import SiteContent from "@/models/SiteContent";

// ---- DATA FETCHERS ----

async function getSiteKnowledge() {
  try {
    await dbConnect();
    const products = await Product.find({ stock: { $gt: 0 } }).sort({ updatedAt: -1 }).limit(100).select('name price discountPrice isSpecialOffer slug').lean();
    const productList = products.map(p => `- ${p.name} (৳${p.discountPrice || p.price})${p.isSpecialOffer ? ' [Offer]' : ''}`).join('\n');
    const cmsData = await SiteContent.find({}).limit(100).lean();
    const knowledgeSummary = cmsData.map(item => `${item.key}: ${item.value.substring(0, 100)}`).join('\n');
    return { productList, knowledgeSummary };
  } catch { return { productList: "", knowledgeSummary: "" }; }
}

// ---- API CALLERS (Direct Fetch for Stability) ----

async function callProvider(url: string, apiKey: string, body: any): Promise<string> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${apiKey}`, 
        "Content-Type": "application/json",
        "HTTP-Referer": "https://aureabd.com",
        "X-Title": "AureaBD"
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) return "";
    const data = await response.json();
    return data.choices?.[0]?.message?.content || data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch { return ""; }
}

async function callGemini(apiKey: string, systemPrompt: string, lastMessage: string): Promise<string> {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `SYSTEM: ${systemPrompt}\n\nUSER: ${lastMessage}` }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 800 },
        safetySettings: [{ category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }]
      }),
    });
    if (!response.ok) return "";
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch { return ""; }
}

// ---- MAIN HANDLER ----

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1].content;
    const { productList, knowledgeSummary } = await getSiteKnowledge();

    const systemPrompt = `You are Aurea AI, a Senior Skincare Expert at AureaBD. 
Target Language: BANGLA (বাংলা).

STRICT RULES (বিপদজনক ভুল এড়াতে):
1. NO ROBOTIC REPETITION: Do not repeat phrases like "আমাদের ওয়েবসাইটে পণ্য আছে". 
2. NATURAL TONE: Speak like a real human skincare expert in Dhaka. 
3. NO "SASTA" (সস্তা): Never use the word "সস্তা". Use "সাশ্রয়ী" (Affordable) or "বাজেট ফ্রেন্ডলি".
4. SALAAM: Only give Salaam in the first greeting.
5. ORDERING: Select Product -> Add to Cart -> View Cart -> Checkout. Don't say "we will call you to take order".
6. GRAMMAR: Use "এসেছেন" not "আসেছেন". Use "কোনটি কিনতে চান?" not "আপনি কিনতে চান যে পণ্যটি?".

SKINCARE EXPERTISE:
- Shipping: Dhaka (৳70), Outside (৳130).
- Authentication: 100% Original Imports.
- Routine: Cleanser -> Toner -> Serum -> Eye Cream -> Moisturizer -> SPF.

PRODUCTS:
${productList || "Check our shop for details."}

SITE INFO:
${knowledgeSummary.substring(0, 800)}

TONE: Premium, Helpful, Native. Ask one question at a time.`;

    const groqKey = process.env.GROQ_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    // RESILIENT PROVIDER CHAIN (Try Groq First for Speed, then OpenRouter, then Gemini)
    if (groqKey) {
      const res = await callProvider("https://api.groq.com/openai/v1/chat/completions", groqKey, {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: lastMsg }],
        temperature: 0.3
      });
      if (res) return NextResponse.json({ text: res });
    }

    if (openRouterKey) {
      const res = await callProvider("https://openrouter.ai/api/v1/chat/completions", openRouterKey, {
        model: "google/gemini-2.0-flash-exp:free",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: lastMsg }],
        temperature: 0.3
      });
      if (res) return NextResponse.json({ text: res });
    }

    if (geminiKey) {
      const res = await callGemini(geminiKey, systemPrompt, lastMsg);
      if (res) return NextResponse.json({ text: res });
    }

    return NextResponse.json({ text: "দুঃখিত, আমি এই মুহূর্তে কানেক্ট হতে পারছি না। দয়া করে ১ মিনিট পর আবার চেষ্টা করুন! ✨" });
  } catch (error: any) {
    return NextResponse.json({ message: "System Error" }, { status: 500 });
  }
}
