"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguageStore } from "@/store/languageStore";
import styles from "./headerSearch.module.css";

export default function HeaderSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { t } = useLanguageStore();

  // Debounce effect
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setShowDropdown(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch (error) {
        console.error("Search fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      router.push(`/product/${results[selectedIndex]._id}`);
      setShowDropdown(false);
      setQuery("");
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  return (
    <div className={styles.searchWrapper} ref={dropdownRef}>
      <div className={styles.inputGroup}>
        <input
          type="text"
          placeholder={t('nav.search')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowDropdown(true)}
          className={styles.searchInput}
        />
        <div className={styles.searchIcon}>
          {isLoading ? (
            <div className={styles.loader}></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          )}
        </div>
      </div>

      {showDropdown && (
        <div className={styles.dropdown}>
          {results.length > 0 ? (
            results.map((product, index) => (
              <Link
                key={product._id}
                href={`/product/${product._id}`}
                className={`${styles.resultItem} ${selectedIndex === index ? styles.selected : ""}`}
                onClick={() => {
                  setShowDropdown(false);
                  setQuery("");
                }}
              >
                <div className={styles.productImg}>
                  <Image src={product.image} alt={product.name} fill style={{ objectFit: "contain" }} />
                </div>
                <div className={styles.productInfo}>
                  <div className={styles.nameRow}>
                    <h4>{product.name}</h4>
                    {product.stock < 10 && <span className={styles.stockLabel}>{t('search.limited')}</span>}
                  </div>
                  <p>{product.category}</p>
                  <span className={styles.price}>৳ {product.price}</span>
                </div>
              </Link>
            ))
          ) : !isLoading ? (
            <div className={styles.noResults}>{t('search.no_results')} &quot;{query}&quot;</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
