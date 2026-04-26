"use client";

import { useState, useMemo } from "react";
import ProductCard from '@/features/products/ProductCard';
import styles from "./shop.module.css";

const CATEGORIES = ["All", "Skin Essentials", "Radiance Serums", "Hydration Creams", "UV Protection", "Cleansers"];

export default function ShopClient({ initialProducts }: { initialProducts: any[] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState(15000); // Max 15k for example

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...initialProducts];

    // Filter by Category (mock mapping for demo)
    if (activeCategory !== "All") {
      result = result.filter(p => p.category === activeCategory || activeCategory === "Skin Essentials"); // relaxed filter for demo
    }

    // Filter by Price
    result = result.filter(p => p.price <= priceRange);

    // Sort
    if (sortBy === "lowToHigh") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "highToLow") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [activeCategory, sortBy, priceRange, initialProducts]);

  return (
    <div className={`animate-fade-in ${styles.shopPage}`}>
      <div className="container">
        
        {/* SECTION HEADER */}
        <header className={styles.sectionHeader}>
          <h1>Our Collection</h1>
          <p>Curated essentials for your radiant, luminous skin.</p>
        </header>

        {/* SHOP LAYOUT */}
        <div className={styles.shopLayout}>
          
          {/* FLOATING FILTER BAR */}
          <div className={styles.filterBar}>
            
            {/* Categories */}
            <div className={styles.categoryGroup}>
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  className={`${styles.categoryPill} ${activeCategory === cat ? styles.active : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Filter Controls */}
            <div className={styles.filterControls}>
              
              {/* Price Slider */}
              <div className={styles.priceSliderContainer}>
                <span>Price: </span>
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
                <span>Up to ৳{priceRange.toLocaleString()}</span>
              </div>

              {/* Sort Dropdown */}
              <select 
                className={styles.sortDropdown}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort products"
              >
                <option value="newest">Sort by: Newest</option>
                <option value="lowToHigh">Sort by: Price Low-High</option>
                <option value="highToLow">Sort by: Price High-Low</option>
              </select>

            </div>
          </div>

          {/* PRODUCT GRID */}
          <div className={styles.productGrid}>
            {filteredAndSortedProducts.length > 0 ? (
              filteredAndSortedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <div className={styles.noResults}>
                <h3>No products found</h3>
                <p style={{ color: 'var(--text-light)', marginBottom: 'var(--sp-4)' }}>Try adjusting your filters to discover more.</p>
                <button 
                  className="btn-nm" 
                  onClick={() => {
                    setActiveCategory("All");
                    setPriceRange(15000);
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* PAGINATION */}
          {filteredAndSortedProducts.length > 0 && (
            <div className={styles.pagination}>
              <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
              <button className={styles.pageBtn}>2</button>
              <button className={styles.pageBtn} aria-label="Next page">&gt;</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
