import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";

export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find().sort({ createdAt: -1 });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
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
    const existing = await Category.findOne({ slug });
    if (existing) {
      return NextResponse.json({ message: "Category with this slug already exists" }, { status: 400 });
    }

    const category = await Category.create({ name, slug });
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to create category" }, { status: 500 });
  }
}
