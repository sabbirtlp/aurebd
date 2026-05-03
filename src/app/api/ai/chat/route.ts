import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import SiteContent from "@/models/SiteContent";

// ---- DATA FETCHERS ----

async function getSiteKnowledge() {
  try {
    await dbConnect();
    // Only fetch top 20 relevant products to keep prompt small and fast
    const products = await Product.find({ stock: { $gt: 0 } })
      .sort({ updatedAt: -1 })
      .limit(20)
      .select('name price discountPrice isSpecialOffer')
      .lean();
    
    const productList = products.map(p => `- ${p.name}: ৳${p.discountPrice || p.price}${p.isSpecialOffer ? ' [Offer]' : ''}`).join('\n');
    
    const cmsData = await SiteContent.find({}).limit(50).lean();
    const knowledgeSummary = cmsData.map(item => `${item.key}: ${item.value.substring(0, 100)}`).join('\n');
    
    return { productList, knowledgeSummary };
  } catch (error) { 
    console.error("Knowledge Fetch Error:", error);
    return { productList: "", knowledgeSummary: "" }; 
  }
}

// ---- API CALLERS (Direct Fetch with Timeout) ----

async function callProvider(providerName: string, url: string, apiKey: string, body: any): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

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
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${providerName} API Error:`, response.status, errorText.substring(0, 200));
      return "";
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error: any) { 
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error(`${providerName} Timeout after 12s`);
    } else {
      console.error(`${providerName} Fetch Exception:`, error.message);
    }
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
৫. নির্ভুল হিসাব (CRITICAL): ডেলিভারি চার্জ সহ মোট মূল্যের হিসাব করার সময় অত্যন্ত সতর্ক থাকুন। 
   - হিসাবের ফরম্যাট:
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
${knowledgeSummary.substring(0, 500)}

লক্ষ্য: গ্রাহকের নির্ভরযোগ্য বিশেষজ্ঞ বন্ধু হিসেবে সঠিক তথ্য ও সঠিক হিসাব প্রদান করুন।`;

    const groqKey = process.env.GROQ_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    // Filter messages to ensure clean format and limit history
    const contextMessages = messages
      .filter((m: any) => m.content && (m.role === 'user' || m.role === 'assistant'))
      .slice(-6);

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
      // Try Gemini 2.0 Flash (Free)
      let res = await callProvider("OpenRouter-Gemini", "https://openrouter.ai/api/v1/chat/completions", openRouterKey, {
        model: "google/gemini-2.0-flash-exp:free",
        messages: [{ role: "system", content: systemPrompt }, ...contextMessages],
        temperature: 0.1
      });
      if (res) return NextResponse.json({ text: res });

      // Fallback 1: Llama 3.1 8B (Free)
      res = await callProvider("OpenRouter-Llama", "https://openrouter.ai/api/v1/chat/completions", openRouterKey, {
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [{ role: "system", content: systemPrompt }, ...contextMessages],
        temperature: 0.1
      });
      if (res) return NextResponse.json({ text: res });

      // Fallback 2: Gemma 2 9B (Free)
      res = await callProvider("OpenRouter-Gemma", "https://openrouter.ai/api/v1/chat/completions", openRouterKey, {
        model: "google/gemma-2-9b-it:free",
        messages: [{ role: "system", content: systemPrompt }, ...contextMessages],
        temperature: 0.1
      });
      if (res) return NextResponse.json({ text: res });
    }

    console.error("All AI Providers exhausted.");
    return NextResponse.json({ text: "দুঃখিত, আমি এই মুহূর্তে কানেক্ট হতে পারছি না। দয়া করে ১ মিনিট পর আবার চেষ্টা করুন! ✨" });
  } catch (error: any) {
    console.error("Chat API Critical Error:", error);
    return NextResponse.json({ message: "System Error" }, { status: 500 });
  }
}
