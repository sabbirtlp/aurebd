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
      .limit(100)
      .select('name price discountPrice isSpecialOffer category slug')
      .lean();
    
    const productList = products.map(p => {
      const priceText = p.discountPrice ? `৳${p.discountPrice} (Original: ৳${p.price})` : `৳${p.price}`;
      const offerText = p.isSpecialOffer ? " [SPECIAL OFFER!]" : "";
      return `- ${p.name} (${priceText})${offerText} -> /product/${p.slug}`;
    }).join('\n');

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
  const models = [
    "llama-3.3-70b-versatile", 
    "llama-3.1-70b-versatile", 
    "llama-3.1-8b-instant", 
    "mixtral-8x7b-32768",
    "llama3-70b-8192",
    "llama3-8b-8192"
  ];
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
          temperature: 0.4,
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
  const models = [
    "google/gemma-2-9b-it:free", 
    "meta-llama/llama-3.1-8b-instruct:free", 
    "mistralai/mistral-7b-instruct:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "microsoft/phi-3-mini-128k-instruct:free",
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
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          temperature: 0.4,
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
  const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-latest"];
  const lastMessage = messages[messages.length - 1].content;
  
  for (const model of models) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: `SYSTEM_INSTRUCTIONS: ${systemPrompt}\n\nUSER_MESSAGE: ${lastMessage}` }] }],
            generationConfig: { 
              temperature: 0.4, 
              maxOutputTokens: 1024,
              topP: 0.95,
              topK: 40
            },
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
            ]
          }),
        }
      );
      clearTimeout(timeout);
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
    const errors: string[] = [];
    const { productList, knowledgeSummary } = await getSiteKnowledge();

    const systemPrompt = `আপনি Aurea BD-এর একজন Senior Skincare Expert এবং Consultant। আপনার কথা বলার ধরন হতে হবে অত্যন্ত মার্জিত, বুদ্ধিদীপ্ত এবং মানুষের মতো।

✨ আপনার লক্ষ্য (Objectives):
১. বিশেষজ্ঞের মতো পরামর্শ দিন: গ্রাহকের স্কিন টাইপ (Oily, Dry, Sensitive) এবং সমস্যা (ব্রণ, দাগ, সান-ট্যান) বুঝে গভীর সমাধান দিন। 
২. মার্জিত ভাষা: "সস্তা" এর বদলে "সাশ্রয়ী", "খারাপ হয়ে গেছে" এর বদলে "ত্বকে কোনো সমস্যা হচ্ছে কি না" — এভাবে কথা বলুন।
৩. অর্ডার প্রসেস: কেউ অর্ডার করতে চাইলে বুঝিয়ে বলুন: "আপনার পছন্দের পণ্যটি কার্টে (Cart) যোগ করুন এবং চেকআউট (Checkout) পেজে গিয়ে আপনার নাম-ঠিকানা দিন। আমরা আপনাকে ফোন করে অর্ডার কনফার্ম করব।"

✨ কথা বলার নিয়ম (STRICT):
১. blunt বা রুক্ষ হবেন না। গ্রাহকের সাথে বন্ধুর মতো কথা বলুন।
২. রিপিটিভ ডায়ালগ এড়িয়ে চলুন। প্রতিবার ইউনিক ভাবে কথা বলুন।
৩. এক মেসেজে অনেক তথ্য দিবেন না। ধাপে ধাপে কথা বলুন।
৪. বাংলা ব্যাকরণ: "আসেছেন" নয়, "এসেছেন" বলুন। 

✨ এক্সপার্ট নলেজ:
- ডেলিভারি: ঢাকা (৳৭০), ঢাকার বাইরে (৳১৩০)।
- অথেন্টিসিটি: ১০০% অরিজিনাল জাপান ও কোরিয়ান প্রোডাক্ট।
- পেমেন্ট: ক্যাশ অন ডেলিভারি (Cash on Delivery) সুবিধা আছে।

✨ প্রোডাক্ট লিস্ট:
${productList || "আমাদের প্রিমিয়াম সাকুরা কালেকশন এবং সিরামগুলো দেখতে পারেন।"}

SITE KNOWLEDGE (Top Priority):
${knowledgeSummary.substring(0, 800)}

লক্ষ্য: আপনি একজন উচ্চপদস্থ স্কিনকেয়ার স্পেশালিস্ট। আপনার প্রতিটি উত্তর যেন গ্রাহকের মনে বিশ্বাস তৈরি করে।`;

    const providers = [
      { name: 'gemini', key: geminiKey, call: () => callGemini(geminiKey!, systemPrompt, messages) },
      { name: 'openrouter', key: openRouterKey, call: () => callOpenRouter(openRouterKey!, systemPrompt, messages) },
      { name: 'groq', key: groqKey, call: () => callGroq(groqKey!, systemPrompt, messages) }
    ];

    for (const provider of providers) {
      if (provider.key) {
        try {
          const text = await provider.call();
          if (text && text.length > 2) {
            // Final check to prevent obvious robotic/broken Bangla
            if (text.includes("আমার আপনার জন্য") || text.includes("কি আপনার ত্বকের সাথে ভালো") || text.includes("কোয়ালেশন")) {
              continue; 
            }
            return NextResponse.json({ text });
          }
        } catch (err: any) {
          console.error(`Chat Provider ${provider.name} failed:`, err.message);
          errors.push(`${provider.name}: ${err.message}`);
        }
      }
    }

    console.error("All Chat Providers Failed:", errors);
    return NextResponse.json({ text: "দুঃখিত, আমাদের সার্ভার এখন কিছুটা ব্যস্ত। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন! আমরা আপনার সেবা দিতে সবসময় প্রস্তুত। ✨" });
  } catch (error: any) {
    console.error("Global Chat Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
