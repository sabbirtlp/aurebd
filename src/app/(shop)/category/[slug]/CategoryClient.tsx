"use client";

import ProductCard from '@/features/products/ProductCard';
import styles from "../../shop/shop.module.css";
import { useLanguageStore } from "@/store/languageStore";
import Link from 'next/link';

export default function CategoryClient({ category, products }: { category: any, products: any[] }) {
  const { language } = useLanguageStore();

  return (
    <div className={`animate-fade-in ${styles.shopPage}`}>
      <div className="container">
        
        <nav className="flex items-center gap-2 mb-8 opacity-60 text-sm">
          <Link href="/shop" className="hover:text-[var(--primary)] transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-[var(--primary)]">{category.name}</span>
        </nav>

        {/* SECTION HEADER */}
        <header className={styles.sectionHeader}>
          <h1>{category.name}</h1>
          <p>
            {language === 'bn' 
              ? `${category.name} কালেকশন থেকে আপনার পছন্দের পণ্যগুলো বেছে নিন।` 
              : `Explore our premium selection of ${category.name} products.`
            }
          </p>
        </header>

        {/* PRODUCT GRID */}
        <div className={styles.shopLayout}>
          <div className={styles.productGrid}>
            {products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <div className={styles.noResults}>
                <div className={styles.noResultsIcon}>✨</div>
                <h3>{language === 'bn' ? 'দুঃখিত, কোনো পণ্য পাওয়া যায়নি' : 'Oops! No products found'}</h3>
                <p>
                  {language === 'bn' ? 
                    `আমরা এই ক্যাটাগরিতে এই মুহূর্তে কোনো পণ্য খুঁজে পাইনি।` : 
                    `We couldn't find any products in the ${category.name} category right now.`
                  }
                </p>
                <Link href="/shop" className="btn-nm mt-6">
                  {language === 'bn' ? 'সব পণ্য দেখুন' : 'Browse All Products'}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
