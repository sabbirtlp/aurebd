"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "./page.module.css";
import ProductCard from '@/features/products/ProductCard';
import { useLanguageStore } from "@/store/languageStore";
import Editable from "@/components/cms/Editable";
import EditableImage from "@/components/cms/EditableImage";

// Lazy load non-critical sections
const TestimonialSlider = dynamic(() => import('@/components/shared/TestimonialSlider'), { ssr: false });
const Newsletter = dynamic(() => import('@/components/shared/Newsletter'), { ssr: false });

const MotionLink = motion(Link);

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
    { name: tr('cat.serums'), raw: "Radiance Serums", img: "/images/sakura-serum.webp" },
    { name: tr('cat.creams'), raw: "Hydration Creams", img: "/images/sakura-cream.webp" },
    { name: tr('cat.uv'), raw: "UV Protection", img: "/images/sakura-sunscreen.webp" },
    { name: tr('cat.essentials'), raw: "Skin Essentials", img: "/images/sakura-set.webp" }
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
            <div className={styles.heroBadge}>
              <span className={styles.badgeDot}></span>
              <Editable page="home" section="hero" field="badge" defaultText={language === 'bn' ? 'নতুন কালেকশন ২০২৬' : 'New Collection 2026'} />
            </div>

            <h1 className={`${styles.heroTitle} ${styles.animateFadeIn}`}>
              <Editable page="home" section="hero" field="title" defaultText={tr('hero.title')} /> <br />
              <span className={styles.italicText}><Editable page="home" section="hero" field="title_span" defaultText={tr('hero.title_span')} /></span>
            </h1>

            <p className={`${styles.heroSubtitle} ${styles.animateFadeIn}`}>
              <Editable page="home" section="hero" field="subtitle" defaultText={tr('hero.subtitle')} multiline />
            </p>

            <div className={`${styles.heroActions} ${styles.animateFadeIn}`}>
              <Link href="/shop" className={styles.btnPrimary}>
                {tr('hero.shop_now')}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </Link>
              <Link href="/about" className={styles.btnSecondary}>{tr('hero.our_story')}</Link>
            </div>


          </div>

          <div className={`${styles.heroImageContainer} ${styles.heroImageAnimate}`}>
            <div className={styles.heroImageCircle}>
              <EditableImage 
                page="home"
                section="hero"
                field="image"
                defaultSrc="/images/sakura-set.webp" 
                alt="Premium Skincare Collection" 
                fill 
                className={styles.heroImage}
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 500px"
              />
            </div>
            
            {/* Floating Card Detail */}
            <motion.div 
              className={styles.floatingCard}
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{ willChange: "transform", translateZ: 0 }}
            >
              <div className={styles.cardIcon}><Editable page="home" section="hero" field="card_icon" defaultText="🌸" /></div>
              <div>
                <p className={styles.cardTitle}><Editable page="home" section="hero" field="card_title" defaultText={language === 'bn' ? 'সাকুরা এসেন্স' : 'Sakura Essence'} /></p>
                <p className={styles.cardPrice}><Editable page="home" section="hero" field="card_price" defaultText="৳ ১২৫০" /></p>
              </div>
            </motion.div>
          </div>
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
            <MotionLink 
              href="/shop?category=Radiance%20Serums" 
              className={styles.categoryCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className={styles.categoryImgWrapper}>
                <EditableImage page="home" section="categories" field="serums_img" defaultSrc="/images/sakura-serum.webp" alt="Serums" fill className={styles.categoryImg} sizes="(max-width: 768px) 50vw, 250px" />
              </div>
              <h3 className={styles.categoryName}><Editable page="home" section="categories" field="serums" defaultText={tr('cat.serums')} /></h3>
            </MotionLink>
            <MotionLink 
              href="/shop?category=Hydration%20Creams" 
              className={styles.categoryCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className={styles.categoryImgWrapper}>
                <EditableImage page="home" section="categories" field="creams_img" defaultSrc="/images/sakura-cream.webp" alt="Creams" fill className={styles.categoryImg} sizes="(max-width: 768px) 50vw, 250px" />
              </div>
              <h3 className={styles.categoryName}><Editable page="home" section="categories" field="creams" defaultText={tr('cat.creams')} /></h3>
            </MotionLink>
            <MotionLink 
              href="/shop?category=UV%20Protection" 
              className={styles.categoryCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className={styles.categoryImgWrapper}>
                <EditableImage page="home" section="categories" field="uv_img" defaultSrc="/images/sakura-sunscreen.webp" alt="UV" fill className={styles.categoryImg} sizes="(max-width: 768px) 50vw, 250px" />
              </div>
              <h3 className={styles.categoryName}><Editable page="home" section="categories" field="uv" defaultText={tr('cat.uv')} /></h3>
            </MotionLink>
            <MotionLink 
              href="/shop?category=Skin%20Essentials" 
              className={styles.categoryCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className={styles.categoryImgWrapper}>
                <EditableImage page="home" section="categories" field="essentials_img" defaultSrc="/images/sakura-set.webp" alt="Essentials" fill className={styles.categoryImg} sizes="(max-width: 768px) 50vw, 250px" />
              </div>
              <h3 className={styles.categoryName}><Editable page="home" section="categories" field="essentials" defaultText={tr('cat.essentials')} /></h3>
            </MotionLink>
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
            {products.slice(0, 4).map((product: any, idx: number) => (
              <motion.div 
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
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
              <EditableImage 
                page="home" 
                section="promo" 
                field="image" 
                defaultSrc="/images/sakura-set.webp" 
                alt="Promo Product" 
                fill 
                className={styles.promoImage} 
                sizes="(max-width: 768px) 100vw, 500px" 
              />
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
            {products.slice(4, 8).map((product: any, idx: number) => (
              <motion.div 
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
            {products.length < 5 && products.slice(0, 4).map((product: any, idx: number) => (
              <motion.div 
                key={product._id + '-dup'}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
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
