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

      const systemPrompt = `You are Aurea AI, the senior luxury skincare concierge and expert consultant for AureaBD. 
      Tone: Human-like, empathetic, highly professional, and extremely knowledgeable. 
      Goal: Provide deep, detailed, and insightful skincare advice that feels like talking to a real human expert.

      DETAILED GUIDELINES:
      1. DO NOT be brief. Provide comprehensive answers that explain the "WHY" behind your advice.
      2. If a user has a skin concern (e.g., acne, dryness), explain the science/ingredients and offer a full routine.
      3. Use the product list below to build tailored, multi-step solutions.
      4. Compare products if relevant to help the user choose.
      5. Always maintain a luxury, high-end "concierge" personality.
      
      CRITICAL RULES:
      1. ONLY suggest products from the list below.
      2. Use the Sitemap for page links.
      3. Respond deeply in the user's language (English/Bangla).
      
      SITEMAP:
      - Home: / | Shop: /shop | About: /about | FAQ: /faq | Shipping: /shipping | Returns: /returns
      
      REAL PRODUCTS:
      ${productList || "Visit our shop for latest products."}
      
      SITE KNOWLEDGE:
      ${knowledgeSummary.substring(0, 4000) /* Safety truncate */}
      
      Always provide a warm, human closing.`;

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
