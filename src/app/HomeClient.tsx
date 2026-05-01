"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "./page.module.css";
import ProductCard from '@/features/products/ProductCard';
import TestimonialSlider from '@/components/shared/TestimonialSlider';
import { useLanguageStore } from "@/store/languageStore";
import { useState, useEffect } from "react";
import Newsletter from '@/components/shared/Newsletter';
import Editable from "@/components/cms/Editable";
import EditableImage from "@/components/cms/EditableImage";

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
              <Editable page="home" section="hero" field="badge" defaultText={language === 'bn' ? 'নতুন কালেকশন ২০২৬' : 'New Collection 2026'} />
            </motion.div>

            <motion.h1 
              className={styles.heroTitle}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Editable page="home" section="hero" field="title" defaultText={tr('hero.title')} /> <br />
              <span className={styles.italicText}><Editable page="home" section="hero" field="title_span" defaultText={tr('hero.title_span')} /></span>
            </motion.h1>

            <motion.p 
              className={styles.heroSubtitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Editable page="home" section="hero" field="subtitle" defaultText={tr('hero.subtitle')} multiline />
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
              <EditableImage 
                page="home"
                section="hero"
                field="image"
                defaultSrc="/images/sakura-set.png" 
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
              <div className={styles.cardIcon}><Editable page="home" section="hero" field="card_icon" defaultText="🌸" /></div>
              <div>
                <p className={styles.cardTitle}><Editable page="home" section="hero" field="card_title" defaultText={language === 'bn' ? 'সাকুরা এসেন্স' : 'Sakura Essence'} /></p>
                <p className={styles.cardPrice}><Editable page="home" section="hero" field="card_price" defaultText="৳ ১২৫০" /></p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. TRUST / FEATURES STRIP */}
      <section className={styles.trustStrip}>
        <div className="container">
          <div className={styles.trustGrid}>
            <div className={styles.trustCard}>
              <div className={styles.trustIcon}>✨</div>
              <h3 className={styles.trustTitle}><Editable page="home" section="trust" field="pure_title" defaultText={tr('trust.pure_title')} /></h3>
              <p className={styles.trustDesc}><Editable page="home" section="trust" field="pure_desc" defaultText={tr('trust.pure_desc')} /></p>
            </div>
            <div className={styles.trustCard}>
              <div className={styles.trustIcon}>💧</div>
              <h3 className={styles.trustTitle}><Editable page="home" section="trust" field="hydration_title" defaultText={tr('trust.hydration_title')} /></h3>
              <p className={styles.trustDesc}><Editable page="home" section="trust" field="hydration_desc" defaultText={tr('trust.hydration_desc')} /></p>
            </div>
            <div className={styles.trustCard}>
              <div className={styles.trustIcon}>🌿</div>
              <h3 className={styles.trustTitle}><Editable page="home" section="trust" field="cruelty_title" defaultText={tr('trust.cruelty_title')} /></h3>
              <p className={styles.trustDesc}><Editable page="home" section="trust" field="cruelty_desc" defaultText={tr('trust.cruelty_desc')} /></p>
            </div>
            <div className={styles.trustCard}>
              <div className={styles.trustIcon}>📦</div>
              <h3 className={styles.trustTitle}><Editable page="home" section="trust" field="shipping_title" defaultText={tr('trust.shipping_title')} /></h3>
              <p className={styles.trustDesc}><Editable page="home" section="trust" field="shipping_desc" defaultText={tr('trust.shipping_desc')} /></p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORY SECTION */}
      <section className={styles.categorySection}>
        <div className="container">
          <header className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}><Editable page="home" section="categories" field="title" defaultText={tr('cat.title')} /></h2>
            <p className={styles.sectionSubtitle}><Editable page="home" section="categories" field="subtitle" defaultText={tr('cat.subtitle')} /></p>
          </header>
          <div className={styles.categoryGrid}>
            <Link href="/shop?category=Radiance%20Serums" className={styles.categoryCard}>
              <div className={styles.categoryImgWrapper}>
                <EditableImage page="home" section="categories" field="serums_img" defaultSrc="/images/sakura-serum.png" alt="Serums" fill className={styles.categoryImg} />
              </div>
              <h3 className={styles.categoryName}><Editable page="home" section="categories" field="serums" defaultText={tr('cat.serums')} /></h3>
            </Link>
            <Link href="/shop?category=Hydration%20Creams" className={styles.categoryCard}>
              <div className={styles.categoryImgWrapper}>
                <EditableImage page="home" section="categories" field="creams_img" defaultSrc="/images/sakura-cream.png" alt="Creams" fill className={styles.categoryImg} />
              </div>
              <h3 className={styles.categoryName}><Editable page="home" section="categories" field="creams" defaultText={tr('cat.creams')} /></h3>
            </Link>
            <Link href="/shop?category=UV%20Protection" className={styles.categoryCard}>
              <div className={styles.categoryImgWrapper}>
                <EditableImage page="home" section="categories" field="uv_img" defaultSrc="/images/sakura-sunscreen.png" alt="UV" fill className={styles.categoryImg} />
              </div>
              <h3 className={styles.categoryName}><Editable page="home" section="categories" field="uv" defaultText={tr('cat.uv')} /></h3>
            </Link>
            <Link href="/shop?category=Skin%20Essentials" className={styles.categoryCard}>
              <div className={styles.categoryImgWrapper}>
                <EditableImage page="home" section="categories" field="essentials_img" defaultSrc="/images/sakura-set.png" alt="Essentials" fill className={styles.categoryImg} />
              </div>
              <h3 className={styles.categoryName}><Editable page="home" section="categories" field="essentials" defaultText={tr('cat.essentials')} /></h3>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS SECTION */}
      <section className={styles.featuredSection}>
        <div className="container">
          <header className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}><Editable page="home" section="new_arrivals" field="title" defaultText={tr('prod.new_arrivals')} /></h2>
            <p className={styles.sectionSubtitle}><Editable page="home" section="new_arrivals" field="subtitle" defaultText={tr('prod.new_subtitle')} /></p>
          </header>
          <div className={styles.productGrid}>
            {products.slice(0, 4).map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "var(--sp-8)" }}>
            <Link href="/shop" className={styles.btnSecondary}><Editable page="home" section="new_arrivals" field="view_all" defaultText={tr('prod.view_all')} /></Link>
          </div>
        </div>
      </section>

      {/* 5. PROMOTIONAL BANNER */}
      <section className={styles.promoSection}>
        <div className="container">
          <div className={styles.promoBanner}>
            <div className={styles.promoContent}>
              <span className={styles.promoTag}><Editable page="home" section="promo" field="tag" defaultText={tr('promo.tag')} /></span>
              <h2 className={styles.promoTitle}><Editable page="home" section="promo" field="title" defaultText={tr('promo.title')} /></h2>
              <p style={{ color: "var(--text-light)", marginBottom: "var(--sp-5)", fontSize: "1.1rem", maxWidth: "450px" }}>
                <Editable page="home" section="promo" field="desc" defaultText={tr('promo.desc')} multiline />
              </p>
              <Link href="/shop" className={styles.btnPrimary}><Editable page="home" section="promo" field="cta" defaultText={tr('promo.cta')} /></Link>
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
            <h2 className={styles.sectionTitle}><Editable page="home" section="best_sellers" field="title" defaultText={tr('prod.best_sellers')} /></h2>
            <p className={styles.sectionSubtitle}><Editable page="home" section="best_sellers" field="subtitle" defaultText={tr('prod.best_subtitle')} /></p>
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
