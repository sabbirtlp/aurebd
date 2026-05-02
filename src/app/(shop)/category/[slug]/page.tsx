import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import CategoryClient from "./CategoryClient";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  await dbConnect();
  const category = await Category.findOne({ slug: params.slug }).lean();
  
  if (!category) return { title: "Category Not Found" };

  return {
    title: `${category.name} - Aurea BD`,
    description: `Browse our collection of ${category.name} products at Aurea BD.`,
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  await dbConnect();
  
  const category = await Category.findOne({ slug: params.slug }).lean();
  if (!category) notFound();

  // Find products that have this category slug in their categories array or as their main category
  const products = await Product.find({
    $or: [
      { category: params.slug },
      { categories: params.slug }
    ]
  }).sort({ createdAt: -1 }).lean();

  return (
    <CategoryClient 
      category={JSON.parse(JSON.stringify(category))} 
      products={JSON.parse(JSON.stringify(products))} 
    />
  );
}
