import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import { notFound } from "next/navigation";
import EditProductClient from "./EditProductClient";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  await dbConnect();
  const product = await Product.findById(params.id).lean();
  
  if (!product) {
    notFound();
  }

  return <EditProductClient product={JSON.parse(JSON.stringify(product))} />;
}
