"use client";

import { useState, useMemo } from "react";
import ProductCard from "@/components/ProductCard";
import styles from "./shop.module.css";
import Image from "next/image";

export default function ShopPage({ initialProducts }: { initialProducts: any[] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const categories = ["All", "Sets", "Sunscreen", "Serums", "Creams", "Cleansers"];

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...initialProducts];

    // Filtering
    if (activeCategory !== "All") {
      result = result.filter(p => p.category === activeCategory);
    }

    // Sorting
    if (sortBy === "lowToHigh") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "highToLow") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      // Assuming initial order is newest or we'd need a date field
      result = result; 
    }

    return result;
  }, [activeCategory, sortBy, initialProducts]);

  return (
    <main className="animate-fade-in">
      {/* SHOP HERO */}
      <section className={styles.shopHero}>
        <div className="container">
          <div className={styles.heroContent}>
            <h1>Discover Your Glow</h1>
            <p>Premium Japanese Skincare for every skin type</p>
          </div>
        </div>
        <div className={styles.heroImage}>
          <Image 
            src="/images/premium-hero-bg.png" 
            alt="Shop Banner" 
            fill 
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
      </section>

      {/* FILTER BAR */}
      <section className={`${styles.filterBar} container`}>
        <div className={styles.filterWrapper}>
          <div className={styles.filterGroup}>
            {categories.map((cat) => (
              <button 
                key={cat}
                className={`${styles.filterBtn} ${activeCategory === cat ? styles.active : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === "All" ? "All Products" : cat}
              </button>
            ))}
          </div>
          <div className={styles.sortGroup}>
            <span style={{ fontSize: "0.9rem", color: "var(--text-light)" }}>Sort by:</span>
            <select 
              className={styles.sortSelect} 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="lowToHigh">Price: Low to High</option>
              <option value="highToLow">Price: High to Low</option>
            </select>
          </div>
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section className="section container">
        <div className={styles.productGrid}>
          {filteredAndSortedProducts.length > 0 ? (
            filteredAndSortedProducts.map((product: any) => (
              <ProductCard key={product._id} product={product} styles={styles} />
            ))
          ) : (
            <div className={styles.noResults}>
              <h3>No products found in this category</h3>
              <button className="btn-nm" onClick={() => setActiveCategory("All")}>Clear Filters</button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
