import { getProducts } from "@/actions/product";
import ShopClient from "./ShopClient";

export default async function ShopPage() {
  const products = await getProducts() || [];

  return <ShopClient initialProducts={products} />;
}
