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
    try {
      await dbConnect();
      
      // 1. Get Top Products (Limit to prevent context overflow)
      const products = await Product.find({ stock: { $gt: 0 } })
        .sort({ updatedAt: -1 })
        .limit(30)
        .select('name price category slug')
        .lean();
      
      const productList = products.map(p => `- ${p.name} (৳${p.price}) -> /product/${p.slug}`).join('\n');

      // 2. Get CMS Data (Optimized truncation)
      const cmsData = await SiteContent.find({}).limit(100).lean();
      const siteKnowledge = cmsData.reduce((acc: any, item: any) => {
        if (!acc[item.page]) acc[item.page] = [];
        // Only take the first 100 characters of each value to keep prompt small
        const val = item.value.length > 150 ? item.value.substring(0, 150) + '...' : item.value;
        acc[item.page].push(`${item.key}: ${val}`);
        return acc;
      }, {});

      const knowledgeSummary = Object.entries(siteKnowledge).map(([page, lines]: [string, any]) => {
        return `PAGE ${page.toUpperCase()}:\n${lines.join('\n')}`;
      }).join('\n\n');

      const systemPrompt = `You are Aurea AI, the senior luxury skincare concierge and virtual manager for AureaBD. 
      Primary Language: BANGLA (বাংলা). 

      RELIGIOUS ETIQUETTE & GREETINGS:
      1. IF USER SAYS "Assalamu Alaikum": You MUST respond with "ওয়ালাইকুম আসসালাম" (Walaikum Assalam) first.
      2. IF STARTING CONVERSATION: You initiate with "আসসালামু আলাইকুম" (Assalamu Alaikum).
      3. DO NOT repeat greetings in every message.
      
      EXPERT KNOWLEDGE NUGGETS:
      1. SHIPPING: Dhaka City (24-48 hours, ৳70), Outside Dhaka (3-5 days, ৳130).
      2. PAYMENTS: We support Cash on Delivery (COD) and bKash/Nagad.
      3. AUTHENTICITY: All products are 100% Authentic, directly imported (mostly Japan/Korea).
      4. HOW TO ORDER: Select product -> Add to Cart -> View Cart -> Checkout -> Provide Address -> Confirm.
      5. BRAND: Aurea BD focus on "Sakura" (Cherry Blossom) skincare for natural glowing skin.
      
      LANGUAGE & CONVERSATIONAL RULES:
      1. DEFAULT: High-quality professional Bangla.
      2. VOCABULARY: Serum -> সিরাম, Balance -> ব্যালেন্স, Moisturizer -> ময়েশ্চারাইজার, Cleanser -> ক্লিনজার, Skin -> ত্বক.
      
      RESPONSE DYNAMICS:
      1. ADAPTIVE LENGTH: Brief for greetings, detailed for consultations.
      2. INFORMATION: Provide email/phone from SITE KNOWLEDGE if asked.
      
      CRITICAL RULES:
      1. ONLY suggest products from the list below.
      2. Use the Sitemap for page links.
      
      SITEMAP:
      - Home: / | Shop: /shop | About: /about | FAQ: /faq | Shipping: /shipping | Returns: /returns
      
      REAL PRODUCTS:
      ${productList || "Visit our shop for latest products."}
      
      SITE KNOWLEDGE:
      ${knowledgeSummary.substring(0, 4000)}
      
      Maintain a premium, helpful, and natural human-like tone.`;

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
              max_tokens: 1024,
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
            generationConfig: { maxOutputTokens: 1200 },
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
  } catch (outerError: any) {
    return NextResponse.json({ message: "Request error" }, { status: 400 });
  }
}
