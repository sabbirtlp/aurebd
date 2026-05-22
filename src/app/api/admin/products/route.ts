import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

// GET all products (admin)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const products = await Product.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ products: JSON.parse(JSON.stringify(products)) });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch products" }, { status: 500 });
  }
}

// CREATE a new product
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { 
      name, description, shortDescription, price, discountPrice, image, gallery, 
      stock, category, categories, isNewArrival, isBestSeller, isSpecialOffer, 
      isGiftSet, ingredients, howToUse, badgeText, showOriginalStamp
    } = body;

    // Auto-generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const product = await Product.create({
      name,
      slug,
      description,
      shortDescription,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      image,
      gallery: gallery || [],
      stock: Number(stock),
      category,
      categories: categories || [],
      isNewArrival: Boolean(isNewArrival),
      isBestSeller: Boolean(isBestSeller),
      isSpecialOffer: Boolean(isSpecialOffer),
      isGiftSet: Boolean(isGiftSet),
      ingredients,
      howToUse,
      badgeText,
      showOriginalStamp: Boolean(showOriginalStamp),
    });

    // Revalidate cache
    const { revalidateTag } = await import("next/cache");
    revalidateTag("all-products");
    revalidateTag("featured-products");

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: any) {
    console.error("Create product error:", error);
    return NextResponse.json({ message: error.message || "Failed to create product" }, { status: 500 });
  }
}
