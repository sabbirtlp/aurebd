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

    const { name, category, features, field, customPrompt, existingContent, language } = await req.json();
    
    // Detect URL in prompt and browse if exists
    let browsingData = "";
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const foundUrls = customPrompt?.match(urlRegex);
    if (foundUrls && foundUrls.length > 0) {
      browsingData = await fetchUrlContent(foundUrls[0]);
    }

    const targetLang = language === "bn" ? "BANGLA" : "ENGLISH";

    let text = "";

    // 1. TRY GEMINI FIRST FOR BANGLA
    if (language === "bn" && geminiKey) {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const prompt = `
        ### ROLE
        You are a Professional Native Bengali Beauty Copywriter for Aurea BD. 
        You specialize in Japanese and Korean skincare marketing.

        ### THE CHALLENGE: ZERO TOLERANCE FOR HALLUCINATIONS
        - NEVER invent chemical names (e.g., NO "সোয়ারোভাইটামাইন", NO "ট্রাইহাইড্রোক্সিবেনজোয়েট").
        - If no specific ingredients are found in the BROWSING DATA, do NOT mention any specific chemicals. Stick to general benefits like "ভিটামিন", "প্রাকৃতিক উপাদান".
        - BRAND NAME: Use the brand name exactly as it appears in the product name "${name}".

        ### WRITING STYLE: NATIVE & LUXURIOUS
        - AVOID literal translations of "Glow", "Radiance", "Correcting".
        - USE natural phrases like: "ত্বকের হারানো উজ্জ্বলতা ফিরিয়ে আনতে", "দাগহীন ও মসৃণ ত্বক", "ত্বকের গভীর থেকে পুষ্টি যোগাতে".
        - TERMS TO AVOID: "রোজালি", "সেরুম", "প্রয়োগ করুন", "চেকআইন", "চেহারায় আলোর সূক্ষ্মতা".
        - TERMS TO USE: "সিরাম", "ব্যবহার করুন", "নিয়মিত", "ত্বকের উজ্জ্বলতা".

        ### INPUT DATA
        PRODUCT NAME: ${name}
        LINK DATA: ${browsingData || "No link provided. DO NOT INVENT INGREDIENTS."}
        USER INSTRUCTION: ${customPrompt || "None"}
        
        ### TASK
        Write the ${field} in sophisticated, professional, and natural BANGLA.
        
        FORMATTING:
        - If ingredients: HTML <ul> list. ONLY include ingredients mentioned in LINK DATA.
        - If howToUse: HTML <ol> list in natural, simple Bangla.
        - If description: One elegant paragraph focusing on emotional benefits and results.
      `;

      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        text = result.response.text();
        if (text && !text.includes("I cannot") && !text.includes("unable to")) {
          return NextResponse.json({ text });
        }
      } catch (err: any) {
        console.error("Gemini Bangla failed:", err.message);
      }
    }

    // 2. TRY GROQ
    if (groqKey) {
      const groqModels = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
      
      const prompt = `
        ### SYSTEM ROLE
        Native Bengali Skincare Marketing Specialist.
        
        ### STRICT RULES:
        - DO NOT invent scientific names.
        - DO NOT translate literally.
        - Use "সিরাম" for Serum.
        - Focus on "উজ্জ্বল ত্বক", "দাগহীন ত্বক", "সতেজ অনুভব".
        - If no info is provided in 'Browsing Data', do NOT mention specific ingredients.
        - Write only the ${field} for "${name}".

        ### DATA:
        Product: ${name}
        Browsing Data: ${browsingData || 'None'}
      `;

      let lastErr = null;
      for (const model of groqModels) {
        try {
          const groq = new OpenAI({ apiKey: groqKey, baseURL: "https://api.groq.com/openai/v1" });
          const chatCompletion = await groq.chat.completions.create({
            messages: [
              { role: "system", content: `You are a high-end native Bengali copywriter. You write only natural, high-quality content in ${targetLang}.` },
              { role: "user", content: prompt }
            ],
            model: model,
            temperature: 0.2, // Very low for zero hallucinations
            max_tokens: 1500,
          });

          text = chatCompletion.choices[0].message.content || "";
          if (text && !text.includes("I cannot") && !text.includes("unable to")) {
            return NextResponse.json({ text });
          }
        } catch (err: any) {
          lastErr = err;
          console.warn(`Groq Dashboard AI model ${model} failed:`, err.message);
          continue;
        }
      }
      if (lastErr && !geminiKey) throw lastErr;
    }

    // 3. FINAL FALLBACK TO GEMINI
    if (geminiKey) {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const prompt = `
        ACT AS A PROFESSIONAL SKINCARE COPYWRITER.
        CRITICAL RULE: You MUST write the output in ${targetLang}.
        DO NOT HALLUCINATE SCIENTIFIC NAMES.
        
        FACTS FROM LINK: ${browsingData || "None"}
        USER INSTRUCTION: ${customPrompt || "None"}
        TASK: Generate the ${field} for "${name}" in ${targetLang}.
      `;

      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        text = result.response.text();
        if (text) return NextResponse.json({ text });
      } catch (err: any) {
        console.error("Gemini final fallback failed:", err.message);
      }
    }

    throw new Error(text ? "No text generated" : "All models failed to generate content");
  } catch (error: any) {
    console.error("API Error in AI Generate:", error.message);
    return NextResponse.json({ message: error.message || "Failed to generate content" }, { status: 500 });
  }
}
