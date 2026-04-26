"use client";

import { useState, useMemo } from "react";
import ProductCard from '@/features/products/ProductCard';
import styles from "./shop.module.css";
import Image from "next/image";

const CATEGORIES = ["All", "Sets", "Sunscreen", "Serums", "Creams", "Cleansers"];
const RATINGS = [4, 3, 2]; // 4 & up, etc.

export default function ShopClient({ initialProducts }: { initialProducts: any[] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState(10000); // Max 10k for example
  const [inStockOnly, setInStockOnly] = useState(false);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...initialProducts];

    // Filter by Category
    if (activeCategory !== "All") {
      result = result.filter(p => p.category === activeCategory);
    }

    // Filter by Price
    result = result.filter(p => p.price <= priceRange);

    // Filter by Stock
    if (inStockOnly) {
      result = result.filter(p => p.stock > 0);
    }

    // Sort
    if (sortBy === "lowToHigh") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "highToLow") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      // Assuming sorting logic or API returns newest by default
    }

    return result;
  }, [activeCategory, sortBy, priceRange, inStockOnly, initialProducts]);

  return (
    <div className={`animate-fade-in ${styles.shopPage}`}>
      {/* PREMIUM HERO */}
      <section className={styles.shopHero}>
        <div className={styles.heroImage}>
          <Image 
            src="/images/premium-hero-bg.png" 
            alt="Premium Skincare Collection" 
            fill 
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
        <div className={`container ${styles.heroContent}`}>
          <h1>Elevate Your Routine</h1>
          <p>Discover our curated collection of high-end Japanese skincare, designed to illuminate and restore your natural glow.</p>
          <button className={styles.shopNowBtn} onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}>
            Explore Collection
          </button>
        </div>
      </section>

      {/* SHOP LAYOUT */}
      <section className={`container ${styles.shopLayout}`}>
        
        {/* SIDEBAR FILTERS */}
        <aside className={styles.sidebar}>
          {/* Categories */}
          <div className={styles.filterSection}>
            <h3>Categories</h3>
            <div className={styles.categoryList}>
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  className={`${styles.categoryBtn} ${activeCategory === cat ? styles.active : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat === "All" ? "All Products" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className={styles.filterSection}>
            <h3>Price Range</h3>
            <input 
              type="range" 
              min="0" 
              max="15000" 
              step="500" 
              value={priceRange} 
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className={styles.priceRange}
            />
            <div className={styles.priceLabels}>
              <span>৳ 0</span>
              <span>Up to ৳ {priceRange.toLocaleString()}</span>
            </div>
          </div>

          {/* Availability */}
          <div className={styles.filterSection}>
            <h3>Availability</h3>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              In Stock Only
            </label>
          </div>
        </aside>

        {/* MAIN PRODUCT AREA */}
        <div>
          {/* TOP BAR */}
          <div className={styles.topBar}>
            <div className={styles.resultCount}>
              Showing <strong>{filteredAndSortedProducts.length}</strong> products
            </div>
            <div>
              <select 
                className={styles.sortDropdown}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Sort by: Newest Arrivals</option>
                <option value="lowToHigh">Sort by: Price Low to High</option>
                <option value="highToLow">Sort by: Price High to Low</option>
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
                <h3>No products match your criteria</h3>
                <p style={{ color: '#666', marginBottom: '16px' }}>Try adjusting your filters or search terms.</p>
                <button 
                  className="btn-nm" 
                  onClick={() => {
                    setActiveCategory("All");
                    setPriceRange(10000);
                    setInStockOnly(false);
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          {/* PAGINATION MOCK */}
          {filteredAndSortedProducts.length > 0 && (
            <div className={styles.pagination}>
              <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
              <button className={styles.pageBtn}>2</button>
              <button className={styles.pageBtn}>&gt;</button>
            </div>
          )}
        </div>

      </section>
    </div>
  );
}
