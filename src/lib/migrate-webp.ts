import dbConnect from "@/lib/db";
import mongoose from "mongoose";

// Minimal model for migration
const ContentSchema = new mongoose.Schema({
  value: String,
});
const Content = mongoose.models.Content || mongoose.model("Content", ContentSchema);

const ProductSchema = new mongoose.Schema({
  image: String,
});
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

export async function migrateToWebp() {
  await dbConnect();
  console.log("Starting WebP migration...");

  // 1. Update CMS Content
  const contents = await Content.find({ value: { $regex: /\.(png|jpg|jpeg)$/i } });
  console.log(`Found ${contents.length} CMS items to update.`);
  
  for (const doc of contents) {
    doc.value = doc.value.replace(/\.(png|jpg|jpeg)$/i, ".webp");
    await doc.save();
  }

  // 2. Update Products
  const products = await Product.find({ image: { $regex: /\.(png|jpg|jpeg)$/i } });
  console.log(`Found ${products.length} Products to update.`);

  for (const doc of products) {
    doc.image = doc.image.replace(/\.(png|jpg|jpeg)$/i, ".webp");
    await doc.save();
  }

  console.log("Migration complete!");
}
