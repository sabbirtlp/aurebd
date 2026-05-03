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
    return data.results.map((r: any) => `• ${r.title}: ${r.content}`).join("\n");
  } catch { return ""; }
}

// --------------------
// WEB DECISION ENGINE
// --------------------

function shouldUseWeb(query: string) {
  const q = query.toLowerCase();
  const triggers = ["what is", "best", "compare", "review", "how to", "meaning", "why"];
  const isProductIntent = q.includes("price") || q.includes("kinte") || q.includes("buy") || q.includes("product");
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
    return data.choices?.[0]?.message?.content || data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch {
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

    const lastUserMsg = messages.filter((m: any) => m.role === "user").pop()?.content || "";
    let webResults = "";
    if (shouldUseWeb(lastUserMsg)) {
      webResults = await searchWeb(lastUserMsg);
    }

    const systemPrompt = `আপনি Aurea BD-এর একজন অভিজ্ঞ স্কিনকেয়ার বিশেষজ্ঞ।

নির্দেশনা:
১. মানুষের মতো স্বাভাবিকভাবে কথা বলুন। রোবটের মতো একই বাক্য বারবার বলবেন না। 
২. আউরেয়া বিডি (AureaBD) সম্পর্কে জানতে চাইলে নিচের SITE INFO থেকে তথ্য দিন।
৩. পন্য ব্যবহারের নিয়ম: 
   - Cream/Essence/Serum: এগুলো ধোয়ার দরকার নেই। পরিষ্কার ত্বকে লাগিয়ে রেখে দিতে হয়।
   - Sunscreen: বাইরে যাওয়ার ১৫ মিনিট আগে দিতে হয়।
৪. কাস্টমার কিনতে না চাইলে জোর করবেন না বা নাম-ঠিকানা চাইবেন না। 
৫. পণ্যের নাম সবসময় English-এ রাখবেন। (যেমন: Axis-Y Serum)।

DATABASE PRODUCTS:
${productList}

WEB KNOWLEDGE (For General Questions):
${webResults}

SITE INFO (Company/Address):
${knowledgeSummary}
ঠিকানা: তিলকপুর, আক্কেলপুর, জয়পুরহাট।

অর্ডার নিতে চাইলে: "ঠিক আছে 👍 আপনার নাম আর ডেলিভারি ঠিকানাটা দিন।"

লক্ষ্য: সঠিক ও সহজ পরামর্শ দিয়ে গ্রাহককে সাহায্য করা।`;

    const contextMessages = messages.filter((m: any) => m.content).slice(-6);
    const groqKey = process.env.GROQ_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    if (groqKey) {
      const res = await callProvider("https://api.groq.com/openai/v1/chat/completions", groqKey, {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: systemPrompt }, ...contextMessages],
        temperature: 0.1
      });
      if (res) return NextResponse.json({ text: res });
    }

    if (openRouterKey) {
      const res = await callProvider("https://openrouter.ai/api/v1/chat/completions", openRouterKey, {
        model: "google/gemini-2.0-flash-exp:free",
        messages: [{ role: "system", content: systemPrompt }, ...contextMessages],
        temperature: 0.1
      });
      if (res) return NextResponse.json({ text: res });
    }

    return NextResponse.json({ text: "দুঃখিত, আমি এই মুহূর্তে সাড়া দিতে পারছি না।" });
  } catch (error) {
    console.error("Critical Error:", error);
    return NextResponse.json({ text: "System Error" }, { status: 500 });
  }
}