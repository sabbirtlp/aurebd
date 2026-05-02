import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ message: "AI API Key not configured. Please add GEMINI_API_KEY to your environment variables." }, { status: 500 });
    }

    // Initialize inside handler to ensure fresh ENV
    const genAI = new GoogleGenerativeAI(apiKey);
    const { name, category, features, field } = await req.json();

    // Fallback logic for models
    const modelNames = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
    let text = "";
    let lastError = null;

    let prompt = "";
    if (field === "description") {
      prompt = `Generate a luxury skincare product description for a product named "${name}" in the "${category}" category. 
      Key features: ${features}. 
      Style: Elegant, persuasive, and professional. 
      Format: A single paragraph of about 100-150 words. Do not use markdown headers.`;
    } else if (field === "ingredients") {
      prompt = `Generate a list of ingredients for a luxury skincare product named "${name}" (${category}). 
      Key features: ${features}. 
      Style: Scientific yet accessible. 
      Format: A clean bulleted list of premium ingredients. Use HTML <ul> and <li> tags.`;
    } else if (field === "howToUse") {
      prompt = `Generate "How To Use" instructions for a skincare product named "${name}" (${category}). 
      Key features: ${features}. 
      Style: Instructional and spa-like. 
      Format: A numbered list of 3-5 steps. Use HTML <ol> and <li> tags.`;
    }

    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        text = response.text();
        if (text) break; // Success!
      } catch (err: any) {
        console.warn(`Model ${modelName} failed, trying next...`, err.message);
        lastError = err;
        continue;
      }
    }

    if (!text) {
      throw lastError || new Error("All AI models failed to respond");
    }

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    // Return more specific error if possible
    const errorMessage = error.message || "AI Generation failed";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
