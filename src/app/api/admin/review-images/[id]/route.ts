import dbConnect from "@/lib/db";
import ReviewImage from "@/models/ReviewImage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

// PUT — update review image
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const image = await ReviewImage.findByIdAndUpdate(params.id, body, { new: true });
    return NextResponse.json({ success: true, image });
  } catch (error) {
    return NextResponse.json({ message: "Failed to update review image" }, { status: 500 });
  }
}

// DELETE review image
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    await ReviewImage.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: "Review image deleted" });
  } catch (error) {
    return NextResponse.json({ message: "Failed to delete review image" }, { status: 500 });
  }
}
