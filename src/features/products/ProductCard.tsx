"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useLanguageStore } from "@/store/languageStore";
import { toast } from "react-toastify";
import styles from "./productCard.module.css";
import { useEffect, useState } from "react";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    image: string;
    stock: number;
    category?: string;
  slug?: string;
  };
  styles?: any; // kept for backwards compatibility but unused
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { addItem: addWishlistItem, removeItem: removeWishlistItem } = useWishlistStore();
  const isWishlisted = useWishlistStore((state) => state.items.some((i) => i.id === product._id));
  const { language } = useLanguageStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
    toast.success(language === 'bn' ? `${product.name} কার্টে যোগ করা হয়েছে` : `Added ${product.name} to cart`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isWishlisted) {
      removeWishlistItem(product._id);
      toast.info(language === 'bn' ? `${product.name} উইশলিস্ট থেকে সরানো হয়েছে` : `${product.name} removed from wishlist`, {
        icon: <span>🤍</span>
      });
    } else {
      addWishlistItem({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category || "Aurea BD",
        stock: product.stock,
      });
      toast.success(language === 'bn' ? `${product.name} উইশলিস্টে যোগ করা হয়েছে` : `${product.name} added to wishlist`, {
        icon: <span>❤️</span>
      });
    }
  };

  return (
    <div className={styles.card}>
      <div style={{ position: "relative", width: "100%" }}>
        <Link href={`/product/${product.slug || product._id}`} className={styles.imageWrapper}>
          <Image 
            src={product.image} 
            alt={product.name} 
            fill 
            sizes="(max-width: 600px) 100vw, (max-width: 992px) 50vw, 350px"
            className={styles.image}
          />
        </Link>
        
        {/* Wishlist Button */}
        <button 
          className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlisted : ""}`} 
          onClick={handleWishlist}
          aria-label="Add to wishlist"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill={isWishlisted ? "currentColor" : "none"} 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>
      
      {/* Quick Add Button - Now always visible below image */}
      <button 
        className={styles.quickAddBtn} 
        onClick={handleAddToCart}
        disabled={product.stock <= 0}
      >
        {product.stock > 0 
          ? (language === 'bn' ? 'কার্টে যোগ করুন' : 'Quick Add') 
          : (language === 'bn' ? 'স্টক নেই' : 'Out of Stock')
        }
      </button>

      <div className={styles.info}>
        <div className={styles.brand}>{product.category || "Aurea BD"}</div>
        <Link href={`/product/${product.slug || product._id}`} className={styles.name}>
          {product.name}
        </Link>
        <div className={styles.priceRow}>
          <span className={styles.price}>৳ {product.price.toLocaleString()}</span>
          <div className={styles.rating}>
            <span className={styles.ratingStar}>★</span> 4.8
          </div>
        </div>
      </div>
    </div>
  );
}
