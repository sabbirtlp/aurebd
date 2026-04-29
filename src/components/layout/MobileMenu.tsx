"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./mobileMenu.module.css";

import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { t, language, setLanguage } = useLanguageStore();
  const { theme, toggleTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  const tr = (key: string) => mounted ? t(key) : key;

  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.menu} onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <Image src="/images/logo-v2.png" alt="Aurea BD" width={180} height={60} style={{ width: "auto", height: "32px", objectFit: "contain" }} />
          </div>
          
          <div className={styles.headerActions}>
            <button className={styles.headerBtn} onClick={toggleTheme} aria-label="Toggle Theme">
              {mounted ? (theme === 'light' ? '🌙' : '☀️') : '🌙'}
            </button>
            <button className={styles.headerBtn} onClick={toggleLanguage} aria-label="Switch Language">
              {mounted ? (language === 'bn' ? 'EN' : 'BN') : 'BN'}
            </button>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close Menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {/* NAVIGATION LINKS */}
          <nav className={styles.nav}>
            <Link href="/" className={styles.navLink} onClick={onClose}>
              <span className={styles.icon}>🏠</span> {tr('nav.home')}
            </Link>
            
            <Link href="/shop" className={styles.navLink} onClick={onClose}>
              <span className={styles.icon}>🛍️</span> {tr('nav.shop')}
            </Link>

            <Link href="/about" className={styles.navLink} onClick={onClose}>
              <span className={styles.icon}>🌿</span> {tr('nav.about')}
            </Link>
            <Link href="/contact" className={styles.navLink} onClick={onClose}>
              <span className={styles.icon}>📞</span> {tr('nav.contact')}
            </Link>
          </nav>

          {/* USER ACTIONS */}
          <div className={styles.userSection}>
            <Link href="/profile" className={styles.userLink} onClick={onClose}>
              <span className={styles.icon}>👤</span> {tr('nav.login')}
            </Link>
            <Link href="/wishlist" className={styles.userLink} onClick={onClose}>
              <span className={styles.icon}>💖</span> {tr('nav.wishlist')}
            </Link>
          </div>

          {/* CTA BUTTON */}
          <div className={styles.ctaWrapper}>
            <Link href="/shop" className="btn-nm btn-nm-primary" style={{ width: "100%", justifyContent: "center" }} onClick={onClose}>
              {language === 'bn' ? 'এখনই কিনুন' : 'Shop Now'}
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
