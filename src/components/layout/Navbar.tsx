"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
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
  const { language, setLanguage, t } = useLanguageStore();
  const { theme, toggleTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Helper to safely translate or return placeholder during hydration
  const tr = (key: string) => mounted ? t(key) : key;

  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
        <div className={styles.topBar}>
          {tr('topbar.shipping')}
        </div>
        
        <div className={`container ${styles.navMain}`}>
          <div className={styles.logoWrapper}>
            <Link href="/">
              <Image 
                src="/images/logo-v2.png" 
                alt="Aurea BD" 
                width={600} 
                height={200} 
                style={{ width: "auto", height: "64px", objectFit: "contain", maxWidth: "120px" }} 
                priority 
              />
            </Link>
          </div>

          <nav className={styles.desktopNav}>
            <Link href="/" className={styles.navLink}><span suppressHydrationWarning>{tr('nav.home')}</span></Link>
            
            <div className={styles.navItem}>
              <Link href="/shop" className={styles.navLink}><span suppressHydrationWarning>{tr('nav.shop')}</span></Link>
              <div className={styles.megaMenu}>
                <div className={styles.megaCol}>
                  <h3 className={styles.megaTitle}>{language === 'bn' ? 'ক্যাটাগরি' : 'Categories'}</h3>
                  <ul className={styles.megaList}>
                    <li><Link href="/shop?category=Radiance%20Serums" className={styles.megaLink}>{tr('cat.serums')}</Link></li>
                    <li><Link href="/shop?category=Hydration%20Creams" className={styles.megaLink}>{tr('cat.creams')}</Link></li>
                    <li><Link href="/shop?category=UV%20Protection" className={styles.megaLink}>{tr('cat.uv')}</Link></li>
                    <li><Link href="/shop?category=Skin%20Essentials" className={styles.megaLink}>{tr('cat.essentials')}</Link></li>
                    <li><Link href="/shop?category=Cleansers" className={styles.megaLink}>{language === 'bn' ? 'ক্লিনজার' : 'Cleansers'}</Link></li>
                  </ul>
                </div>
                
                <div className={styles.megaCol}>
                  <h3 className={styles.megaTitle}>{language === 'bn' ? 'কালেকশন' : 'Collections'}</h3>
                  <ul className={styles.megaList}>
                    <li><Link href="/shop" className={styles.megaLink}>{language === 'bn' ? 'নতুন পণ্য' : 'New Arrivals'}</Link></li>
                    <li><Link href="/shop" className={styles.megaLink}>{language === 'bn' ? 'সেরা বিক্রয়' : 'Best Sellers'}</Link></li>
                    <li><Link href="/shop" className={styles.megaLink}>{language === 'bn' ? 'গিফট সেট' : 'Gift Sets'}</Link></li>
                    <li><Link href="/shop" className={styles.megaLink}>{language === 'bn' ? 'অফারসমূহ' : 'Special Offers'}</Link></li>
                  </ul>
                </div>

                <div className={styles.megaFeatured}>
                  <div className={styles.featuredImg}>
                    <Image src="/images/sakura-set.png" alt="Featured" fill style={{ objectFit: "cover" }} />
                  </div>
                  <div className={styles.featuredInfo}>
                    <span className={styles.featuredBadge}>{language === 'bn' ? 'সুপার ডিল' : 'Super Deal'}</span>
                    <h4>Sakura 5pcs Skincare Set</h4>
                    <p>{language === 'bn' ? 'সম্পূর্ণ সাকুরা স্কিনকেয়ার সেট এখন বিশেষ মূল্যে।' : 'The ultimate Sakura ritual for a radiant glow.'}</p>
                    <Link href="/shop" className={styles.featuredBtn}>{language === 'bn' ? 'এখনই কিনুন' : 'Shop Now'}</Link>
                  </div>
                </div>
              </div>
            </div>

            <Link href="/about" className={styles.navLink}><span suppressHydrationWarning>{tr('nav.about')}</span></Link>
            <Link href="/contact" className={styles.navLink}><span suppressHydrationWarning>{tr('nav.contact')}</span></Link>
          </nav>

          <div className={styles.actions}>
            <div className={styles.desktopActions}>
              <HeaderSearch />

              <button 
                className={`${styles.themeToggle} nm-card`} 
                onClick={toggleTheme}
                aria-label="Toggle Theme"
              >
                <span suppressHydrationWarning>
                  {mounted ? (theme === 'light' ? '🌙' : '☀️') : '🌙'}
                </span>
              </button>

              <button 
                className={`${styles.langToggle} nm-card`} 
                onClick={toggleLanguage}
                aria-label="Switch Language"
              >
                <span suppressHydrationWarning>
                  {mounted ? (language === 'bn' ? 'EN' : 'বাংলা') : 'BN'}
                </span>
              </button>

              {session ? (
                <Link href="/profile" className={styles.iconBtn} aria-label={tr('nav.login')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </Link>
              ) : (
                <Link href="/auth/login" className={styles.iconBtn} aria-label={tr('nav.login')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </Link>
              )}

              <Link href="/wishlist" className={styles.iconBtn} aria-label={tr('nav.wishlist')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </Link>

              <button className={styles.iconBtn} onClick={() => toggleCart(true)} aria-label={tr('nav.cart')}>
                <div className={styles.cartWrapper}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
                </div>
              </button>
            </div>

            <div className={styles.mobileActions}>
              <button 
                className={`${styles.themeToggle} nm-card`} 
                onClick={toggleTheme}
                aria-label="Toggle Theme"
              >
                <span suppressHydrationWarning>
                  {mounted ? (theme === 'light' ? '🌙' : '☀️') : '🌙'}
                </span>
              </button>

              <button 
                className={`${styles.langToggle} nm-card`} 
                onClick={toggleLanguage}
                aria-label="Switch Language"
              >
                <span suppressHydrationWarning>
                  {mounted ? (language === 'bn' ? 'EN' : 'বাংলা') : 'BN'}
                </span>
              </button>
            </div>

            <button 
              className={`${styles.menuBtn} ${isMobileMenuOpen ? styles.menuOpen : ""}`} 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className={styles.hamburgerLine}></span>
              <span className={styles.hamburgerLine}></span>
              <span className={styles.hamburgerLine}></span>
            </button>
          </div>
        </div>
      </header>
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
}
