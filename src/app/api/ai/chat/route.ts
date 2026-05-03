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
  const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-latest"];
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
            generationConfig: { 
              temperature: 0.7, 
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
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Gemini (${model}) error:`, JSON.stringify(errorData));
        continue;
      }
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (err: any) { 
      console.error(`Gemini (${model}) fetch failed:`, err.message);
      continue; 
    }
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

    const systemPrompt = `আপনি Aurea BD-এর একজন Premium Skincare Consultant। 

✨ কথা বলার নিয়ম (STRICT):
১. প্রাকৃতিক বাংলা: কথা একদম মানুষের মতো হতে হবে। 
২. BANNED PHRASES (কখনো বলবেন না):
   - "আমার আপনার জন্য" (ভুল ব্যাকরণ)
   - "কি আপনার ত্বকের সাথে ভালো হওয়ার বিষয়ে" (ভুল)
   - "আমাদের সুনাম আছে" (অপ্রাসঙ্গিক)
   - "আপনার ত্বক কীভাবে আছে" (যান্ত্রিক)
৩. রিপিটেশন বন্ধ: একই প্রশ্ন বা কথা বারবার বলবেন না। একটি মেসেজে কেবল একবারই প্রশ্ন করুন। 
৪. কনসালটেশন: গ্রাহকের ত্বকের সমস্যার কথা শুনুন এবং সেই অনুযায়ী ১-২টি সেরা সাজেশান দিন।
৫. সালাম: সালাম শুধুমাত্র শুরুতে একবার দিবেন।

✨ এক্সপার্ট নলেজ:
- ডেলিভারি: ঢাকা (৳৭০), ঢাকার বাইরে (৳১৩০)।
- প্রোডাক্ট: ১০০% অথেনটিক কোরিয়ান ও জাপানি স্কিনকেয়ার।
- রুটিন: ফেসওয়াশ -> টোনার -> সিরাম -> আই ক্রিম -> ময়েশ্চারাইজার -> সানস্ক্রিন।

✨ প্রোডাক্ট ইনফরমেশন:
${productList || "আমাদের শপে বিভিন্ন ক্যাটাগরির প্রিমিয়াম প্রোডাক্ট রয়েছে।"}

SITE KNOWLEDGE:
${knowledgeSummary.substring(0, 1500)}

লক্ষ্য: আপনি একজন বিশেষজ্ঞের মতো গ্রাহকের ত্বকের সমস্যার সমাধান দিবেন, কোনো রোবটের মতো তথ্য দিবেন না।`;

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
            if (text.includes("আমার আপনার জন্য") || text.includes("কি আপনার ত্বকের সাথে ভালো")) {
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
