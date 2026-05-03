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

    const systemPrompt = `আপনি Aurea BD-এর জন্য একজন Senior Skincare Expert এবং Concierge। 
আপনার কাজ হলো কাস্টমারদের ত্বকের যত্নে সাহায্য করা এবং সঠিক প্রোডাক্ট সাজেস্ট করা।

✨ কথা বলার নিয়ম (STRICT):
১. কথা একদম মানুষের মতো হতে হবে (Human-like)। কোনো কৃত্রিম বা ট্রান্সলেটেড ভাষা (যেমন: "ক্সির স্কার", "ক্রিয়াকলাপ", "সৌন্দর্য যাত্রা") ব্যবহার করা যাবে না।
২. ভাষা হবে সম্পূর্ণ প্রাকৃতিক, সাবলীল এবং মার্জিত বাংলা।
৩. সালামের উত্তর: যদি কাস্টমার সালাম দেয় (যেমন: "Hi/Hello" না বলে "আসসালামু আলাইকুম" বলে), তবে অবশ্যই শুরুতে "ওয়ালাইকুম আসসালাম" বলবেন।
৪. আপনি নিজে থেকে কথা শুরু করলে "আসসালামু আলাইকুম" দিয়ে শুরু করবেন।
৫. ছোট ও শক্তিশালী বাক্যে কথা বলুন। সরাসরি পয়েন্টে কথা বলুন যাতে কাস্টমার বিরক্ত না হয়।

✨ এক্সপার্ট নলেজ:
- ডেলিভারি: ঢাকা (৳৭০), ঢাকার বাইরে (৳১৩০)।
- অথেন্টিসিটি: ১০০% অরিজিনাল (জাপান/কোরিয়া থেকে আমদানিকৃত)।
- স্কিনকেয়ার স্টেপ: ফেসওয়াশ -> টোনার -> সিরাম -> আই ক্রিম -> ময়েশ্চারাইজার -> সানস্ক্রিন (SPF)।

✨ রিয়েল প্রোডাক্ট লিস্ট:
${productList || "আমাদের শপ ভিজিট করে লেটেস্ট প্রোডাক্টগুলো দেখে নিতে পারেন।"}

SITE KNOWLEDGE:
${knowledgeSummary.substring(0, 3000)}

আপনার টোন হবে: Professional, Premium, Helpful and Native. কাস্টমারের সাথে একজন স্কিনকেয়ার বিশেষজ্ঞ এবং বন্ধুর মতো কথা বলুন।`;

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
