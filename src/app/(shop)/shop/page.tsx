import { Suspense } from "react";
import { getProducts } from '@/services/product.service';
import ShopClient from "./ShopClient";

export const revalidate = 3600; // revalidate every hour

export default async function ShopPage() {
  const products = await getProducts() || [];

  return <ShopClient initialProducts={products} />;
}
