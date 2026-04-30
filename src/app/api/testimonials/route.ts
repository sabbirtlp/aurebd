import dbConnect from "@/lib/db";
import Testimonial from "@/models/Testimonial";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang") || "en";
    
    await dbConnect();
    const testimonials = await Testimonial.find({ language: lang }).sort({ createdAt: -1 });
    return NextResponse.json({ testimonials });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch testimonials" }, { status: 500 });
  }
}
