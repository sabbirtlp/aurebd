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
      .map((item) => `${item.key}: ${item.value.substring(0, 300)}`)
      .join("\n");

    return { productList, knowledgeSummary };
  } catch (error) {
    console.error("Knowledge Fetch Error:", error);
    return { productList: "", knowledgeSummary: "" };
  }
}

async function searchWeb(query: string): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey || query.length < 5) return "";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout for search

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query: query,
        search_depth: "basic",
        max_results: 3,
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    if (!response.ok) return "";
    const data = await response.json();
    return data.results.map((r: any) => `• ${r.title}: ${r.content}`).join("\n");
  } catch { 
    clearTimeout(timeoutId);
    return ""; 
  }
}

function shouldUseWeb(query: string) {
  const q = query.toLowerCase();
  const triggers = ["what is", "best", "compare", "review", "how to", "meaning", "why"];
  const isProductIntent = q.includes("price") || q.includes("kinte") || q.includes("buy") || q.includes("product") || q.includes("দাম") || q.includes("কত");
  return triggers.some((t) => q.includes(t)) && !isProductIntent;
}

// --------------------
// PROVIDER CALL FUNCTION
// --------------------

async function callProvider(url: string, apiKey: string, body: any, isOpenRouter = false) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

  try {
    const headers: any = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };

    if (isOpenRouter) {
      headers["HTTP-Referer"] = "https://aureabd.com";
      headers["X-Title"] = "AureaBD";
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    if (!res.ok) {
      const err = await res.text();
      console.error(`Provider Error (${url}):`, res.status, err.substring(0, 100));
      return "";
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error(`Fetch Error (${url}):`, error.message);
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

    const lastUserMsg = messages.filter((m: any) => m.role === "user").pop()?.content || "";
    let webResults = "";
    if (shouldUseWeb(lastUserMsg)) {
      webResults = await searchWeb(lastUserMsg);
    }

    const systemPrompt = `আপনি Aurea BD-এর একজন অভিজ্ঞ স্কিনকেয়ার বিশেষজ্ঞ।

----------------------------------
🚫 STRICT NAMING RULE (খুব গুরুত্বপূর্ণ)
----------------------------------
- প্রোডাক্টের নাম সবসময় English-এ লিখবেন। কোনোভাবেই বাংলা উচ্চারণ বা অনুবাদ করবেন না।
- ভুল বানান বা অদ্ভুত শব্দ (যেমন: সারুম, সোপ্ট, সোপ্তিক, মুখ ওয়াশ) পুরোপুরি নিষিদ্ধ।
- সঠিক নাম ব্যবহার করুন: Serum (সারুম নয়), Face Wash (মুখ ওয়াশ নয়), Supple/Soft (সোপ্তিক নয়)।

----------------------------------
📖 নির্দেশনা
----------------------------------
১. মানুষের মতো স্বাভাবিক ও প্রফেশনাল বাংলায় কথা বলুন।
২. প্রোডাক্ট সম্পর্কে তথ্য দিতে নিচের DATABASE PRODUCTS ব্যবহার করুন।
৩. Cream/Essence/Serum ধোয়ার দরকার নেই; পরিষ্কার ত্বকে লাগিয়ে রেখে দিতে হয়।
৪. আউরেয়া বিডি (AureaBD) সম্পর্কে জানতে চাইলে SITE INFO দেখুন।

DATABASE PRODUCTS:
${productList}

WEB KNOWLEDGE:
${webResults}

SITE INFO:
${knowledgeSummary}
ঠিকানা: তিলকপুর, আক্কেলপুর, জয়পুরহাট।

অর্ডার নিতে চাইলে: "ঠিক আছে 👍 আপনার নাম আর ডেলিভারি ঠিকানাটা দিন।"`;

    const contextMessages = messages.filter((m: any) => m.content).slice(-6);
    const groqKey = process.env.GROQ_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    if (groqKey) {
      let res = await callProvider("https://api.groq.com/openai/v1/chat/completions", groqKey, {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: systemPrompt }, ...contextMessages],
        temperature: 0
      });
      if (res) return NextResponse.json({ text: res });

      res = await callProvider("https://api.groq.com/openai/v1/chat/completions", groqKey, {
        model: "llama-3.1-8b-instant",
        messages: [{ role: "system", content: systemPrompt }, ...contextMessages],
        temperature: 0
      });
      if (res) return NextResponse.json({ text: res });
    }

    if (openRouterKey) {
      // A. Gemini 2.0 Flash (Fast & Smart)
      let res = await callProvider("https://openrouter.ai/api/v1/chat/completions", openRouterKey, {
        model: "google/gemini-2.0-flash-exp:free",
        messages: [{ role: "system", content: systemPrompt }, ...contextMessages],
        temperature: 0
      }, true);
      if (res) return NextResponse.json({ text: res });

      // B. GPT-4o Mini (Extremely Reliable)
      res = await callProvider("https://openrouter.ai/api/v1/chat/completions", openRouterKey, {
        model: "openai/gpt-4o-mini",
        messages: [{ role: "system", content: systemPrompt }, ...contextMessages],
        temperature: 0
      }, true);
      if (res) return NextResponse.json({ text: res });

      // C. Claude 3 Haiku (Great at natural language)
      res = await callProvider("https://openrouter.ai/api/v1/chat/completions", openRouterKey, {
        model: "anthropic/claude-3-haiku",
        messages: [{ role: "system", content: systemPrompt }, ...contextMessages],
        temperature: 0
      }, true);
      if (res) return NextResponse.json({ text: res });

      // D. Llama 3.1 8B (Final Free Fallback)
      res = await callProvider("https://openrouter.ai/api/v1/chat/completions", openRouterKey, {
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [{ role: "system", content: systemPrompt }, ...contextMessages],
        temperature: 0
      }, true);
      if (res) return NextResponse.json({ text: res });
    }

    return NextResponse.json({ text: "দুঃখিত, আমি এই মুহূর্তে সাড়া দিতে পারছি না। দয়া করে আবার চেষ্টা করুন।" });
  } catch (error) {
    console.error("Critical Error:", error);
    return NextResponse.json({ text: "সিস্টেম এরর। দয়া করে কিছুক্ষণ পর ট্রাই করুন।" }, { status: 500 });
  }
}