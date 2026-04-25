"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    image: string;
    stock: number;
  };
  styles: any;
}

export default function ProductCard({ product, styles }: ProductCardProps) {
  const { addItem, toggleCart } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
    toggleCart(true);
  };

  return (
    <div className={styles.productCard}>
      <Link href={`/product/${product._id}`} className={styles.productImageWrapper}>
        <Image 
          src={product.image} 
          alt={product.name} 
          fill 
          className={styles.productImage}
        />
        <div className={styles.quickViewOverlay}>
          <span className="btn-nm" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}>View Details</span>
        </div>
      </Link>
      
      <div className={styles.productInfo}>
        <div className={styles.ratingStars}>
          ★★★★★ <span style={{ fontSize: "0.7rem", color: "var(--text-light)" }}>(24)</span>
        </div>
        <Link href={`/product/${product._id}`}>
          <h3 className={styles.productName}>{product.name}</h3>
        </Link>
        <p className={styles.productPrice}>৳ {product.price}</p>
        
        <button 
          className="btn-nm btn-nm-primary" 
          style={{ width: "100%", marginTop: "var(--sp-2)" }}
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
        >
          {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </div>
  );
}
