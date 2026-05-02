"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from '@/features/products/ProductCard';
import styles from "./shop.module.css";
import { useLanguageStore } from "@/store/languageStore";

export default function ShopClient({ initialProducts }: { initialProducts: any[] }) {
  const { t, language } = useLanguageStore();
  const [mounted, setMounted] = useState(false);
  const [dbCategories, setDbCategories] = useState<{en: string, bn: string, slug: string}[]>([]);
  const searchParams = useSearchParams();
  const [activeCategorySlug, setActiveCategorySlug] = useState(searchParams.get('category') || "all");
  
  useEffect(() => {
    fetch("/api/admin/categories")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const cats = [
            { en: "All", bn: "সব পণ্য", slug: "all" },
            ...data.map((c: any) => ({ en: c.name, bn: c.name, slug: c.slug })) 
          ];
          setDbCategories(cats);
        }
      });
  }, []);

  // Find the active category name from the slug
  const activeCategoryName = useMemo(() => {
    const cat = dbCategories.find(c => c.slug === activeCategorySlug);
    return cat ? cat.en : "All";
  }, [activeCategorySlug, dbCategories]);

  const maxPrice = useMemo(() => {
    if (!initialProducts || initialProducts.length === 0) return 15000;
    return Math.max(...initialProducts.map(p => p.price || 0), 500);
  }, [initialProducts]);

  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState(maxPrice);
  
  // Update priceRange if maxPrice changes (e.g. after initial mount)
  useEffect(() => {
    setPriceRange(maxPrice);
  }, [maxPrice]);
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

    if (activeCategoryName === "New Arrivals") {
      result = result.filter(p => {
        const isRecent = p.createdAt && (now - new Date(p.createdAt).getTime() < FOURTEEN_DAYS_MS);
        return p.isNewArrival || isRecent;
      });
    } else if (activeCategoryName === "Best Sellers") {
      result = result.filter(p => p.isBestSeller || (p.soldCount && p.soldCount >= 20));
    } else if (activeCategoryName === "Special Offers" || activeCategoryName === "Offers") {
      result = result.filter(p => p.isSpecialOffer || (p.discountPrice && p.discountPrice < p.price));
    } else if (activeCategoryName === "Gift Sets") {
      result = result.filter(p => p.isGiftSet || p.category === "Sets");
    } else if (activeCategoryName !== "All") {
      const categoryMap: any = {
        "Skin Essentials": ["Sets"],
        "Skincare Set": ["Sets", "Skin Essentials", "skincare-set"],
        "Radiance Serums": ["Serums", "Serum", "radiance-serums"],
        "Serum": ["Serums", "Serum", "serum"],
        "Hydration Creams": ["Creams", "Cream", "Essence Cream", "hydration-creams", "essence-cream"],
        "Essence Cream": ["Creams", "Cream", "Essence Cream", "essence-cream"],
        "UV Protection": ["Sunscreen", "UV", "uv-protection"],
        "Sunscreen": ["Sunscreen", "UV", "sunscreen"],
        "Cleansers": ["Cleansers", "Cleanser", "cleansers"]
      };
      
      const targetCategories = categoryMap[activeCategoryName] || [activeCategoryName];
      // Also always include the slug itself in target categories to ensure direct matching
      if (!targetCategories.includes(activeCategorySlug)) {
        targetCategories.push(activeCategorySlug);
      }
      
      result = result.filter(p => {
        const pCat = p.category;
        const pCats = p.categories || [];
        
        return targetCategories.some((tc: string) => {
          const tcLower = tc.toLowerCase();
          return (
            (pCat && pCat.toLowerCase() === tcLower) ||
            pCats.some((c: string) => c.toLowerCase() === tcLower) ||
            (pCat && pCat === tc)
          );
        });
      });
    }

    // Filter by Price
    result = result.filter(p => p.price <= priceRange);

    // Sort
    if (sortBy === "lowToHigh") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "highToLow") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      result.reverse(); 
    }

    return result;
  }, [activeCategoryName, sortBy, priceRange, initialProducts]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const currentProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Sync with URL params
  useEffect(() => {
    const page = Number(searchParams.get('page')) || 1;
    setCurrentPage(page);
    
    const catSlug = searchParams.get('category') || "all";
    setActiveCategorySlug(catSlug);
  }, [searchParams]);

  // Reset to page 1 when filters change (except price)
  useEffect(() => {
    setCurrentPage(1);
    const params = new URLSearchParams(window.location.search);
    params.set('page', '1');
    if (activeCategorySlug !== "all") {
      params.set('category', activeCategorySlug);
    } else {
      params.delete('category');
    }
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeCategorySlug, sortBy]);

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
                  key={cat.slug}
                  className={`${styles.categoryPill} ${activeCategorySlug === cat.slug ? styles.active : ""}`}
                  onClick={() => setActiveCategorySlug(cat.slug)}
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
                    min="0" 
                    max={maxPrice} 
                    step="100" 
                    value={priceRange} 
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className={styles.priceRange}
                    style={{
                      background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${(priceRange / maxPrice) * 100}%, var(--nm-inner-pressed) ${(priceRange / maxPrice) * 100}%, var(--nm-inner-pressed) 100%)`
                    }}
                    aria-label="Price range"
                  />
                  <span className="font-bold text-[var(--primary)] whitespace-nowrap">
                    {language === 'bn' ? `৳${priceRange.toLocaleString()}` : `Up to ৳${priceRange.toLocaleString()}`}
                  </span>
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
                    `আমরা '${activeCategoryName}' ক্যাটাগরিতে এই মুহূর্তে কোনো পণ্য খুঁজে পাইনি।` : 
                    `We couldn't find any products in the '${activeCategoryName}' category right now.`
                  }
                </p>
                <p className={styles.noResultsHint}>
                  {language === 'bn' ? 'অন্যান্য ক্যাটাগরি বা ফিল্টার ব্যবহার করে দেখুন।' : 'Try exploring our other categories or resetting your filters.'}
                </p>
                <button 
                  className="btn-nm" 
                  onClick={() => {
                    setActiveCategorySlug("all");
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
