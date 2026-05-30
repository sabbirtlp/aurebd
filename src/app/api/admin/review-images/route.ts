import dbConnect from "@/lib/db";
import ReviewImage from "@/models/ReviewImage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

// GET all review images (Admin)
export async function GET() {
  try {
    await dbConnect();
    const images = await ReviewImage.find({}).sort({ order: 1, createdAt: -1 });
    return NextResponse.json({ images });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch review images" }, { status: 500 });
  }
}

// POST create new review image
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const image = await ReviewImage.create(body);
    return NextResponse.json({ success: true, image });
  } catch (error) {
    return NextResponse.json({ message: "Failed to create review image" }, { status: 500 });
  }
}
