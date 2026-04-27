import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import dbConnect from "@/lib/db";
import Product from "@/models/Product";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    await dbConnect();

    // Case-insensitive search on name and description
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } }
      ]
    }).limit(5).lean();

    return NextResponse.json(products);
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
