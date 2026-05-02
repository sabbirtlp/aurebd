"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./mobileMenu.module.css";

import { useLanguageStore } from "@/store/languageStore";
import { useSession } from "next-auth/react";
import { useEditable } from "@/context/EditableContext";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { data: session } = useSession();
  const { t, language } = useLanguageStore();
  const { content } = useEditable();
  const [mounted, setMounted] = useState(false);

  const getCms = (page: string, section: string, field: string, def: string) => {
    const key = `${page}__${section}__${field}__${language}`;
    const fallback = `${page}__${section}__${field}__en`;
    return content[key] || content[fallback] || def;
  };

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  const tr = (key: string) => mounted ? t(key) : key;


  return (
    <div className={`${styles.overlay} ${isOpen ? styles.open : styles.closed}`} onClick={onClose}>
      <div className={styles.menu} onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <Image src="/images/logo-v2.webp" alt="Aurea BD" width={180} height={60} style={{ width: "auto", height: "32px", objectFit: "contain" }} />
          </div>

          <button className={styles.closeBtn} onClick={onClose} aria-label="Close Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className={styles.content}>
          {/* NAVIGATION LINKS */}
          <nav className={styles.nav}>
            <Link href="/" className={styles.navLink} onClick={onClose}>
              <span className={styles.icon}>🏠</span> <span suppressHydrationWarning>{mounted ? getCms('navbar', 'links', 'home', tr('nav.home')) : tr('nav.home')}</span>
            </Link>

            <Link href="/shop" className={styles.navLink} onClick={onClose}>
              <span className={styles.icon}>🛍️</span> <span suppressHydrationWarning>{mounted ? getCms('navbar', 'links', 'shop', tr('nav.shop')) : tr('nav.shop')}</span>
            </Link>

            <Link href="/about" className={styles.navLink} onClick={onClose}>
              <span className={styles.icon}>🌿</span> <span suppressHydrationWarning>{mounted ? getCms('navbar', 'links', 'about', tr('nav.about')) : tr('nav.about')}</span>
            </Link>
            <Link href="/contact" className={styles.navLink} onClick={onClose}>
              <span className={styles.icon}>📞</span> <span suppressHydrationWarning>{mounted ? getCms('navbar', 'links', 'contact', tr('nav.contact')) : tr('nav.contact')}</span>
            </Link>
          </nav>

          {/* USER ACTIONS */}
          <div className={styles.userSection}>
            <Link href={session ? "/profile" : "/login"} className={styles.userLink} onClick={onClose}>
              <span className={styles.icon}>{session ? "✨" : "🔑"}</span> 
              <span suppressHydrationWarning>{session ? (language === 'bn' ? 'আমার প্রোফাইল' : 'My Dashboard') : tr('nav.login')}</span>
            </Link>
            <Link href="/wishlist" className={styles.userLink} onClick={onClose}>
              <span className={styles.icon}>💖</span> <span suppressHydrationWarning>{tr('nav.wishlist')}</span>
            </Link>
          </div>

          {/* CTA BUTTON */}
          <div className={styles.ctaWrapper}>
            <Link href="/shop" className="btn-nm btn-nm-primary" style={{ width: "100%", justifyContent: "center" }} onClick={onClose}>
              <span suppressHydrationWarning>{language === 'bn' ? 'এখনই কিনুন' : 'Shop Now'}</span>
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
          <p className={styles.footerText}>© 2026 Aurea BD • {language === 'bn' ? 'উজ্জ্বলতায় পৌঁছে দেওয়া' : 'Radiance Delivered'}</p>
        </div>
      </div>
    </div>
  );
}
