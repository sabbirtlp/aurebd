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
    
    // 1. Products
    const products = await Product.find({ stock: { $gt: 0 } })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select("name price discountPrice")
      .lean();
    const productList = products
      .map((p) => `- ${p.name}: ৳${p.discountPrice || p.price}`)
      .join("\n");

    // 2. About page content
    const aboutData = await SiteContent.find({ page: "about" }).lean();
    const aboutSummary = aboutData
      .map((item) => `${item.section}.${item.key}: ${item.value.substring(0, 500)}`)
      .join("\n");

    // 3. General site content (home, contact, etc.)
    const siteData = await SiteContent.find({ page: { $ne: "about" } }).limit(10).lean();
    const siteSummary = siteData
      .map((item) => `${item.page}.${item.section}.${item.key}: ${item.value.substring(0, 300)}`)
      .join("\n");

    return { productList, aboutSummary, siteSummary };
  } catch (error) {
    console.error("Knowledge Fetch Error:", error);
    return { productList: "", aboutSummary: "", siteSummary: "" };
  }
}

async function callProvider(url: string, apiKey: string, body: any, isOpenRouter = false) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

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
    const { productList, aboutSummary, siteSummary } = await getSiteKnowledge();

    const userMessages = messages.filter((m: any) => m.role === "user");
    const isFirstMessage = userMessages.length <= 1;
    const lastUserMsg = userMessages[userMessages.length - 1]?.content?.toLowerCase() || "";
    const hasSalam = lastUserMsg.includes("salam") || lastUserMsg.includes("সালাম") || lastUserMsg.includes("আসসালামু");

    let salamInstruction = "";
    if (isFirstMessage) {
      if (hasSalam) {
        salamInstruction = `\n🤝 গ্রাহক সালাম দিয়েছেন। উত্তরের শুরুতে "ওয়ালাইকুম আসসালাম!" দিয়ে শুরু করুন। তারপর স্বাভাবিকভাবে কথা বলুন।`;
      } else {
        salamInstruction = `\n🤝 এটি গ্রাহকের প্রথম মেসেজ। উত্তরের শুরুতে "আসসালামু আলাইকুম! Aurea BD-তে আপনাকে স্বাগতম 🌸" দিয়ে শুরু করুন। তারপর স্বাভাবিকভাবে কথা বলুন।`;
      }
    } else {
      salamInstruction = `\n🤝 এটি প্রথম মেসেজ নয়। সালাম বা স্বাগতম জানানোর দরকার নেই। সরাসরি উত্তর দিন।`;
    }

    const systemPrompt = `আপনি Aurea BD-এর একজন অভিজ্ঞ প্রিমিয়াম স্কিনকেয়ার বিশেষজ্ঞ।

⚠️ ভাষা: সবসময় প্রাকৃতিক বাংলায় উত্তর দিন। English-এ উত্তর দেওয়া নিষেধ। তবে পণ্যের নাম এবং ক্যাটাগরি (Face Wash, Toner, Serum, Cream) ইংরেজিতেই থাকবে।
${salamInstruction}

পণ্য তালিকা:
${productList}

Aurea BD সম্পর্কে (About Us):
${aboutSummary}

সাইট তথ্য:
${siteSummary}
ঠিকানা: তিলকপুর, আক্কেলপুর, জয়পুরহাট।

নিয়মাবলী:
১. উপরের পণ্য তালিকা, About Us এবং সাইট তথ্য ব্যবহার করে উত্তর দিন। কাল্পনিক তথ্য দেবেন না।
২. পণ্যের নাম ও ক্যাটাগরি ENGLISH-এ রাখুন।
৩. বাক্য সাবলীল, মার্জিত ও পেশাদার হবে। একই কথা বারবার বলবেন না।
৪. কাস্টমার কিনতে চাইলে বলুন: "ঠিক আছে 👍 আপনার নাম আর ডেলিভারি ঠিকানাটা দিন, আমরা দ্রুত পাঠিয়ে দিচ্ছি।"
৫. তথ্য না থাকলে বিনয়ের সাথে জানান।

মনে রাখুন: আপনি সবসময় বাংলায় কথা বলবেন।`;

    const contextMessages = messages.filter((m: any) => m.content).slice(-6);
    const groqKey = process.env.GROQ_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    // 1. Try OpenRouter Gemini 2.0
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