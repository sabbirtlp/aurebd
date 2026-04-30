import dbConnect from "@/lib/db";
import Testimonial from "@/models/Testimonial";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

// PUT — update testimonial
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const testimonial = await Testimonial.findByIdAndUpdate(params.id, body, { new: true });
    return NextResponse.json({ success: true, testimonial });
  } catch (error) {
    return NextResponse.json({ message: "Failed to update testimonial" }, { status: 500 });
  }
}

// DELETE testimonial
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    await Testimonial.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: "Testimonial deleted" });
  } catch (error) {
    return NextResponse.json({ message: "Failed to delete testimonial" }, { status: 500 });
  }
}
