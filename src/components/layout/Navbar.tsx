"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import MobileMenu from "./MobileMenu";
import HeaderSearch from "./HeaderSearch";
import styles from "./navbar.module.css";

export default function Navbar() {
  const { data: session } = useSession();
  const { items: cartItems, toggleCart } = useCartStore();
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const router = useRouter();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
        <div className={styles.topBar}>
          FREE SHIPPING ON ORDERS OVER ৳1,000 • AUTHENTIC JAPANESE SKINCARE
        </div>
        
        <div className={`container ${styles.navMain}`}>
          <div className={styles.logoWrapper}>
            <Link href="/">
              <Image src="/images/logo-cropped.png" alt="Aurea BD Logo" width={120} height={34} priority />
            </Link>
          </div>

          <nav className={styles.desktopNav}>
            <Link href="/" className={styles.navLink}>Home</Link>
            <Link href="/shop" className={styles.navLink}>Shop</Link>
            <Link href="/about" className={styles.navLink}>About</Link>
            <Link href="/contact" className={styles.navLink}>Contact</Link>
          </nav>

          <div className={styles.actions}>
            <HeaderSearch />

            {session ? (
              <Link href="/profile" className={styles.iconBtn} aria-label="Account">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </Link>
            ) : (
              <Link href="/auth/login" className={styles.iconBtn} aria-label="Login">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </Link>
            )}

            <button className={styles.iconBtn} onClick={() => toggleCart(true)} aria-label="Cart">
              <div className={styles.cartWrapper}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
              </div>
            </button>

            <button className={styles.menuBtn} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
