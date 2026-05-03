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
  } catch (error) { 
    console.error("Knowledge Fetch Error:", error);
    return { productList: "", knowledgeSummary: "" }; 
  }
}

// ---- API CALLERS (Direct Fetch for Stability) ----

async function callProvider(providerName: string, url: string, apiKey: string, body: any): Promise<string> {
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
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`${providerName} API Error:`, response.status, errorData);
      return "";
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) { 
    console.error(`${providerName} Fetch Exception:`, error);
    return ""; 
  }
}

// ---- MAIN HANDLER ----


export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const { productList, knowledgeSummary } = await getSiteKnowledge();

    const systemPrompt = `You are Aurea AI, a Senior Skincare Expert at AureaBD. 
Target Language: BANGLA (বাংলা)।

✨ কথা বলার নিয়ম:
১. সালাম: সালাম শুধুমাত্র কথোপকথনের একদম শুরুতে (প্রথম মেসেজে) দিবেন। একবার কথা শুরু হয়ে গেলে আর সালাম দিবেন না।
২. প্রাকৃতিক বাংলা: একদম মানুষের মতো কথা বলুন। কোনো যান্ত্রিক ভাষা ব্যবহার করবেন না। 
৩. নো "সস্তা": "সস্তা" শব্দের বদলে "সাশ্রয়ী" বা "বাজেট ফ্রেন্ডলি" বলুন।
৪. সরাসরি উত্তর: কাস্টমার যা জানতে চেয়েছে আগে সেটির উত্তর দিন।
৫. নির্ভুল হিসাব (CRITICAL): ডেলিভারি চার্জ সহ মোট মূল্যের হিসাব করার সময় অত্যন্ত সতর্ক থাকুন। সবসময় উত্তর দেওয়ার আগে মনে মনে আবার যোগ করে দেখুন। 
   - উদাহরণ: ১১৫০ + ৭০ = ১২২০ (১৮২০ নয়)। ভুল হিসাব দিবেন না।
   - হিসাবের ফরম্যাট (অবশ্যই এটি অনুসরণ করুন):
     পণ্যের দাম: ৳[মূল্য]
     ডেলিভারি চার্জ: ৳[চার্জ]
     মোট মূল্য: ৳[যোগফল]

SKINCARE EXPERTISE:
- Shipping: Dhaka (৳70), Outside (৳130).
- Authentication: 100% Original.
- Routine: Cleanser -> Toner -> Serum -> Eye Cream -> Moisturizer -> SPF.

PRODUCTS:
${productList || "Check our shop for details."}

SITE INFO:
${knowledgeSummary.substring(0, 800)}

লক্ষ্য: আপনি গ্রাহকের একজন নির্ভরযোগ্য বন্ধু এবং বিশেষজ্ঞ। সবসময় সঠিক তথ্য এবং সঠিক হিসাব প্রদান করবেন।`;

    const groqKey = process.env.GROQ_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    // Limit history to last 10 messages for context window stability
    const contextMessages = messages.slice(-10);

    // RESILIENT PROVIDER CHAIN
    if (groqKey) {
      const res = await callProvider("Groq", "https://api.groq.com/openai/v1/chat/completions", groqKey, {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: systemPrompt }, ...contextMessages],
        temperature: 0.1
      });
      if (res) return NextResponse.json({ text: res });
    }

    if (openRouterKey) {
      // 1. Try Gemini 2.0 Flash (Free) via OpenRouter
      let res = await callProvider("OpenRouter-Gemini", "https://openrouter.ai/api/v1/chat/completions", openRouterKey, {
        model: "google/gemini-2.0-flash-exp:free",
        messages: [{ role: "system", content: systemPrompt }, ...contextMessages],
        temperature: 0.1
      });
      if (res) return NextResponse.json({ text: res });

      // 2. Fallback to Llama 3.1 8B (Free) via OpenRouter
      res = await callProvider("OpenRouter-Llama", "https://openrouter.ai/api/v1/chat/completions", openRouterKey, {
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [{ role: "system", content: systemPrompt }, ...contextMessages],
        temperature: 0.1
      });
      if (res) return NextResponse.json({ text: res });

      // 3. Fallback to Gemma 2 9B (Free) via OpenRouter
      res = await callProvider("OpenRouter-Gemma", "https://openrouter.ai/api/v1/chat/completions", openRouterKey, {
        model: "google/gemma-2-9b-it:free",
        messages: [{ role: "system", content: systemPrompt }, ...contextMessages],
        temperature: 0.1
      });
      if (res) return NextResponse.json({ text: res });
    }




    console.error("All AI Providers failed or returned empty.");
    return NextResponse.json({ text: "দুঃখিত, আমি এই মুহূর্তে কানেক্ট হতে পারছি না। দয়া করে ১ মিনিট পর আবার চেষ্টা করুন! ✨" });
  } catch (error: any) {
    console.error("Chat API Critical Error:", error);
    return NextResponse.json({ message: "System Error" }, { status: 500 });
  }
}

