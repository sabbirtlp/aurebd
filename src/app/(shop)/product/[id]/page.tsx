import { getProductById, getProducts } from '@/services/product.service';
import ProductClient from "./ProductClient";
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);
  const allProducts = await getProducts() || [];
  
  if (!product) {
    notFound();
  }

  // Filter out current product and get 4 related ones from same category
  let relatedProducts = allProducts
    .filter((p: any) => p._id !== product._id && p.category === product.category)
    .slice(0, 4);

  // Fallback: If no products in the same category, just show any other products
  if (relatedProducts.length === 0) {
    relatedProducts = allProducts
      .filter((p: any) => p._id !== product._id)
      .slice(0, 4);
  }

  return <ProductClient product={product} relatedProducts={relatedProducts} />;
}
