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
        ROLE: Expert Skincare Copywriter for Aurea BD (Bangladesh).
        TASK: Write professional, high-end ${field} for "${name}" in BANGLA.
        
        ### CRITICAL: TERMINOLOGY PROTOCOL
        1. NO HALLUCINATIONS: Do NOT invent Bangla words for chemicals (e.g., avoid "সুমেকসপ্টারস"). 
        2. CHEMICAL NAMES: Keep technical names in English or standard, readable transliterations:
           - Correct: Niacinamide (নিয়াসিনামাইড), Vitamin C (ভিটামিন সি), Hyaluronic Acid (হায়ালুরোনিক অ্যাসিড), Alpha Arbutin (আলফা আরবুটিন).
           - Wrong: Inventing weird Bangla sounds.
        3. NATURAL BENEFITS: Describe what the ingredient DOES in natural, persuasive Bangla:
           - "ত্বকের কালো দাগ দূর করে" (Removes dark spots).
           - "ত্বককে ভেতর থেকে উজ্জ্বল করে" (Brightens skin from within).
           - "রোদে পোড়া ভাব দূর করে" (Removes tanning).
        4. TONE: Premium, medical-grade but accessible. Use "সিরাম" (Serum), "ব্যবহার করুন" (Use).
        
        FACTS FROM LINK: ${browsingData || "None"}
        USER INSTRUCTION: ${customPrompt || "None"}
        PRODUCT: ${name}
        
        FORMATTING:
        - If ingredients: HTML <ul> list with ingredient name in English/Transliterated and benefit in Bangla.
        - If howToUse: HTML <ol> list in natural Bangla.
        - If description: One elegant, persuasive paragraph.
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
        Premium Skincare Copywriter for Bangladesh.
        
        ### INSTRUCTIONS:
        - Write the ${field} for "${name}" in ${targetLang}.
        - TECHNICAL TERMS: Use English for chemical names if a natural Bangla term doesn't exist.
        - NEVER invent nonsense Bangla words for scientific terms.
        - FOCUS: Skin radiance, health, and authenticity.
        - STYLE: High-end, native, and flowing.

        ### REQUIREMENTS
        - Output: ONLY the generated text for ${field} in ${targetLang}.
      `;

      let lastErr = null;
      for (const model of groqModels) {
        try {
          const groq = new OpenAI({ apiKey: groqKey, baseURL: "https://api.groq.com/openai/v1" });
          const chatCompletion = await groq.chat.completions.create({
            messages: [
              { role: "system", content: `You are a Skincare Copywriter in ${targetLang}. Use English for complex chemical names to ensure accuracy.` },
              { role: "user", content: prompt }
            ],
            model: model,
            temperature: 0.3, // Lower temperature for more factual accuracy
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
