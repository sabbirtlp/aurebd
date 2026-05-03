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
        ROLE: You are the Lead Beauty Consultant & Copywriter for Aurea BD (Bangladesh's premier destination for authentic Japanese skincare).
        AUDIENCE: Bangladeshi women and men looking for radiant, healthy skin in a humid, tropical climate.
        EXPERTISE: Japanese Skincare (J-Beauty), focus on hydration, brightening, and natural ingredients (Sakura, Rice water, Green tea).
        
        ### CRITICAL WRITING RULES (BANGLA):
        1. LOCAL EXPERTISE: Address common Bangladeshi skin issues like "রোদে পোড়া ভাব" (tanning), "অতিরিক্ত তৈলাক্ততা" (oiliness), and "কালচে দাগ" (dark spots).
        2. CULTURAL TONE: Use a tone that is respectful, persuasive, and luxurious. Sound like a trusted beauty expert on social media.
        3. NATURAL PHRASING:
           - Use "ত্বকের প্রাকৃতিক জেল্লা" (natural glow).
           - Use "গভীরভাবে ময়েশ্চারাইজ করে" (deeply moisturizes).
           - Use "জাপানিজ রূপচর্চার গোপন রহস্য" (secret of Japanese beauty).
           - Use "১০০% অথেন্টিক পণ্য" (100% authentic product).
        4. TERMINOLOGY:
           - "সিরাম" (Serum), "টোনার" (Toner), "সানস্ক্রিন" (Sunscreen), "ময়েশ্চারাইজার" (Moisturizer).
           - Do NOT use robotic terms like "রোজালি", "চেকআইন", or "সেরুম".
        
        FACTS FROM LINK: ${browsingData || "None"}
        USER INSTRUCTION: ${customPrompt || "None"}
        PRODUCT: ${name}
        FIELD: ${field}
        
        FORMATTING:
        - If ingredients: HTML <ul> list.
        - If howToUse: HTML <ol> list.
        - If description: One elegant, high-converting paragraph.
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
        Expert Skincare Copywriter for the Bangladeshi Market. Specialty: Japanese Cosmetics (Aurea BD).
        
        ### CONTEXT
        Product: ${name}
        Field: ${field}
        Target Language: ${targetLang}
        Browsing Data: ${browsingData || 'None'}

        ### COPYWRITING GUIDELINES:
        - FOCUS: Hydration, Brightening, and Skin Health (Radiance).
        - STYLE: Luxury, Premium, Trustworthy.
        - AUDIENCE CONCERNS: Authenticity, suitability for Bangladeshi weather/skin, visible results.
        
        ### BANGLA RULES:
        - Act as a native speaker.
        - Use modern, high-end beauty industry vocabulary.
        - Ensure emotional appeal (e.g., "আপনার ত্বককে দিন নতুন প্রাণ").

        ### REQUIREMENTS
        - Output: ONLY the generated text for ${field} in ${targetLang}.
        ${field === 'description' ? '- Format: A single elegant paragraph.' : ''}
        ${field === 'ingredients' ? '- Format: An HTML <ul> list.' : ''}
        ${field === 'howToUse' ? '- Format: An HTML <ol> list.' : ''}
      `;

      let lastErr = null;
      for (const model of groqModels) {
        try {
          const groq = new OpenAI({ apiKey: groqKey, baseURL: "https://api.groq.com/openai/v1" });
          const chatCompletion = await groq.chat.completions.create({
            messages: [
              { role: "system", content: `You are a Japanese Skincare Expert for the Bangladeshi market. You write professional, luxury content in ${targetLang}.` },
              { role: "user", content: prompt }
            ],
            model: model,
            temperature: 0.5,
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
        console.error("Gemini final fallback failed:", err.message);
      }
    }

    throw new Error(text ? "No text generated" : "All models failed to generate content");
  } catch (error: any) {
    console.error("API Error in AI Generate:", error.message);
    return NextResponse.json({ message: error.message || "Failed to generate content" }, { status: 500 });
  }
}
