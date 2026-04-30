import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import AdminProductsClient from "./AdminProductsClient";

export default async function AdminProducts() {
  await dbConnect();
  const products = await Product.find({}).sort({ createdAt: -1 }).lean();

  return <AdminProductsClient initialProducts={JSON.parse(JSON.stringify(products))} />;
}
