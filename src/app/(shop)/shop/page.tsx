import { Suspense } from "react";
import { getProducts } from '@/services/product.service';
import ShopClient from "./ShopClient";

export default async function ShopPage() {
  const products = await getProducts() || [];

  return <ShopClient initialProducts={products} />;
}
