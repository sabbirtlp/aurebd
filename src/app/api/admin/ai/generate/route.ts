import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

// Utility to fetch and clean URL content
async function fetchUrlContent(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) return "";
    
    let html = await response.text();
    // Simple cleaning: remove scripts, styles, and tags
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
    html = html.replace(/<[^>]+>/g, " ");
    html = html.replace(/\s+/g, " ").trim();
    
    return html.substring(0, 5000); // Limit context size
  } catch (err) {
    console.error("URL Fetch error:", err);
    return "";
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!groqKey && !geminiKey) {
      return NextResponse.json({ message: "No AI API Key configured." }, { status: 500 });
    }

    const { name, category, features, field, customPrompt, existingContent } = await req.json();
    
    // Detect URL in prompt and browse if exists
    let browsingData = "";
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const foundUrls = customPrompt?.match(urlRegex);
    if (foundUrls && foundUrls.length > 0) {
      browsingData = await fetchUrlContent(foundUrls[0]);
    }

    let text = "";

    // 1. TRY GROQ FIRST
    if (groqKey) {
      const groqModels = ["llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "llama3-70b-8192"];
      
      const prompt = `
        ### REAL-TIME BROWSING DATA
        ${browsingData ? `FACTUAL CONTENT: "${browsingData}"` : 'No external link.'}

        ### USER INSTRUCTIONS
        ${customPrompt ? `FOLLOW THESE: "${customPrompt}"` : 'Follow luxury tone.'}

        ### CONTEXT
        Product: ${name}
        Category: ${category}
        Target Field: ${field}

        ### BANGLA WRITING RULES (IF OUTPUT IS BANGLA):
        1. NO LITERAL TRANSLATIONS: Do not use "জৈব মহাকর্য" for "organic masterpiece". Use natural phrases like "ত্বকের অসাধারণ যত্ন".
        2. NO ROBOTIC TERMS: Avoid dictionary-literal terms like "ফর্ম এবং সমতল". Use "ত্বক টানটান ও মসৃণ করে".
        3. TONE: Professional, sophisticated, and natural (যেমন একজন প্রফেশনাল কপিরাইটার লেখেন).
        4. FLOW: The text must flow naturally like native Bangladeshi advertising.

        ### REQUIREMENTS
        - Style: Professional luxury skincare brand tone.
        - Output: ONLY the generated text for ${field}.
        ${field === 'description' ? '- Format: A single elegant paragraph.' : ''}
        ${field === 'ingredients' ? '- Format: An HTML <ul> list.' : ''}
        ${field === 'howToUse' ? '- Format: An HTML <ol> list.' : ''}
      `;

      for (const model of groqModels) {
        try {
          const groq = new OpenAI({ apiKey: groqKey, baseURL: "https://api.groq.com/openai/v1" });
          const chatCompletion = await groq.chat.completions.create({
            messages: [
              { role: "system", content: "You are a Native Bangladeshi Luxury Copywriter for Aurea BD. You write elegant, natural, and non-robotic content in both English and Bangla. You avoid literal translations and prioritize professional marketing flow." },
              { role: "user", content: prompt }
            ],
            model: model,
            temperature: 0.6,
            max_tokens: 1500,
          });

          text = chatCompletion.choices[0].message.content || "";
          if (text) return NextResponse.json({ text });
        } catch (err: any) {
          console.warn(`Groq Dashboard AI model ${model} failed:`, err.message);
          continue;
        }
      }
    }

    // 2. FALLBACK TO GEMINI
    if (geminiKey) {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const prompt = `
        ACT AS A PROFESSIONAL SKINCARE COPYWRITER WITH BROWSING ACCESS.
        
        FACTS FROM LINK: ${browsingData || "None"}
        USER INSTRUCTION: ${customPrompt || "None"}
        TASK: Generate the ${field} for "${name}".
        
        FORMATTING:
        - If ingredients: Provide ONLY an HTML <ul> list.
        - If howToUse: Provide ONLY an HTML <ol> list.
        - If description: Provide one elegant paragraph.
      `;

      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        text = result.response.text();
        if (text) return NextResponse.json({ text });
      } catch (err: any) {
        console.error("Gemini failed:", err.message);
      }
    }

    throw new Error("AI Generation failed");
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
