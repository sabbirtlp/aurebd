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
      .limit(10)
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
  const timeoutId = setTimeout(() => controller.abort(), 4000);

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

async function callProvider(url: string, apiKey: string, body: any, isOpenRouter = false) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s

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

    const systemPrompt = `আপনি Aurea BD-এর একজন অভিজ্ঞ প্রিমিয়াম স্কিনকেয়ার বিশেষজ্ঞ। 

পণ্য তালিকা:
${productList}

সাইট তথ্য:
${knowledgeSummary}
ঠিকানা: তিলকপুর, আক্কেলপুর, জয়পুরহাট।

অর্ডার নিতে চাইলে: "ঠিক আছে 👍 আপনার নাম আর ডেলিভারি ঠিকানাটা দিন, আমরা দ্রুত পাঠিয়ে দিচ্ছি।"

কঠোর নিয়মাবলী (অবশ্যই পালনীয়):
১. সকল পণ্যের নাম ও ক্যাটাগরি (Face Wash, Toner, Serum, Cream, Mask, Moisturizer) অবশ্যই ENGLISH-এ লিখবেন। কোনোভাবেই বাংলা উচ্চারণ (যেমন: ফেস ওয়াশ, সারুম) ব্যবহার করবেন না।
২. বাক্যগুলো সাবলীল, মার্জিত এবং পেশাদার হতে হবে। "সুপারসিক্রিট পরামর্শ" বা "আমি আপনাকে বলতে পারি" এই জাতীয় শিশুসুলভ কথা বলা যাবে না।
৩. একই প্যারাগ্রাফে একই তথ্যের পুনরাবৃত্তি করবেন না।
৪. কাস্টমারকে "আপনি" সম্বোধন করবেন এবং অত্যন্ত বিনয়ী থাকবেন।

ভুল উদাহরণ: "আপনি এই সেটটি কিনতে চান কিনা?" (এটি অপেশাদার)
সঠিক উদাহরণ: "আপনি চাইলে এই সেটটি অর্ডার করতে পারেন, আমরা দ্রুত ডেলিভারি করে দিব।"`;

    const contextMessages = messages.filter((m: any) => m.content).slice(-6);
    const groqKey = process.env.GROQ_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    // 1. Try OpenRouter Gemini 2.0 (Best for Bangla & Steerability)
    if (openRouterKey) {
      let res = await callProvider("https://openrouter.ai/api/v1/chat/completions", openRouterKey, {
        model: "google/gemini-2.0-flash-exp:free",
        messages: [{ role: "system", content: systemPrompt }, ...contextMessages],
        temperature: 0
      }, true);
      if (res) return NextResponse.json({ text: res });

      res = await callProvider("https://openrouter.ai/api/v1/chat/completions", openRouterKey, {
        model: "openai/gpt-4o-mini",
        messages: [{ role: "system", content: systemPrompt }, ...contextMessages],
        temperature: 0
      }, true);
      if (res) return NextResponse.json({ text: res });
    }

    // 2. Try Groq Llama 3.3 70B
    if (groqKey) {
      const res = await callProvider("https://api.groq.com/openai/v1/chat/completions", groqKey, {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: systemPrompt }, ...contextMessages],
        temperature: 0
      });
      if (res) return NextResponse.json({ text: res });
    }

    return NextResponse.json({ text: "দুঃখিত, আমি এই মুহূর্তে সাড়া দিতে পারছি না।" });
  } catch (error) {
    console.error("Critical Error:", error);
    return NextResponse.json({ text: "সিস্টেম এরর" }, { status: 500 });
  }
}