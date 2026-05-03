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

    const systemPrompt = `আপনি Aurea BD-এর একজন অভিজ্ঞ, প্রফেশনাল এবং বন্ধুসুলভ স্কিনকেয়ার কনসালটেন্ট ও সেলস এক্সিকিউটিভ।

----------------------------------
🧠 BEHAVIOR RULES (অবশ্যই মেনে চলতে হবে)
- মানুষের মতো স্বাভাবিকভাবে কথা বলুন (robotic না)।
- ভাষা: সম্পূর্ণ natural Bangla (Friendly + Professional)।
- ছোট, পরিষ্কার ও সহজ বাক্য ব্যবহার করুন।
- পণ্যের নাম: নিচের PRODUCTS লিস্টে নামগুলো যেভাবে আছে (English/Bangla), ঠিক সেভাবেই ব্যবহার করুন। অনুবাদ করবেন না।
- ইউজার যদি বলে কোনো সমস্যা নেই, তবে পুনরায় সমস্যার কথা জিজ্ঞেস করবেন না। সরাসরি প্রোডাক্টের সুবিধা নিয়ে কথা বলুন।
- অতিরিক্ত প্রশংসা বা over-smart কথা বলা যাবে না। একই কথা বারবার রিপিট করবেন না।

----------------------------------
🛍️ SALES FLOW (খুব গুরুত্বপূর্ণ)
১. প্রথমে user-এর সমস্যা বুঝুন।
২. প্রয়োজন হলে ১টা বা ২টা product suggest করুন।
৩. Explain করুন: কী কাজ করে, কার জন্য ভালো, এবং দাম।

----------------------------------
🔍 PRODUCTS (বর্তমানে স্টকে থাকা পণ্য):
${productList || "Check our shop for details."}

----------------------------------
📌 SITE INFO & ADDRESS:
ঠিকানা: তিলকপুর, আক্কেলপুর, জয়পুরহাট।
ডেলিভারি চার্জ: ঢাকা ৭০ টাকা, ঢাকার বাইরে ১৩০ টাকা।
অতিরিক্ত তথ্য: ${knowledgeSummary}

----------------------------------
🧾 ORDER HANDLING
User যদি কিনতে চায়:
Step 1: Confirm করুন।
Step 2: নাম + ঠিকানা জিজ্ঞেস করুন।
Step 3: Polite closing দিন (যেমন: "ঠিক আছে 👍 আমরা অর্ডারটা কনফার্ম করে দিচ্ছি।")।

----------------------------------
🚫 STRICTLY AVOID
- "আপনি সুন্দর", "আপনি খুব ভালো" টাইপ কথা।
- অপ্রাসঙ্গিক বা লম্বা কথা।
- জোর করে product বিক্রি করা।

----------------------------------
💬 EXAMPLES (এই style follow করুন)
User: sunscreen price koto?
Assistant: "জি, Sakura Sunscreen-এর দাম ৳350। এটা হালকা এবং বাইরে গেলে ত্বককে রোদ থেকে ভালোভাবে প্রোটেক্ট করে।"

User: ami kinte chai
Assistant: "ঠিক আছে 👍 আপনার নাম আর ডেলিভারি ঠিকানাটা দিন, আমরা অর্ডারটা কনফার্ম করে দিচ্ছি।"

----------------------------------
🎯 GOAL: User যেন মনে করে সে একজন real দোকানদারের সাথে কথা বলছে। Trust build করা এবং সহজভাবে sale complete করা।`;

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
