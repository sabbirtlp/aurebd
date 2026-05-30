export const dynamic = "force-dynamic";

import dbConnect from "@/lib/db";
import ReviewImage from "@/models/ReviewImage";
import { NextResponse } from "next/server";

// GET active review images (Public)
export async function GET() {
  try {
    await dbConnect();
    const images = await ReviewImage.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    return NextResponse.json({ images });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch review images" }, { status: 500 });
  }
}
