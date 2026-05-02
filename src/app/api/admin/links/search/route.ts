import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (query.length < 2) {
      return NextResponse.json([]);
    }

    await dbConnect();

    // Static Pages
    const staticPages = [
      { name: "Home Page", url: "/" },
      { name: "Shop", url: "/shop" },
      { name: "About Us", url: "/about" },
      { name: "FAQ", url: "/faq" },
      { name: "Contact", url: "/contact" },
      { name: "Terms of Service", url: "/terms-of-service" },
      { name: "Privacy Policy", url: "/privacy-policy" },
    ].filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.url.includes(query.toLowerCase()));

    // Search Categories
    const categories = await Category.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { slug: { $regex: query, $options: "i" } }
      ]
    }).limit(5).lean();

    const categoryLinks = categories.map((c: any) => ({
      name: `Category: ${c.name}`,
      url: `/category/${c.slug}`
    }));

    // Search Products
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { slug: { $regex: query, $options: "i" } }
      ]
    }).limit(10).lean();

    const productLinks = products.map((p: any) => ({
      name: `Product: ${p.name}`,
      url: `/product/${p.slug || p._id}`
    }));

    return NextResponse.json([...staticPages, ...categoryLinks, ...productLinks]);
  } catch (error) {
    return NextResponse.json({ message: "Failed to search links" }, { status: 500 });
  }
}
