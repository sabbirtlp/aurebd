"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "./page.module.css";
import ProductCard from '@/features/products/ProductCard';
import TestimonialSlider from '@/components/shared/TestimonialSlider';
import Newsletter from '@/components/shared/Newsletter';
import { useLanguageStore } from "@/store/languageStore";
import { useState, useEffect } from "react";

export default function HomeClient({ products }: { products: any[] }) {
  const { t, language } = useLanguageStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tr = (key: string) => mounted ? t(key) : key;

  const trustItems = [
    { icon: "✨", title: tr('trust.pure_title'), desc: tr('trust.pure_desc') },
    { icon: "💧", title: tr('trust.hydration_title'), desc: tr('trust.hydration_desc') },
    { icon: "🌿", title: tr('trust.cruelty_title'), desc: tr('trust.cruelty_desc') },
    { icon: "📦", title: tr('trust.shipping_title'), desc: tr('trust.shipping_desc') }
  ];

  const categories = [
    { name: tr('cat.serums'), raw: "Radiance Serums", img: "/images/sakura-serum.png" },
    { name: tr('cat.creams'), raw: "Hydration Creams", img: "/images/sakura-cream.png" },
    { name: tr('cat.uv'), raw: "UV Protection", img: "/images/sakura-sunscreen.png" },
    { name: tr('cat.essentials'), raw: "Skin Essentials", img: "/images/sakura-set.png" }
  ];

  return (
    <main className={styles.homePage}>
      {/* 1. HERO SECTION */}
      <section className={styles.heroSection}>
        {/* Floating Decorative Elements */}
        <div className={styles.blob1}></div>
        <div className={styles.blob2}></div>
        
        <div className={`container ${styles.heroContainer}`}>
          <div className={styles.heroContent}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={styles.heroBadge}
            >
              <span className={styles.badgeDot}></span>
              {language === 'bn' ? 'নতুন কালেকশন ২০২৬' : 'New Collection 2026'}
            </motion.div>

            <motion.h1 
              className={styles.heroTitle}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {tr('hero.title')} <br />
              <span className={styles.italicText}>{tr('hero.title_span')}</span>
            </motion.h1>

            <motion.p 
              className={styles.heroSubtitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {tr('hero.subtitle')}
            </motion.p>

            <motion.div 
              className={styles.heroActions}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link href="/shop" className={styles.btnPrimary}>
                {tr('hero.shop_now')}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </Link>
              <Link href="/about" className={styles.btnSecondary}>{tr('hero.our_story')}</Link>
            </motion.div>

            {/* Trust Badges in Hero */}
            <motion.div 
              className={styles.heroTrust}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
            >
              <div className={styles.trustItem}>
                <span className={styles.trustIcon}>✦</span>
                <span>{language === 'bn' ? 'অর্গানিক উপাদান' : '100% Organic'}</span>
              </div>
              <div className={styles.trustItem}>
                <span className={styles.trustIcon}>✦</span>
                <span>{language === 'bn' ? 'জাপানি প্রযুক্তি' : 'Japan Tech'}</span>
              </div>
            </motion.div>
          </div>

          <motion.div 
            className={styles.heroImageContainer}
            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <div className={styles.heroImageCircle}>
              <Image 
                src="/images/sakura-set.png" 
                alt="Premium Skincare Collection" 
                fill 
                className={styles.heroImage}
                priority
              />
            </div>
            
            {/* Floating Card Detail */}
            <motion.div 
              className={styles.floatingCard}
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className={styles.cardIcon}>🌸</div>
              <div>
                <p className={styles.cardTitle}>{language === 'bn' ? 'সাকুরা এসেন্স' : 'Sakura Essence'}</p>
                <p className={styles.cardPrice}>৳ ১২৫০</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. TRUST / FEATURES STRIP */}
      <section className={styles.trustStrip}>
        <div className="container">
          <div className={styles.trustGrid}>
            {trustItems.map((item, i) => (
              <div key={i} className={styles.trustCard}>
                <div className={styles.trustIcon}>{item.icon}</div>
                <h3 className={styles.trustTitle}>{item.title}</h3>
                <p className={styles.trustDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CATEGORY SECTION */}
      <section className={styles.categorySection}>
        <div className="container">
          <header className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{tr('cat.title')}</h2>
            <p className={styles.sectionSubtitle}>{tr('cat.subtitle')}</p>
          </header>
          <div className={styles.categoryGrid}>
            {categories.map((cat, i) => (
              <Link href={`/shop?category=${encodeURIComponent(cat.raw)}`} key={i} className={styles.categoryCard}>
                <div className={styles.categoryImgWrapper}>
                  <Image src={cat.img} alt={cat.name} fill className={styles.categoryImg} />
                </div>
                <h3 className={styles.categoryName}>{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS SECTION */}
      <section className={styles.featuredSection}>
        <div className="container">
          <header className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{tr('prod.new_arrivals')}</h2>
            <p className={styles.sectionSubtitle}>{tr('prod.new_subtitle')}</p>
          </header>
          <div className={styles.productGrid}>
            {products.slice(0, 4).map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "var(--sp-8)" }}>
            <Link href="/shop" className={styles.btnSecondary}>{tr('prod.view_all')}</Link>
          </div>
        </div>
      </section>

      {/* 5. PROMOTIONAL BANNER */}
      <section className={styles.promoSection}>
        <div className="container">
          <div className={styles.promoBanner}>
            <div className={styles.promoContent}>
              <span className={styles.promoTag}>{tr('promo.tag')}</span>
              <h2 className={styles.promoTitle}>{tr('promo.title')}</h2>
              <p style={{ color: "var(--text-light)", marginBottom: "var(--sp-5)", fontSize: "1.1rem", maxWidth: "450px" }}>
                {tr('promo.desc')}
              </p>
              <Link href="/shop" className={styles.btnPrimary}>{tr('promo.cta')}</Link>
            </div>
            <div className={styles.promoImageContainer}>
              <Image src="/images/sakura-set.png" alt="Promo Product" fill className={styles.promoImage} />
            </div>
          </div>
        </div>
      </section>

      {/* 6. BEST SELLERS SECTION */}
      <section className={styles.featuredSection} style={{ background: "transparent" }}>
        <div className="container">
          <header className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{tr('prod.best_sellers')}</h2>
            <p className={styles.sectionSubtitle}>{tr('prod.best_subtitle')}</p>
          </header>
          <div className={styles.productGrid}>
            {products.slice(4, 8).map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
            {products.length < 5 && products.slice(0, 4).map((product: any) => (
              <ProductCard key={product._id + '-dup'} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS SECTION */}
      <TestimonialSlider />

      {/* 8. NEWSLETTER SECTION */}
      <Newsletter />

    </main>
  );
}
