import { getFeaturedProducts } from '@/services/product.service';
import HomeClient from './HomeClient';

export const revalidate = 3600; // revalidate at most every hour

export default async function Home() {
  const products = await getFeaturedProducts();

  return <HomeClient products={JSON.parse(JSON.stringify(products))} />;
}
