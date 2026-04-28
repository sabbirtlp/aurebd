import "server-only";

import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function seedDatabase() {
  await dbConnect();

  // Create admin user if not exists
  const adminExists = await User.findOne({ email: "admin@aureabd.com" });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await User.create({
      name: "Admin User",
      email: "admin@aureabd.com",
      password: hashedPassword,
      role: "admin",
    });
  }

  // Seed default products
  const count = await Product.countDocuments();
  if (count === 0) {
    const defaultProducts = [
      { name: "Laikou Japan Sakura 5pcs Skincare Set", slug: "laikou-japan-sakura-5pcs-skincare-set", description: "Complete 5pcs set for glowing skin.", price: 1250, image: "/images/sakura-set.png", stock: 50, category: "Sets" },
      { name: "Japan Sakura Sunscreen", slug: "japan-sakura-sunscreen", description: "SPF 50 protection with Sakura extract.", price: 450, image: "/images/sakura-sunscreen.png", stock: 100, category: "Sunscreen" },
      { name: "Japan Sakura Essence Cream", slug: "japan-sakura-essence-cream", description: "Deeply moisturizing essence cream.", price: 550, image: "/images/sakura-cream.png", stock: 80, category: "Creams" },
      { name: "Japan Sakura Eye Cream", slug: "japan-sakura-eye-cream", description: "Reduces dark circles and puffiness.", price: 350, image: "/images/sakura-eye-cream.png", stock: 120, category: "Creams" },
      { name: "Japan Sakura Serum", slug: "japan-sakura-serum", description: "Brightening and anti-aging serum.", price: 400, image: "/images/sakura-serum.png", stock: 90, category: "Serums" },
      { name: "Japan Sakura Facewash", slug: "japan-sakura-facewash", description: "Gentle daily cleanser.", price: 300, image: "/images/sakura-facewash.png", stock: 150, category: "Cleansers" },
    ];
    await Product.insertMany(defaultProducts);
  }

  return { success: true };
}

export async function getProducts() {
  try {
    await dbConnect();
    const products = await Product.find({}).lean();
    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error("Failed to fetch products or connect to DB:", error);
    return null;
  }
}

export async function getProductBySlug(slug: string) {
  try {
    await dbConnect();
    // Try by slug first, then by ID as fallback
    let product = await Product.findOne({ slug }).lean();
    if (!product && slug.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(slug).lean();
    }
    if (!product) return null;
    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    console.error("Failed to fetch product by slug:", error);
    return null;
  }
}

export async function getProductById(id: string) {
  return getProductBySlug(id); // Proxy for compatibility
}
