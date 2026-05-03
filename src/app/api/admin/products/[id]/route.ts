import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

// GET single product
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const product = await Product.findById(params.id).lean();
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ product: JSON.parse(JSON.stringify(product)) });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch product" }, { status: 500 });
  }
}

// UPDATE product
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { 
      name, name_bn, description, description_bn, shortDescription, shortDescription_bn, 
      price, discountPrice, image, gallery, 
      stock, category, categories, isNewArrival, isBestSeller, isSpecialOffer, 
      isGiftSet, ingredients, ingredients_bn, howToUse, howToUse_bn 
    } = body;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const product = await Product.findByIdAndUpdate(
      params.id,
      { 
        name, name_bn, slug, description, description_bn, shortDescription, shortDescription_bn,
        price: Number(price), 
        discountPrice: discountPrice ? Number(discountPrice) : null,
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
        ingredients_bn,
        howToUse,
        howToUse_bn,
      },
      { new: true }
    );

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    // Revalidate cache
    const { revalidateTag } = await import("next/cache");
    revalidateTag("all-products");
    revalidateTag("featured-products");
    revalidateTag("product-by-slug");

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to update product" }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const product = await Product.findByIdAndDelete(params.id);
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    // Revalidate cache
    const { revalidateTag } = await import("next/cache");
    revalidateTag("all-products");
    revalidateTag("featured-products");

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error) {
    return NextResponse.json({ message: "Failed to delete product" }, { status: 500 });
  }
}
