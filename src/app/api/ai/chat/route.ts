import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import SiteContent from "@/models/SiteContent";

// ---- DATA FETCHERS ----

async function getSiteKnowledge() {
  try {
    await dbConnect();
    
    // 1. Get Top Products
    const products = await Product.find({ stock: { $gt: 0 } })
      .sort({ updatedAt: -1 })
      .limit(30)
      .select('name price category slug')
      .lean();
    
    const productList = products.map(p => `- ${p.name} (৳${p.price}) -> /product/${p.slug}`).join('\n');

    // 2. Get CMS Data
    const cmsData = await SiteContent.find({}).limit(100).lean();
    const siteKnowledge = cmsData.reduce((acc: any, item: any) => {
      if (!acc[item.page]) acc[item.page] = [];
      const val = item.value.length > 150 ? item.value.substring(0, 150) + '...' : item.value;
      acc[item.page].push(`${item.key}: ${val}`);
      return acc;
    }, {});

    const knowledgeSummary = Object.entries(siteKnowledge).map(([page, lines]: [string, any]) => {
      return `PAGE ${page.toUpperCase()}:\n${lines.join('\n')}`;
    }).join('\n\n');

    return { productList, knowledgeSummary };
  } catch (err) {
    console.error("Knowledge fetch error:", err);
    return { productList: "", knowledgeSummary: "" };
  }
}

// ---- API CALLERS ----

async function callGroq(apiKey: string, systemPrompt: string, messages: any[]): Promise<string> {
  const models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "llama3-8b-8192"];
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
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });
      if (response.status === 429) continue;
      if (!response.ok) continue;
      const data = await response.json();
      return data.choices?.[0]?.message?.content || "";
    } catch { continue; }
  }
  return "";
}

async function callOpenRouter(apiKey: string, systemPrompt: string, messages: any[]): Promise<string> {
  const models = ["google/gemma-2-9b-it:free", "meta-llama/llama-3.1-8b-instruct:free", "openrouter/auto-free"];
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
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          temperature: 0.7,
        }),
      });
      if (!response.ok) continue;
      const data = await response.json();
      return data.choices?.[0]?.message?.content || data.choices?.[0]?.text || "";
    } catch { continue; }
  }
  return "";
}

async function callGemini(apiKey: string, systemPrompt: string, messages: any[]): Promise<string> {
  const models = ["gemini-2.0-flash", "gemini-1.5-flash-latest"];
  const lastMessage = messages[messages.length - 1].content;
  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `SYSTEM_INSTRUCTIONS: ${systemPrompt}\n\nUSER_MESSAGE: ${lastMessage}` }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
          }),
        }
      );
      if (!response.ok) continue;
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch { continue; }
  }
  return "";
}

// ---- MAIN HANDLER ----

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    const { productList, knowledgeSummary } = await getSiteKnowledge();

    const systemPrompt = `You are Aurea AI, the senior luxury skincare concierge for AureaBD. 
Primary Language: BANGLA (বাংলা).

STRICT BANGLA RULES:
- NEVER use computer-translated words like "ক্রিয়াকলাপ" (activities).
- Use natural terms: "রুটিন" (routine), "যত্ন" (care), "টিপস" (tips).
- The language must be fluent, natural, and warm—like a professional beauty consultant in Dhaka.

RELIGIOUS ETIQUETTE & GREETINGS:
- ALWAYS start with "আসসালামু আলাইকুম" (Assalamu Alaikum) for the first message.
- If user says "Assalamu Alaikum", respond with "ওয়ালাইকুম আসসালাম" (Walaikum Assalam) immediately.

SKINCARE EXPERTISE:
- SHIPPING: Dhaka (৳70), Outside (৳130).
- AUTHENTICITY: 100% Authentic, J-Beauty/K-Beauty imports.
- ROUTINE: ফেসওয়াশ -> টোনার -> সিরাম -> ময়েশ্চারাইজার -> সানস্ক্রিন (SPF).
- BRAND: Aurea BD focus on "Sakura" (Cherry Blossom) for natural glowing skin.

SITEMAP:
- Home: / | Shop: /shop | About: /about

REAL PRODUCTS AVAILABLE:
${productList || "Visit our shop to see our full collection."}

SITE KNOWLEDGE:
${knowledgeSummary.substring(0, 3000)}

TONE: Premium, trustworthy, and native. Speak to the customer like a friend and skincare expert.`;

    const providers = [
      { name: 'groq', key: groqKey, call: () => callGroq(groqKey!, systemPrompt, messages) },
      { name: 'openrouter', key: openRouterKey, call: () => callOpenRouter(openRouterKey!, systemPrompt, messages) },
      { name: 'gemini', key: geminiKey, call: () => callGemini(geminiKey!, systemPrompt, messages) }
    ];

    for (const provider of providers) {
      if (provider.key) {
        try {
          const text = await provider.call();
          if (text && text.length > 2) {
            return NextResponse.json({ text });
          }
        } catch (err) {
          console.warn(`Provider ${provider.name} failed`);
        }
      }
    }

    return NextResponse.json({ text: "I apologize, our connection is currently being updated to serve you better. Please try again in a few moments! ✨" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
