import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import SiteContent from "@/models/SiteContent";

// ---- DATA FETCHERS ----

async function getSiteKnowledge() {
  try {
    await dbConnect();
    const products = await Product.find({ stock: { $gt: 0 } })
      .sort({ updatedAt: -1 })
      .limit(8)
      .select('name price discountPrice')
      .lean();
    
    const productList = products.map(p => `- ${p.name}: ৳${p.discountPrice || p.price}`).join('\n');
    const cmsData = await SiteContent.find({}).limit(5).lean();
    const knowledgeSummary = cmsData.map(item => `${item.key}: ${item.value.substring(0, 50)}`).join('\n');
    
    return { productList, knowledgeSummary };
  } catch (error) { 
    console.error("Knowledge Fetch Error:", error);
    return { productList: "", knowledgeSummary: "" }; 
  }
}

async function searchWeb(query: string): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey || query.length < 5) return "";

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query: query,
        search_depth: "basic",
        include_answer: true,
        max_results: 3
      }),
    });
    if (!response.ok) return "";
    const data = await response.json();
    return data.results.map((r: any) => `[Web Source]: ${r.content}`).join("\n\n");
  } catch { return ""; }
}

// ---- API CALLERS (Direct Fetch with Timeout) ----

async function callProvider(providerName: string, url: string, apiKey: string, body: any, isOpenRouter = false): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); 

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

    // Perform web search for the latest user query if it's not a basic greet/buy intent
    const lastUserMsg = messages.filter((m: any) => m.role === 'user').pop()?.content || "";
    let webResults = "";
    if (lastUserMsg.length > 10 && !lastUserMsg.includes("দাম") && !lastUserMsg.includes("কত")) {
        webResults = await searchWeb(lastUserMsg);
    }

    const systemPrompt = `আপনি Aurea BD-এর একজন অভিজ্ঞ, ভদ্র এবং প্রফেশনাল স্কিনকেয়ার কনসালটেন্ট ও দোকানদার।

========================
🧠 INTENT-BASED RESPONSE
========================
1. INFORMATION (যেমন: "serum ki"): শুধু explain করুন। কোনো product suggest করবেন না।
2. PRODUCT LIST: Clean list দিন। শুধু নাম + দাম।
3. BUY INTENT: তখনই order process শুরু করুন। আগে কখনো address চাইবেন না।

========================
🔍 PRODUCTS (স্টকের পণ্য):
${productList || "Check our shop for details."}

========================
🌐 WEB KNOWLEDGE (ইন্টারনেট থেকে প্রাপ্ত তথ্য):
${webResults || "No external info needed for this query."}

========================
📌 SITE INFO
ঠিকানা: তিলকপুর, আক্কেলপুর, জয়পুরহাট  
ডেলিভারি চার্জ: ঢাকা ৭০ টাকা, ঢাকার বাইরে ১৩০ টাকা  
অতিরিক্ত তথ্য: ${knowledgeSummary}

========================
💬 RULES
- ভাষা: প্রাকৃতিক বাংলা। ইংরেজি নাম বাংলায় লিখবেন না।
- "আপনি সুন্দর" বা অপ্রাসঙ্গিক কথা বলবেন না।
- Web Knowledge ব্যবহার করে সাধারণ স্কিনকেয়ার প্রশ্নের উত্তর দিন, কিন্তু প্রোডাক্টের ক্ষেত্রে সবসময় নিজের স্টক চেক করুন।

========================
🧾 ORDER FLOW
"ঠিক আছে 👍 আপনার নাম আর ডেলিভারি ঠিকানাটা দিন, আমরা অর্ডার কনফার্ম করে দিচ্ছি।"

========================
🎯 GOAL: বাস্তব দোকানদারের মতো আচরণ করা। আগে সাহায্য, পরে বিক্রি।`;

    const groqKey = process.env.GROQ_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    const contextMessages = messages
      .filter((m: any) => m.content && (m.role === 'user' || m.role === 'assistant'))
      .slice(-4);

    if (groqKey) {
      let res = await callProvider("Groq-70B", "https://api.groq.com/openai/v1/chat/completions", groqKey, {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: systemPrompt }, ...contextMessages],
        temperature: 0.1
      });
      if (res) return NextResponse.json({ text: res });

      res = await callProvider("Groq-8B", "https://api.groq.com/openai/v1/chat/completions", groqKey, {
        model: "llama-3.1-8b-instant",
        messages: [{ role: "system", content: systemPrompt }, ...contextMessages],
        temperature: 0.1
      });
      if (res) return NextResponse.json({ text: res });
    }

    if (openRouterKey) {
      let res = await callProvider("OpenRouter-Gemini", "https://openrouter.ai/api/v1/chat/completions", openRouterKey, {
        model: "google/gemini-2.0-flash-exp:free",
        messages: [{ role: "system", content: systemPrompt }, ...contextMessages],
        temperature: 0.1
      }, true);
      if (res) return NextResponse.json({ text: res });
    }

    return NextResponse.json({ text: "দুঃখিত, আমি এই মুহূর্তে কানেক্ট হতে পারছি না। দয়া করে ১ মিনিট পর আবার চেষ্টা করুন! ✨" });
  } catch (error: any) {
    console.error("Critical Error:", error);
    return NextResponse.json({ message: "System Error" }, { status: 500 });
  }
}
