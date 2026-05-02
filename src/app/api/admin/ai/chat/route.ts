import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_CONTEXT = `
You are the Aurea BD Admin Assistant. Aurea BD is a luxury Japanese skincare brand in Bangladesh.
Brand Tone: Premium, Sophisticated, Trustworthy, and Helpful.
Core Products: Sakura-based skincare sets, radiance serums, hydration creams, and UV protection.
Your Goal: Help the admin manage the website, generate marketing copy, write product descriptions, or answer questions about the brand's digital presence.
Always maintain a professional and helpful tone. Format your responses using clean HTML or simple text.
`;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ message: "AI API Key not configured." }, { status: 500 });
    }

    const { messages } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: SYSTEM_CONTEXT }] },
        { role: "model", parts: [{ text: "Understood. I am the Aurea BD Admin Assistant, ready to help manage the luxury skincare platform." }] },
        ...messages.slice(0, -1).map((m: any) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }]
        }))
      ],
    });

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return NextResponse.json({ message: "AI Chat failed" }, { status: 500 });
  }
}
