import { getProducts } from '@/services/product.service';
import HomeClient from './HomeClient';

export const revalidate = 3600; // revalidate at most every hour

export default async function Home() {
  const products = await getProducts() || [];

  return <HomeClient products={products} />;
}
