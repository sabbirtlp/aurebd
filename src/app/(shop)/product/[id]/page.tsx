import { getProductById, getRelatedProducts, getProducts } from '@/services/product.service';
import ProductClient from "./ProductClient";
import { notFound } from "next/navigation";

export const revalidate = 3600;

// Pre-build all known product pages at build time
export async function generateStaticParams() {
  try {
    const products = await getProducts();
    if (!products) return [];
    return products.map((p: any) => ({
      id: p.slug || p._id.toString(),
    }));
  } catch {
    return [];
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);
  
  if (!product) {
    notFound();
  }

  // Fetch related products in parallel — don't wait sequentially
  const relatedProducts = await getRelatedProducts(product._id, product.category, 4);

  return <ProductClient product={product} relatedProducts={relatedProducts} />;
}

