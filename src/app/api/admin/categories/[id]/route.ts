import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, slug } = await req.json();
    if (!name || !slug) {
      return NextResponse.json({ message: "Name and slug are required" }, { status: 400 });
    }

    await dbConnect();
    
    // Check if another category has the same slug
    const existing = await Category.findOne({ slug, _id: { $ne: params.id } });
    if (existing) {
      return NextResponse.json({ message: "Category with this slug already exists" }, { status: 400 });
    }

    const category = await Category.findByIdAndUpdate(params.id, { name, slug }, { new: true });
    if (!category) return NextResponse.json({ message: "Category not found" }, { status: 404 });

    return NextResponse.json(category);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const category = await Category.findByIdAndDelete(params.id);
    if (!category) return NextResponse.json({ message: "Category not found" }, { status: 404 });

    return NextResponse.json({ message: "Category deleted" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to delete category" }, { status: 500 });
  }
}
