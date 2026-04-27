import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q");

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
