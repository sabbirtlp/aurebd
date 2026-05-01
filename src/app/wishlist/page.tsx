"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { toast } from "react-toastify";
import { useHasHydrated } from "@/hooks/useHasHydrated";
import styles from "./wishlist.module.css";

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const { addItem } = useCartStore();
  const hasHydrated = useHasHydrated();

  const handleAddToCart = (item: any) => {
    if (item.stock <= 0) return;
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
    });
    toast.success(`Added ${item.name} to cart`);
  };

  useEffect(() => {
    if (hasHydrated) {
      window.scrollTo(0, 0);
    }
  }, [hasHydrated]);

  if (!hasHydrated) {
    return (
      <div className={styles.pageContainer}>
        <div className="container">
          <div className={styles.header}>
            <h1 className={styles.title}>My Wishlist</h1>
            <p className={styles.subtitle}>Curating your favorite skincare essentials...</p>
          </div>
          <div className={styles.grid}>
            {[1, 2, 3].map(i => (
              <div key={i} className={styles.skeletonCard} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.pageContainer} animate-fade-in`}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>My Wishlist</h1>
          <p className={styles.subtitle}>
            Your favorite skincare essentials, saved beautifully in one place.
          </p>
        </div>

        {items.length > 0 ? (
          <div className={styles.grid}>
            {items.map((item) => (
              <div key={item.id} className={styles.wishlistCard}>
                <button
                  className={styles.removeBtn}
                  onClick={() => removeItem(item.id)}
                  aria-label="Remove from wishlist"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                
                <Link href={`/product/${item.id}`} className={styles.imageWrapper}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className={styles.image}
                  />
                </Link>
                
                <div className={styles.content}>
                  <div className={styles.category}>{item.category}</div>
                  <Link href={`/product/${item.id}`} className={styles.name}>
                    {item.name}
                  </Link>
                  <div className={styles.price}>৳ {item.price.toLocaleString()}</div>
                  
                  <div className={styles.actions}>
                    <button
                      className={styles.addToCartBtn}
                      onClick={() => handleAddToCart(item)}
                      disabled={item.stock <= 0}
                    >
                      {item.stock > 0 ? "Add to Cart" : "Out of Stock"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🤍</div>
            <h3 className={styles.emptyTitle}>Your wishlist is empty</h3>
            <p className={styles.emptyDesc}>
              Discover the purest essence of Japanese skincare and save your favorites here.
            </p>
            <Link href="/shop" className={styles.exploreBtn}>
              Explore Collection
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
