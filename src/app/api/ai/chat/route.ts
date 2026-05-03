import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import SiteContent from "@/models/SiteContent";

// --------------------
// DATA FETCHERS
// --------------------

async function getSiteKnowledge() {
  try {
    await dbConnect();

    const products = await Product.find({ stock: { $gt: 0 } })
      .sort({ updatedAt: -1 })
      .limit(8)
      .select("name price discountPrice")
      .lean();

    const productList = products
      .map((p) => `- ${p.name}: ৳${p.discountPrice || p.price}`)
      .join("\n");

    const cmsData = await SiteContent.find({}).limit(5).lean();

    const knowledgeSummary = cmsData
      .map((item) => `${item.key}: ${item.value.substring(0, 60)}`)
      .join("\n");

    return { productList, knowledgeSummary };
  } catch (error) {
    console.error("Knowledge Fetch Error:", error);
    return { productList: "", knowledgeSummary: "" };
  }
}

// --------------------
// WEB SEARCH
// --------------------

async function searchWeb(query: string): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return "";

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "basic",
        max_results: 3,
      }),
    });

    if (!response.ok) return "";

    const data = await response.json();

    return data.results
      .map((r: any) => `• ${r.title}: ${r.content}`)
      .join("\n");
  } catch (error) {
    return "";
  }
}

// --------------------
// WEB DECISION ENGINE
// --------------------

function shouldUseWeb(query: string) {
  const q = query.toLowerCase();

  const triggers = [
    "what is",
    "best",
    "compare",
    "review",
    "how to",
    "meaning",
    "why",
  ];

  const isProductIntent =
    q.includes("price") ||
    q.includes("kinte") ||
    q.includes("buy") ||
    q.includes("product");

  return triggers.some((t) => q.includes(t)) && !isProductIntent;
}

// --------------------
// PROVIDER CALL FUNCTION
// --------------------

async function callProvider(url: string, apiKey: string, body: any) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    if (!res.ok) return "";

    const data = await res.json();
    return (
      data.choices?.[0]?.message?.content ||
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      ""
    );
  } catch (error) {
    clearTimeout(timeoutId);
    return "";
  }
}

// --------------------
// MAIN HANDLER
// --------------------

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const { productList, knowledgeSummary } = await getSiteKnowledge();

    const lastUserMsg =
      messages.filter((m: any) => m.role === "user").pop()?.content || "";

    // --------------------
    // WEB ONLY FOR KNOWLEDGE
    // --------------------
    let webResults = "";

    if (shouldUseWeb(lastUserMsg)) {
      webResults = await searchWeb(lastUserMsg);
    }

    // --------------------
    // SYSTEM PROMPT (FIXED SAFETY)
    // --------------------
    const systemPrompt = `
আপনি Aurea BD-এর একজন অভিজ্ঞ, ভদ্র এবং প্রফেশনাল স্কিনকেয়ার কনসালটেন্ট ও দোকানদার।

========================
🧠 INTENT RULE
========================
1. INFORMATION → শুধু explain
2. PRODUCT LIST → শুধুই DB product দেখাবেন
3. BUY INTENT → order flow শুরু
4. LANGUAGE → natural Bangla

========================
⚠️ CRITICAL RULES
========================
- Product এবং Web কখনো mix করবেন না
- Product recommendation শুধু DATABASE থেকে হবে
- Web data শুধুমাত্র knowledge প্রশ্নে ব্যবহার করবেন
- কোনো fake product বানাবেন না
- hallucination strict forbidden

========================
❤️ EMPATHY & TONE (খুব গুরুত্বপূর্ণ)
========================
- ইউজারের স্কিন প্রবলেম (যেমন ব্রণ) শুনে কখনো "খুশি" বা "Happy" হবেন না। এটি অপেশাদার।
- সহানুভূতি দেখান। যেমন: "জি, বুঝতে পারছি। ব্রণের সমস্যা নিয়ে চিন্তার কিছু নেই, সঠিক যত্নে এটি কমে যায়।"
- সবসময় কাস্টমারের প্রতি বিনয়ী ও সহায়ক থাকুন।

========================
📝 LANGUAGE & PRODUCT NAMES
========================
- English product name সবসময় English-এই লিখবেন (যেমন: Axis-Y Serum, Sakura Skincare Set)। কোনোভাবেই বাংলা উচ্চারণ লিখবেন না।
- সঠিক বাংলা এবং মার্জিত শব্দ ব্যবহার করুন। "সস্তা" না বলে "সাশ্রয়ী" বলুন।

========================
🔍 DATABASE PRODUCTS
========================
${productList || "No products available"}

========================
🌐 WEB KNOWLEDGE (ONLY EDUCATION)
========================
${webResults || "No external info needed"}

========================
📌 SITE INFO
========================
ঠিকানা: তিলকপুর, আক্কেলপুর, জয়পুরহাট  
ডেলিভারি: ঢাকা ৭০ টাকা, ঢাকার বাইরে ১৩০ টাকা  
${knowledgeSummary}

========================
🧾 ORDER FLOW
========================
User চাইলে: "ঠিক আছে 👍 আপনার নাম আর ডেলিভারি ঠিকানাটা দিন, আমরা অর্ডার কনফার্ম করে দিচ্ছি।"

========================
🎯 GOAL
========================
একজন বাস্তব দোকানদারের মতো আচরণ করা—আগে সহানুভূতি ও সাহায্য, পরে বিক্রি।
`;

    // --------------------
    // CONTEXT LIMIT
    // --------------------
    const contextMessages = messages
      .filter((m: any) => m.content)
      .slice(-6);

    const groqKey = process.env.GROQ_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    // --------------------
    // GROQ FIRST
    // --------------------
    if (groqKey) {
      let res = await callProvider(
        "https://api.groq.com/openai/v1/chat/completions",
        groqKey,
        {
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            ...contextMessages,
          ],
          temperature: 0.2,
        }
      );

      if (res) return NextResponse.json({ text: res });

      res = await callProvider(
        "https://api.groq.com/openai/v1/chat/completions",
        groqKey,
        {
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemPrompt },
            ...contextMessages,
          ],
          temperature: 0.2,
        }
      );

      if (res) return NextResponse.json({ text: res });
    }

    // --------------------
    // OPENROUTER FALLBACK
    // --------------------
    if (openRouterKey) {
      const res = await callProvider(
        "https://openrouter.ai/api/v1/chat/completions",
        openRouterKey,
        {
          model: "google/gemini-2.0-flash-exp:free",
          messages: [
            { role: "system", content: systemPrompt },
            ...contextMessages,
          ],
          temperature: 0.2,
        }
      );

      if (res) return NextResponse.json({ text: res });
    }

    // --------------------
    // FINAL FALLBACK
    // --------------------
    return NextResponse.json({
      text: "দুঃখিত, আমি এই মুহূর্তে সাড়া দিতে পারছি না। দয়া করে আবার চেষ্টা করুন।",
    });
  } catch (error) {
    console.error("Critical Error:", error);

    return NextResponse.json(
      { text: "System Error. Please try again." },
      { status: 500 }
    );
  }
}