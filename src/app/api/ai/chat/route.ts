import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import SiteContent from "@/models/SiteContent";

// ---- DATA FETCHERS ----

async function getSiteKnowledge() {
  try {
    await dbConnect();
    // Ultra-lean fetch for free-tier stability
    const products = await Product.find({ stock: { $gt: 0 } })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('name price discountPrice')
      .lean();
    
    const productList = products.map(p => `- ${p.name}: ৳${p.discountPrice || p.price}`).join('\n');
    
    const cmsData = await SiteContent.find({}).limit(10).lean();
    const knowledgeSummary = cmsData.map(item => `${item.key}: ${item.value.substring(0, 50)}`).join('\n');
    
    return { productList, knowledgeSummary };
  } catch (error) { 
    console.error("Knowledge Fetch Error:", error);
    return { productList: "", knowledgeSummary: "" }; 
  }
}

// ---- API CALLERS (Direct Fetch with Timeout) ----

async function callProvider(providerName: string, url: string, apiKey: string, body: any, isOpenRouter = false): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout for serverless stability

  try {
    const headers: any = { 
      "Authorization": `Bearer ${apiKey}`, 
      "Content-Type": "application/json"
    };

    if (isOpenRouter) {
      headers["HTTP-Referer"] = "https://aureabd.com";
      headers["X-Title"] = "AureaBD";
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${providerName} API Error:`, response.status, errorText.substring(0, 100));
      return "";
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error: any) { 
    clearTimeout(timeoutId);
    console.error(`${providerName} Error:`, error.message);
    return ""; 
  }
}

// ---- MAIN HANDLER ----

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const { productList, knowledgeSummary } = await getSiteKnowledge();

    const systemPrompt = `You are Aurea AI, a Senior Skincare Expert at AureaBD. 
Language: Bangla (বাংলা)।

Expert Guidelines:
১. পণ্যের নাম: নিচের PRODUCTS লিস্টে নামগুলো যেভাবে আছে (English/Bangla), ঠিক সেভাবেই ব্যবহার করুন। কোনো অনুবাদ বা উচ্চারণগত পরিবর্তন (Transliteration) করবেন না। (যেমন: "Axis-y" কে "আক্সিস-ই" লিখবেন না)।
২. ব্রণের সমস্যা: "ব্রণ" মানে Acne/Pimples। এটি মেকআপ "Bronzer" নয়।
৩. ঠিকানা: তিলকপুর, আক্কেলপুর, জয়পুরহাট। (বানান: তিলকপুর, আক্কেলপুর)।
৪. ইউজারের কথা গুরুত্ব দিন: ইউজার যদি বলে কোনো সমস্যা নেই, তবে পুনরায় স্কিন সমস্যার কথা জিজ্ঞেস করবেন না। সরাসরি প্রোডাক্টের সুবিধা নিয়ে কথা বলুন।

PRODUCTS:
${productList || "Check our shop for details."}

SITE INFO:
${knowledgeSummary}

লক্ষ্য: সঠিক তথ্য এবং ইউজারের বার্তার যথার্থ উত্তর প্রদান করা।`;

    const groqKey = process.env.GROQ_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    // Minimal history for stability
    const contextMessages = messages
      .filter((m: any) => m.content && (m.role === 'user' || m.role === 'assistant'))
      .slice(-4);

    // RESILIENT PROVIDER CHAIN
    if (groqKey) {
      // 1. Try Groq Llama 3.3 70B
      let res = await callProvider("Groq-70B", "https://api.groq.com/openai/v1/chat/completions", groqKey, {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: systemPrompt }, ...contextMessages],
        temperature: 0.1
      });
      if (res) return NextResponse.json({ text: res });

      // 2. Try Groq Llama 3.1 8B (Faster fallback)
      res = await callProvider("Groq-8B", "https://api.groq.com/openai/v1/chat/completions", groqKey, {
        model: "llama-3.1-8b-instant",
        messages: [{ role: "system", content: systemPrompt }, ...contextMessages],
        temperature: 0.1
      });
      if (res) return NextResponse.json({ text: res });
    }

    if (openRouterKey) {
      // 3. Try Gemini 2.0 Flash (Free)
      let res = await callProvider("OpenRouter-Gemini", "https://openrouter.ai/api/v1/chat/completions", openRouterKey, {
        model: "google/gemini-2.0-flash-exp:free",
        messages: [{ role: "system", content: systemPrompt }, ...contextMessages],
        temperature: 0.1
      }, true);
      if (res) return NextResponse.json({ text: res });

      // 4. Try Llama 3.1 8B (Free)
      res = await callProvider("OpenRouter-Llama", "https://openrouter.ai/api/v1/chat/completions", openRouterKey, {
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [{ role: "system", content: systemPrompt }, ...contextMessages],
        temperature: 0.1
      }, true);
      if (res) return NextResponse.json({ text: res });
    }

    console.error("All providers failed.");
    return NextResponse.json({ text: "দুঃখিত, আমি এই মুহূর্তে কানেক্ট হতে পারছি না। দয়া করে ১ মিনিট পর আবার চেষ্টা করুন! ✨" });
  } catch (error: any) {
    console.error("Critical Error:", error);
    return NextResponse.json({ message: "System Error" }, { status: 500 });
  }
}
