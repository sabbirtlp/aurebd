"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import styles from "./productCard.module.css";
import { useState } from "react";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    image: string;
    stock: number;
    category?: string;
  };
  styles?: any; // kept for backwards compatibility but unused
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, toggleCart } = useCartStore();
  const [isWishlisted, setIsWishlisted] = useState(false);

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
    toggleCart(true);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className={styles.card}>
      <Link href={`/product/${product._id}`} className={styles.imageWrapper}>
        <Image 
          src={product.image} 
          alt={product.name} 
          fill 
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={styles.image}
        />
        
        {/* Wishlist Button */}
        <button 
          className={styles.wishlistBtn} 
          onClick={handleWishlist}
          aria-label="Add to wishlist"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill={isWishlisted ? "var(--accent)" : "none"} 
            stroke={isWishlisted ? "var(--accent)" : "currentColor"} 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>

        {/* Quick Add Button */}
        <button 
          className={styles.quickAddBtn} 
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
        >
          {product.stock > 0 ? "Quick Add" : "Out of Stock"}
        </button>
      </Link>
      
      <div className={styles.info}>
        <div className={styles.brand}>{product.category || "Aurea BD"}</div>
        <Link href={`/product/${product._id}`} className={styles.name}>
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
