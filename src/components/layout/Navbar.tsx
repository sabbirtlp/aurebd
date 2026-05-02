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
import Editable from "@/components/cms/Editable";
import EditableImage from "@/components/cms/EditableImage";
import { useEditable } from "@/context/EditableContext";

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

  const { content } = useEditable();
  
  const getUrl = (field: string, def: string) => {
    const key = `navbar__mega__${field}__${language}`;
    const fallback = `navbar__mega__${field}__en`;
    return content[key] || content[fallback] || def;
  };

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
        <div className={styles.topBar}>
          <span className={styles.topBarContent}>
            <Editable page="navbar" section="topbar" field="content" defaultText={tr('topbar.shipping')} />
          </span>
        </div>

        <div className={`container ${styles.navMain}`}>
          <div className={styles.logoWrapper}>
            <Link href="/">
              <Image
                src="/images/logo-v2.webp"
                alt="Aurea BD"
                width={600}
                height={200}
                style={{ width: "auto", height: "64px", objectFit: "contain", maxWidth: "120px" }}
                priority
                sizes="120px"
              />
            </Link>
          </div>

          <nav className={styles.desktopNav}>
            <Link href="/" className={styles.navLink}>
              <span suppressHydrationWarning>
                <Editable page="navbar" section="links" field="home" defaultText={tr('nav.home')} />
              </span>
            </Link>

            <div className={styles.navItem}>
              <Link href="/shop" className={styles.navLink}>
                <span suppressHydrationWarning>
                  <Editable page="navbar" section="links" field="shop" defaultText={tr('nav.shop')} />
                </span>
              </Link>
              <div className={styles.megaMenu}>
                <div className={styles.megaLinksCol}>
                  <div className={styles.megaLinksSection}>
                    <h3 className={styles.megaTitle}>
                      <Editable page="navbar" section="mega" field="cat_title" defaultText={language === 'bn' ? 'ক্যাটাগরি' : 'Categories'} />
                    </h3>
                    <ul className={styles.megaList}>
                      <li>
                        <Link href={getUrl('cat_1_url', '/shop?category=Radiance%20Serums')} className={styles.megaLink}>
                          <Editable page="navbar" section="mega" field="cat_1" defaultText={tr('cat.serums')} />
                        </Link>
                      </li>
                      <li>
                        <Link href={getUrl('cat_2_url', '/shop?category=Hydration%20Creams')} className={styles.megaLink}>
                          <Editable page="navbar" section="mega" field="cat_2" defaultText={tr('cat.creams')} />
                        </Link>
                      </li>
                      <li>
                        <Link href={getUrl('cat_3_url', '/shop?category=UV%20Protection')} className={styles.megaLink}>
                          <Editable page="navbar" section="mega" field="cat_3" defaultText={tr('cat.uv')} />
                        </Link>
                      </li>
                      <li>
                        <Link href={getUrl('cat_4_url', '/shop?category=Skin%20Essentials')} className={styles.megaLink}>
                          <Editable page="navbar" section="mega" field="cat_4" defaultText={tr('cat.essentials')} />
                        </Link>
                      </li>
                      <li>
                        <Link href={getUrl('cat_5_url', '/shop?category=Cleansers')} className={styles.megaLink}>
                          <Editable page="navbar" section="mega" field="cat_5" defaultText={language === 'bn' ? 'ক্লিনজার' : 'Cleansers'} />
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div className={styles.megaLinksSection}>
                    <h3 className={styles.megaTitle}>
                      <Editable page="navbar" section="mega" field="col_title" defaultText={language === 'bn' ? 'কালেকশন' : 'Collections'} />
                    </h3>
                    <ul className={styles.megaList}>
                      <li><Link href={getUrl('col_1_url', '/shop')} className={styles.megaLink}><Editable page="navbar" section="mega" field="col_1" defaultText={language === 'bn' ? 'নতুন পণ্য' : 'New Arrivals'} /></Link></li>
                      <li><Link href={getUrl('col_2_url', '/shop')} className={styles.megaLink}><Editable page="navbar" section="mega" field="col_2" defaultText={language === 'bn' ? 'সেরা বিক্রয়' : 'Best Sellers'} /></Link></li>
                      <li><Link href={getUrl('col_3_url', '/shop')} className={styles.megaLink}><Editable page="navbar" section="mega" field="col_3" defaultText={language === 'bn' ? 'গিফট সেট' : 'Gift Sets'} /></Link></li>
                      <li><Link href={getUrl('col_4_url', '/shop')} className={styles.megaLink}><Editable page="navbar" section="mega" field="col_4" defaultText={language === 'bn' ? 'অফারসমূহ' : 'Special Offers'} /></Link></li>
                    </ul>
                  </div>
                </div>

                <div className={styles.megaFeatured}>
                  <div className={styles.featuredImg}>
                    <EditableImage page="navbar" section="mega" field="featured_img" defaultSrc="/images/sakura-set.webp" alt="Featured" fill sizes="300px" style={{ objectFit: "cover" }} />
                  </div>
                  <div className={styles.featuredInfo}>
                    <span className={styles.featuredBadge}>
                      <Editable page="navbar" section="mega" field="featured_badge" defaultText={language === 'bn' ? 'সুপার ডিল' : 'Super Deal'} />
                    </span>
                    <h4>
                      <Editable page="navbar" section="mega" field="featured_title" defaultText="Sakura 5pcs Skincare Set" />
                    </h4>
                    <p>
                      <Editable page="navbar" section="mega" field="featured_desc" defaultText={language === 'bn' ? 'সম্পূর্ণ সাকুরা স্কিনকেয়ার সেট এখন বিশেষ মূল্যে।' : 'The ultimate Sakura ritual for a radiant glow.'} multiline />
                    </p>
                    <Link href="/shop" className={styles.featuredBtn}>
                      <Editable page="navbar" section="mega" field="featured_btn" defaultText={language === 'bn' ? 'এখনই কিনুন' : 'Shop Now'} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <Link href="/about" className={styles.navLink}>
              <span suppressHydrationWarning>
                <Editable page="navbar" section="links" field="about" defaultText={tr('nav.about')} />
              </span>
            </Link>
            <Link href="/contact" className={styles.navLink}>
              <span suppressHydrationWarning>
                <Editable page="navbar" section="links" field="contact" defaultText={tr('nav.contact')} />
              </span>
            </Link>
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

              {mounted && session ? (
                <Link href="/profile" className={styles.profileBtn} aria-label="Profile">
                  <div className={styles.navAvatar}>
                    {session.user?.image ? (
                      <Image 
                        src={session.user.image} 
                        alt="Profile" 
                        width={32} 
                        height={32} 
                        className={styles.avatarImg}
                      />
                    ) : (
                      <span className={styles.avatarInitial}>
                        {(session.user?.name || 'U').charAt(0)}
                      </span>
                    )}
                  </div>
                </Link>
              ) : (
                <Link href="/login" className={styles.iconBtn} aria-label={tr('nav.login')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                </Link>
              )}

              <Link href="/wishlist" className={styles.iconBtn} aria-label={tr('nav.wishlist')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </Link>

              <button className={styles.iconBtn} onClick={() => toggleCart(true)} aria-label={tr('nav.cart')}>
                <div className={styles.cartWrapper}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
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
