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
      
      let specificInstructions = "";
      if (field === "ingredients") {
        specificInstructions = `
          TASK: LIST ONLY THE INGREDIENTS.
          FORMAT: Return ONLY an HTML <ul> list.
          RULE: No introductory sentences. No marketing text. No bold names. 
          LIST ONLY THE INGREDIENTS found in LINK DATA.
        `;
      } else if (field === "description" || field === "shortDescription") {
        specificInstructions = `
          TASK: Write a 1-2 sentence hook.
          FORMAT: A single short paragraph. 
          STYLE: Luxurious and brief.
        `;
      }

      const prompt = `
        ROLE: Expert Skincare Copywriter.
        BRAND NAME: Keep brand names like "Axis-y" or "Laikou" in English characters or very clean Bangla (e.g. অ্যাক্সিস-ওয়াই).
        TARGET LANGUAGE: ${targetLang}
        
        ${specificInstructions}

        LINK DATA: ${browsingData || "None"}
        USER INSTRUCTION: ${customPrompt || "None"}
        PRODUCT NAME: ${name}
        
        OUTPUT: ONLY the ${field} content. No conversational filler.
      `;

      try {
        const model = genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 500,
          }
        });
        const result = await model.generateContent(prompt);
        text = result.response.text();
        
        if (text && !text.includes("I cannot") && !text.includes("unable to")) {
          // Clean markdown code blocks if present
          text = text.replace(/```html|```/g, "").trim();
          return NextResponse.json({ text });
        }
      } catch (err: any) {
        console.error("Gemini Bangla failed:", err.message);
      }
    }

    // 2. TRY GROQ (Restricted)
    if (groqKey) {
      const prompt = `
        TASK: Write ${field} for "${name}" in ${targetLang}.
        IF ingredients: ONLY an HTML <ul> list. No intro.
        IF shortDescription: ONLY 1-2 sentences.
        DATA: ${browsingData || 'None'}
      `;

      try {
        const groq = new OpenAI({ apiKey: groqKey, baseURL: "https://api.groq.com/openai/v1" });
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: "You are a brief, technical copywriter. No fluff." },
            { role: "user", content: prompt }
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.1,
          max_tokens: 500,
        });

        text = chatCompletion.choices[0].message.content || "";
        text = text.replace(/```html|```/g, "").trim();
        return NextResponse.json({ text });
      } catch (err: any) {
        console.error("Groq failed:", err.message);
      }
    }

    // 3. FINAL FALLBACK
    if (geminiKey) {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const prompt = `ONLY ${field} for "${name}" in ${targetLang}. DATA: ${browsingData || "None"}`;
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      let t = result.response.text();
      t = t.replace(/```html|```/g, "").trim();
      return NextResponse.json({ text: t });
    }

    throw new Error(text ? "No text generated" : "All models failed to generate content");
  } catch (error: any) {
    console.error("API Error in AI Generate:", error.message);
    return NextResponse.json({ message: error.message || "Failed to generate content" }, { status: 500 });
  }
}
