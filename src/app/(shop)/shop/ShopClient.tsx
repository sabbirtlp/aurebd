"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from '@/features/products/ProductCard';
import styles from "./shop.module.css";
import { useLanguageStore } from "@/store/languageStore";

const CATEGORIES = [
  { en: "All", bn: "সব পণ্য" },
  { en: "Skin Essentials", bn: "স্কিন এসেনশিয়ালস" },
  { en: "Radiance Serums", bn: "রেডিয়েন্স সিরাম" },
  { en: "Hydration Creams", bn: "হাইড্রেশন ক্রিম" },
  { en: "UV Protection", bn: "ইউভি প্রোটেকশন" },
  { en: "Cleansers", bn: "ক্লিনজার" }
];

export default function ShopClient({ initialProducts }: { initialProducts: any[] }) {
  const { t, language } = useLanguageStore();
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState(15000);
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const itemsPerPage = 6;

  useEffect(() => {
    setMounted(true);
  }, []);

  const tr = (key: string) => mounted ? t(key) : key;

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...initialProducts];

    if (activeCategory !== "All") {
      result = result.filter(p => p.category === activeCategory || activeCategory === "Skin Essentials");
    }

    result = result.filter(p => p.price <= priceRange);

    if (sortBy === "lowToHigh") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "highToLow") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [activeCategory, sortBy, priceRange, initialProducts]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const currentProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Sync with URL params
  useEffect(() => {
    const page = Number(searchParams.get('page')) || 1;
    setCurrentPage(page);
  }, [searchParams]);

  // Reset to page 1 when filters change (except price)
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
      const params = new URLSearchParams(window.location.search);
      params.set('page', '1');
      window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
    }
  }, [activeCategory, sortBy, currentPage]);

  return (
    <div className={`animate-fade-in ${styles.shopPage}`}>
      <div className="container">
        
        {/* SECTION HEADER */}
        <header className={styles.sectionHeader}>
          <h1>{language === 'bn' ? 'আমাদের কালেকশন' : 'Our Collection'}</h1>
          <p>{language === 'bn' ? 'আপনার ত্বকের জন্য নির্বাচিত সেরা প্রসাধনী।' : 'Curated essentials for your radiant, luminous skin.'}</p>
        </header>

        {/* SHOP LAYOUT */}
        <div className={styles.shopLayout}>
          
          {/* FLOATING FILTER BAR */}
          <div className={styles.filterBar}>
            
            {/* Categories */}
            <div className={styles.categoryGroup}>
              {CATEGORIES.map(cat => (
                <button 
                  key={cat.en}
                  className={`${styles.categoryPill} ${activeCategory === cat.en ? styles.active : ""}`}
                  onClick={() => setActiveCategory(cat.en)}
                >
                  {language === 'bn' ? cat.bn : cat.en}
                </button>
              ))}
            </div>

            {/* Filter Controls */}
            <div className={styles.filterControls}>
              
              {/* Price Slider */}
              <div className={styles.priceSliderContainer}>
                <span>{language === 'bn' ? 'মূল্য: ' : 'Price: '}</span>
                <input 
                  type="range" 
                  min="500" 
                  max="15000" 
                  step="500" 
                  value={priceRange} 
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className={styles.priceRange}
                  aria-label="Price range"
                />
                <span>{language === 'bn' ? `সর্বোচ্চ ৳${priceRange.toLocaleString()}` : `Up to ৳${priceRange.toLocaleString()}`}</span>
              </div>

              {/* Sort Dropdown */}
              <select 
                className={styles.sortDropdown}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort products"
              >
                <option value="newest">{language === 'bn' ? 'সর্ট করুন: নতুন' : 'Sort by: Newest'}</option>
                <option value="lowToHigh">{language === 'bn' ? 'সর্ট করুন: কম থেকে বেশি' : 'Sort by: Price Low-High'}</option>
                <option value="highToLow">{language === 'bn' ? 'সর্ট করুন: বেশি থেকে কম' : 'Sort by: Price High-Low'}</option>
              </select>

            </div>
          </div>

          {/* PRODUCT GRID */}
          <div className={styles.productGrid}>
            {currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <div className={styles.noResults}>
                <h3>{language === 'bn' ? 'কোনো পণ্য পাওয়া যায়নি' : 'No products found'}</h3>
                <p style={{ color: 'var(--text-light)', marginBottom: 'var(--sp-4)' }}>
                  {language === 'bn' ? 'আপনার ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।' : 'Try adjusting your filters to discover more.'}
                </p>
                <button 
                  className="btn-nm" 
                  onClick={() => {
                    setActiveCategory("All");
                    setPriceRange(15000);
                  }}
                >
                  {language === 'bn' ? 'ফিল্টার পরিষ্কার করুন' : 'Clear Filters'}
                </button>
              </div>
            )}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  className={`${styles.pageBtn} ${currentPage === pageNum ? styles.active : ""}`}
                  onClick={() => {
                    const params = new URLSearchParams(window.location.search);
                    params.set('page', pageNum.toString());
                    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
                    setCurrentPage(pageNum);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  {pageNum}
                </button>
              ))}

              <button 
                className={styles.pageBtn} 
                onClick={() => {
                  if (currentPage < totalPages) {
                    const nextPage = currentPage + 1;
                    const params = new URLSearchParams(window.location.search);
                    params.set('page', nextPage.toString());
                    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
                    setCurrentPage(nextPage);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                &gt;
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
