import dbConnect from "@/lib/db";
import Testimonial from "@/models/Testimonial";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

// GET all testimonials (Admin)
export async function GET() {
  try {
    await dbConnect();
    const testimonials = await Testimonial.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ testimonials });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch testimonials" }, { status: 500 });
  }
}

// POST create new testimonial
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const testimonial = await Testimonial.create(body);
    return NextResponse.json({ success: true, testimonial });
  } catch (error) {
    return NextResponse.json({ message: "Failed to create testimonial" }, { status: 500 });
  }
}
