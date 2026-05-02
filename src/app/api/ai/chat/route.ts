import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import SiteContent from "@/models/SiteContent";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!groqKey && !geminiKey) {
      return NextResponse.json({ message: "AI Assistant is resting..." }, { status: 500 });
    }

    // --- FETCH REAL KNOWLEDGE ---
    await dbConnect();
    
    // 1. Get All Products for grounding
    const products = await Product.find({ stock: { $gt: 0 } }).select('name price category slug').lean();
    const productList = products.map(p => `- ${p.name} (Category: ${p.category}) - Price: ৳${p.price} - Link: /product/${p.slug}`).join('\n');

    // 2. Get EVERYTHING from CMS for site-wide knowledge
    const cmsData = await SiteContent.find({}).lean();
    const siteKnowledge = cmsData.reduce((acc: any, item: any) => {
      if (!acc[item.page]) acc[item.page] = {};
      acc[item.page][item.key] = item.value;
      return acc;
    }, {});

    const knowledgeSummary = Object.entries(siteKnowledge).map(([page, fields]: [string, any]) => {
      return `PAGE: ${page.toUpperCase()}\n${Object.entries(fields).map(([k, v]) => `- ${k}: ${v}`).join('\n')}`;
    }).join('\n\n');

    const systemPrompt = `You are Aurea AI, the luxury skincare concierge for AureaBD. 
    Your tone is sophisticated, helpful, and grounded in FACTUAL information.
    
    CRITICAL RULES:
    1. ONLY suggest products from the "REAL PRODUCTS" list below.
    2. ONLY provide information found in the "SITE-WIDE KNOWLEDGE" section.
    3. If a user asks for a page link, use the Sitemap below.
    4. You support both English and Bangla. Respond in the language the user uses.
    
    SITEMAP:
    - Home: /
    - Shop/All Products: /shop
    - About Us: /about
    - Contact Us: /contact
    - FAQ: /faq
    - Shipping Policy: /shipping
    - Returns & Refunds: /returns
    - Terms of Service: /terms-of-service
    - Privacy Policy: /privacy-policy
    
    REAL PRODUCTS AT AUREA BD:
    ${productList || "No products currently in stock."}
    
    SITE-WIDE KNOWLEDGE:
    ${knowledgeSummary || "Aurea BD: Premium Japanese Sakura Skincare in Bangladesh."}
    
    Keep responses concise but elegant. Use emojis sparingly (✨, 🌿, 🧴).`;

    // 1. TRY GROQ (Ultra Fast Chat)
    if (groqKey) {
      const groqModels = ["llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "llama3-70b-8192", "mixtral-8x7b-32768"];
      
      for (const model of groqModels) {
        try {
          const groq = new OpenAI({ apiKey: groqKey, baseURL: "https://api.groq.com/openai/v1" });
          const chatCompletion = await groq.chat.completions.create({
            messages: [
              { role: "system", content: systemPrompt },
              ...messages
            ],
            model: model,
            temperature: 0.7,
            max_tokens: 500,
          });

          const text = chatCompletion.choices[0].message.content || "";
          if (text) return NextResponse.json({ text });
        } catch (err: any) {
          console.warn(`Groq Chat model ${model} failed:`, err.message);
          continue;
        }
      }
    }

    // 2. FALLBACK TO GEMINI
    if (geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Transform messages for Gemini (Ensuring correct role mapping)
        const history = messages.slice(0, -1).map((m: any) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }]
        }));
        const lastMessage = messages[messages.length - 1].content;

        const chat = model.startChat({
          history: history,
          generationConfig: { maxOutputTokens: 800 },
        });

        const result = await chat.sendMessage(`CONTEXT: ${systemPrompt}\n\nUSER_MESSAGE: ${lastMessage}`);
        const response = await result.response;
        const text = response.text();
        if (text) return NextResponse.json({ text });
      } catch (err: any) {
        console.error("Gemini Chat Error:", err.message);
      }
    }

    return NextResponse.json({ message: "All AI providers are currently busy. Please try again in a moment." }, { status: 503 });
  } catch (error: any) {
    console.error("Global Chat API Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
