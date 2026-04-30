import { Suspense } from "react";
import { getProducts } from '@/services/product.service';
import ShopClient from "./ShopClient";

export default async function ShopPage() {
  const products = await getProducts() || [];

  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '5rem' }}>Loading shop...</div>}>
      <ShopClient initialProducts={products} />
    </Suspense>
  );
}
