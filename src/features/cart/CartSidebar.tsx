"use client";

import { useCartStore } from "@/store/cartStore";
import Image from "next/image";
import Link from "next/link";
import styles from "./cart.module.css";
import { useLanguageStore } from "@/store/languageStore";
import { useEffect } from "react";

export default function CartSidebar() {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, getTotal } = useCartStore();
  const { language, t } = useLanguageStore();

  // Prevent scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  return (
    <div 
      className={`${styles.overlay} ${isOpen ? styles.open : styles.closed}`} 
      onClick={() => toggleCart(false)}
      style={{ zIndex: 10000 }} // Ensure it's above EVERYTHING
    >
      <div className={styles.sidebar} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 suppressHydrationWarning>{language === 'bn' ? 'আপনার কার্ট' : 'Your Cart'}</h2>
          <button className={styles.closeBtn} onClick={() => toggleCart(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className={styles.itemsList}>
          {items.length === 0 ? (
            <div className={styles.emptyCart}>
              <div className={styles.emptyIcon}>🛍️</div>
              <p suppressHydrationWarning>{language === 'bn' ? 'আপনার কার্ট খালি' : 'Your cart is empty'}</p>
              <button className="btn-nm" onClick={() => toggleCart(false)}>
                <span suppressHydrationWarning>{language === 'bn' ? 'কেনাকাটা শুরু করুন' : 'Start Shopping'}</span>
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.itemImage}>
                  <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} />
                </div>
                <div className={styles.itemDetails}>
                  <h3>{item.name}</h3>
                  <p className={styles.itemPrice} suppressHydrationWarning>৳ {item.price.toLocaleString()}</p>
                  <div className={styles.quantityControls}>
                    <button className={styles.qBtn} onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button className={styles.qBtn} onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                </div>
                <button className={styles.removeBtn} onClick={() => removeItem(item.id)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.subtotal}>
              <span suppressHydrationWarning>{language === 'bn' ? 'সাবটোটাল' : 'Subtotal'}</span>
              <span suppressHydrationWarning>৳ {getTotal().toLocaleString()}</span>
            </div>
            <div className={styles.total}>
              <span suppressHydrationWarning>{language === 'bn' ? 'মোট' : 'Total'}</span>
              <span suppressHydrationWarning>৳ {getTotal().toLocaleString()}</span>
            </div>
            <div className={styles.actions}>
              <button 
                className="btn-nm" 
                style={{ width: "100%", justifyContent: "center", height: "56px" }} 
                onClick={() => toggleCart(false)}
              >
                <span suppressHydrationWarning>{language === 'bn' ? 'আরও কেনিকাটা করুন' : 'Continue Shopping'}</span>
              </button>
              <Link 
                href="/checkout" 
                className="btn-nm btn-nm-primary" 
                style={{ width: "100%", justifyContent: "center", height: "56px", fontSize: "1.1rem" }} 
                onClick={() => toggleCart(false)}
              >
                <span suppressHydrationWarning>{language === 'bn' ? 'চেকআউট করুন' : 'Checkout'}</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
