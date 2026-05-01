import { getProducts } from '@/services/product.service';
import HomeClient from './HomeClient';
import { migrateToWebp } from '@/lib/migrate-webp';

export const revalidate = 3600; // revalidate at most every hour

export default async function Home() {
  // One-time migration trigger
  if (process.env.NODE_ENV === 'development') {
    await migrateToWebp().catch(console.error);
  }
  
  const products = await getProducts() || [];

  return <HomeClient products={products} />;
}
