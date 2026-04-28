import { getProducts } from '@/services/product.service';
import HomeClient from './HomeClient';

export default async function Home() {
  const products = await getProducts() || [];

  return <HomeClient products={products} />;
}
