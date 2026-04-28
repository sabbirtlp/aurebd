"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./mobileMenu.module.css";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  const toggleAccordion = (name: string) => {
    setActiveAccordion(activeAccordion === name ? null : name);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.menu} onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <Image src="/images/logo-v2.png" alt="Aurea BD" width={180} height={60} style={{ width: "auto", height: "32px", objectFit: "contain" }} />
            <p className={styles.tagline}>Premium Japanese Skincare</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className={styles.content}>
          {/* NAVIGATION LINKS */}
          <nav className={styles.nav}>
            <Link href="/" className={styles.navLink} onClick={onClose}>
              <span className={styles.icon}>🏠</span> Home
            </Link>
            
            <div className={styles.accordion}>
              <button 
                className={`${styles.navLink} ${activeAccordion === 'shop' ? styles.active : ''}`} 
                onClick={() => toggleAccordion('shop')}
              >
                <span className={styles.icon}>🛍️</span> Shop
                <svg className={styles.arrow} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              <div className={`${styles.dropdown} ${activeAccordion === 'shop' ? styles.show : ''}`}>
                <Link href="/shop" onClick={onClose}>All Products</Link>
                <Link href="/search?q=Set" onClick={onClose}>Skincare Sets</Link>
                <Link href="/search?q=Sunscreen" onClick={onClose}>Sunscreen</Link>
                <Link href="/search?q=Serum" onClick={onClose}>Serum</Link>
              </div>
            </div>

            <Link href="/about" className={styles.navLink} onClick={onClose}>
              <span className={styles.icon}>🌿</span> About
            </Link>
            <Link href="/contact" className={styles.navLink} onClick={onClose}>
              <span className={styles.icon}>📞</span> Contact
            </Link>
          </nav>

          {/* USER ACTIONS */}
          <div className={styles.userSection}>
            <Link href="/login" className={styles.userLink} onClick={onClose}>
              <span className={styles.icon}>👤</span> Account
            </Link>
            <Link href="/wishlist" className={styles.userLink} onClick={onClose}>
              <span className={styles.icon}>💖</span> Wishlist
            </Link>
          </div>

          {/* CTA BUTTON */}
          <div className={styles.ctaWrapper}>
            <Link href="/#products" className="btn-nm btn-nm-primary" style={{ width: "100%", justifyContent: "center" }} onClick={onClose}>
              Shop Now
            </Link>
          </div>
        </div>

        {/* FOOTER */}
        <div className={styles.footer}>
          <div className={styles.socials}>
            <button className={styles.socialBtn}>FB</button>
            <button className={styles.socialBtn}>IG</button>
            <button className={styles.socialBtn}>WA</button>
          </div>
          <p className={styles.footerText}>© 2026 Aurea BD • Radiance Delivered</p>
        </div>
      </div>
    </div>
  );
}
