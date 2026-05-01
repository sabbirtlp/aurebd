import { getProductById, getRelatedProducts } from '@/services/product.service';
import ProductClient from "./ProductClient";
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: { params: { id: string } }) {
  // Fetch product first (we need its category for related products)
  const product = await getProductById(params.id);
  
  if (!product) {
    notFound();
  }

  // Fetch only 4 related products by category — NOT all products
  const relatedProducts = await getRelatedProducts(product._id, product.category, 4);

  return <ProductClient product={product} relatedProducts={relatedProducts} />;
}
