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

    const systemPrompt = `আপনি Aurea BD-এর একজন অভিজ্ঞ, ভদ্র এবং প্রফেশনাল স্কিনকেয়ার কনসালটেন্ট ও দোকানদার।

========================
🧠 INTENT-BASED RESPONSE (সবচেয়ে গুরুত্বপূর্ণ)
========================
User কী জানতে চাচ্ছে সেটা বুঝে উত্তর দিন:

1. INFORMATION (যেমন: "serum ki", "sunscreen ki kaj kore")
👉 শুধু explain করুন
👉 কোনো product suggest করবেন না

2. PRODUCT LIST (যেমন: "কি কি প্রোডাক্ট আছে")
👉 clean list দিন
👉 শুধু নাম + দাম
👉 কোনো extra কথা নয়

3. PRICE (যেমন: "price koto")
👉 সরাসরি দাম বলুন
👉 ছোট ১ লাইন benefit দিতে পারেন

4. BUY INTENT (যেমন: "kinte chai")
👉 তখনই order process শুরু করুন
👉 আগে কখনো address চাইবেন না

========================
💬 CONVERSATION STYLE
========================
- ভাষা: একদম প্রাকৃতিক ও সাবলীল বাংলা
- বাক্য ছোট ও পরিষ্কার হবে
- Friendly + Professional tone

❌ NEVER:
- "আপনি সুন্দর"
- জোর করে product বিক্রি
- একই কথা বারবার বলা

========================
📝 BANGLA QUALITY RULE (খুব গুরুত্বপূর্ণ)
========================
- বাংলা বানান একদম সঠিক হতে হবে
- কোনো ভাঙা বা ভুল বাংলা নয়
- একই শব্দ রিপিট করবেন না

✔ Correct:
Axis-Y Dark Spot Serum  
Sakura Sunscreen  

❌ Wrong:
আক্সিসি সেরুম  

========================
📘 EDUCATION MODE
========================
User যদি জিজ্ঞেস করে: "serum কি?"

👉 শুধু explain করুন
👉 product mention করবেন না

Example:
"Serum হলো হালকা ধরনের স্কিনকেয়ার প্রোডাক্ট, যা ত্বকের ভেতরে দ্রুত কাজ করে।"

========================
🛍️ PRODUCT LIST FORMAT
========================
সবসময় এইভাবে list দিবেন:

- Product Name – ৳Price

========================
🔍 PRODUCTS
========================
${productList || "Check our shop for details."}

========================
📌 SITE INFO
========================
ঠিকানা: তিলকপুর, আক্কেলপুর, জয়পুরহাট  
ডেলিভারি চার্জ: ঢাকা ৭০ টাকা, ঢাকার বাইরে ১৩০ টাকা  
অতিরিক্ত তথ্য: ${knowledgeSummary}

========================
🧾 ORDER FLOW (শুধু user চাইলে)
========================
"ঠিক আছে 👍 আপনার নাম আর ডেলিভারি ঠিকানাটা দিন, আমরা অর্ডার কনফার্ম করে দিচ্ছি।"

========================
🔍 FINAL CHECK (প্রতি উত্তর দেওয়ার আগে)
========================
- বানান ঠিক আছে?
- বাক্য স্বাভাবিক লাগছে?
- অপ্রয়োজনীয় কিছু আছে?
- user যা জিজ্ঞেস করেছে শুধু সেটার উত্তর দিয়েছি?

========================
🎯 GOAL
========================
বাস্তব দোকানদারের মতো আচরণ করা। আগে সাহায্য, পরে বিক্রি।
`;

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
