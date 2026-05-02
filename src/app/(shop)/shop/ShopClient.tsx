"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from '@/features/products/ProductCard';
import styles from "./shop.module.css";
import { useLanguageStore } from "@/store/languageStore";

export default function ShopClient({ initialProducts }: { initialProducts: any[] }) {
  const { t, language } = useLanguageStore();
  const [mounted, setMounted] = useState(false);
  const [dbCategories, setDbCategories] = useState<{en: string, bn: string}[]>([]);
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || "All");
  
  useEffect(() => {
    fetch("/api/admin/categories")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const cats = [
            { en: "All", bn: "সব পণ্য" },
            ...data.map((c: any) => ({ en: c.name, bn: c.name })) // BN translation could be added to DB later
          ];
          setDbCategories(cats);
        }
      });
  }, []);
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState(15000);
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const itemsPerPage = 6;

  useEffect(() => {
    setMounted(true);
  }, []);

  const tr = (key: string) => mounted ? t(key) : key;

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...initialProducts];

    // Smart Automatic Filtering for Promotional Collections
    const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    if (activeCategory === "New Arrivals") {
      result = result.filter(p => {
        const isRecent = p.createdAt && (now - new Date(p.createdAt).getTime() < FOURTEEN_DAYS_MS);
        return p.isNewArrival || isRecent;
      });
    } else if (activeCategory === "Best Sellers") {
      result = result.filter(p => p.isBestSeller || (p.soldCount && p.soldCount >= 20));
    } else if (activeCategory === "Special Offers" || activeCategory === "Offers") {
      result = result.filter(p => p.isSpecialOffer || (p.discountPrice && p.discountPrice < p.price));
    } else if (activeCategory === "Gift Sets") {
      result = result.filter(p => p.isGiftSet || p.category === "Sets");
    } else if (activeCategory !== "All") {
      const categoryMap: any = {
        "Skin Essentials": ["Sets"],
        "Radiance Serums": ["Serums"],
        "Hydration Creams": ["Creams"],
        "UV Protection": ["Sunscreen"],
        "Cleansers": ["Cleansers"]
      };
      const targetCategories = categoryMap[activeCategory] || [activeCategory];
      result = result.filter(p => 
        targetCategories.includes(p.category) || 
        (p.categories && p.categories.some((c: string) => targetCategories.includes(c)))
      );
    }

    // Filter by Price
    result = result.filter(p => p.price <= priceRange);

    // Sort
    if (sortBy === "lowToHigh") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "highToLow") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      result.reverse(); // Assume initial order is oldest first or just reverse for "newest" feel
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
    
    const cat = searchParams.get('category') || "All";
    setActiveCategory(cat);
  }, [searchParams]);

  // Reset to page 1 when filters change (except price)
  useEffect(() => {
    setCurrentPage(1);
    const params = new URLSearchParams(window.location.search);
    params.set('page', '1');
    if (activeCategory !== "All") {
      params.set('category', activeCategory);
    } else {
      params.delete('category');
    }
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeCategory, sortBy]);

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
              {dbCategories.map(cat => (
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
                <div className={styles.noResultsIcon}>✨</div>
                <h3>{language === 'bn' ? 'দুঃখিত, কোনো পণ্য পাওয়া যায়নি' : 'Oops! No products found'}</h3>
                <p>
                  {language === 'bn' ? 
                    `আমরা '${activeCategory}' ক্যাটাগরিতে এই মুহূর্তে কোনো পণ্য খুঁজে পাইনি।` : 
                    `We couldn't find any products in the '${activeCategory}' category right now.`
                  }
                </p>
                <p className={styles.noResultsHint}>
                  {language === 'bn' ? 'অন্যান্য ক্যাটাগরি বা ফিল্টার ব্যবহার করে দেখুন।' : 'Try exploring our other categories or resetting your filters.'}
                </p>
                <button 
                  className="btn-nm" 
                  onClick={() => {
                    setActiveCategory("All");
                    setPriceRange(15000);
                  }}
                >
                  {language === 'bn' ? 'সব পণ্য দেখুন' : 'Browse All Products'}
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
