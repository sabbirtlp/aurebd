"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "../profile.module.css";
import { useState } from "react";
import { useHasHydrated } from '@/hooks/useHasHydrated';

const initialWishlist = [
  { id: "1", name: "Sakura Glow Serum", price: 2450, image: "/images/sakura-serum.png", category: "Serums" },
  { id: "2", name: "Daily Defense Sunscreen", price: 1800, image: "/images/sakura-sunscreen.png", category: "Sunscreen" },
  { id: "3", name: "Night Repair Cream", price: 3200, image: "/images/sakura-cream.png", category: "Moisturizers" },
];

export default function WishlistPage() {
  const [items, setItems] = useState(initialWishlist);
  const hasHydrated = useHasHydrated();

  const handleRemove = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    alert("Item removed from wishlist.");
  };

  const handleAddToCart = (name: string) => {
    alert(`${name} has been added to your cart!`);
  };

  if (!hasHydrated) return <div className="p-10 text-center text-slate-400">Loading Wishlist...</div>;

  return (
    <div className="animate-fade-in">
      <div className={styles.dashboardHeader}>
        <h1>My Wishlist</h1>
        <p>Your favorite skincare items saved in one place for easy access.</p>
      </div>

      <div className={styles.wishlistGrid}>
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className={styles.wishlistCard}>
              <div className={styles.wishlistImg}>
                <Image src={item.image} alt={item.name} fill style={{ objectFit: "contain" }} />
              </div>
              <div className={styles.wishlistInfo}>
                <p>{item.category}</p>
                <h4>{item.name}</h4>
                <span className={styles.price}>৳ {item.price}</span>
                <div className={styles.wishlistActions}>
                  <button 
                    className="btn-nm btn-nm-primary" 
                    onClick={() => handleAddToCart(item.name)}
                    style={{ fontSize: "0.85rem", padding: "10px 16px" }}
                  >
                    Add to Cart
                  </button>
                  <button 
                    className="btn-nm" 
                    onClick={() => handleRemove(item.id)}
                    style={{ padding: "10px", color: "#ef4444" }}
                    title="Remove from Wishlist"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyWishlist}>
            <h3>Your wishlist is empty</h3>
            <p style={{ color: "#64748b", marginBottom: "var(--sp-6)" }}>Start exploring our collections and save your favorites!</p>
            <Link href="/shop" className="btn-nm btn-nm-primary">Explore Shop</Link>
          </div>
        )}
      </div>
    </div>
  );
}

