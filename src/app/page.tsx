import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import ProductCard from '@/features/products/ProductCard';
import { getProducts } from '@/services/product.service';
import TestimonialSlider from '@/components/shared/TestimonialSlider';
import Newsletter from '@/components/shared/Newsletter';

export default async function Home() {
  const products = await getProducts() || [];

  return (
    <main className={styles.homePage}>
      {/* 1. HERO SECTION */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Reveal Your <span>Radiance</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Experience the purest essence of Japanese skincare. Formulated to nourish, protect, and illuminate your natural beauty.
          </p>
          <div className={styles.heroActions}>
            <Link href="/shop" className={styles.btnPrimary}>Shop Collection</Link>
            <Link href="/about" className={styles.btnSecondary}>Our Story</Link>
          </div>
        </div>
        <div className={styles.heroImageContainer}>
          <div className={styles.heroImageCircle}>
            <Image 
              src="/images/sakura-set.png" 
              alt="Premium Skincare Collection" 
              fill 
              className={styles.heroImage}
              priority
            />
          </div>
        </div>
      </section>

      {/* 2. TRUST / FEATURES STRIP */}
      <section className={styles.trustStrip}>
        <div className="container">
          <div className={styles.trustGrid}>
            {[
              { icon: "✨", title: "Pure Ingredients", desc: "Sourced directly from Japan" },
              { icon: "💧", title: "Deep Hydration", desc: "Locks in moisture all day" },
              { icon: "🌿", title: "Cruelty Free", desc: "Never tested on animals" },
              { icon: "📦", title: "Complimentary Shipping", desc: "On orders over ৳5000" }
            ].map((item, i) => (
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
            <h2 className={styles.sectionTitle}>Curated Collections</h2>
            <p className={styles.sectionSubtitle}>Discover the perfect regimen for your skin type.</p>
          </header>
          <div className={styles.categoryGrid}>
            {[
              { name: "Radiance Serums", img: "/images/sakura-serum.png" },
              { name: "Hydration Creams", img: "/images/sakura-cream.png" },
              { name: "UV Protection", img: "/images/sakura-sunscreen.png" },
              { name: "Skin Essentials", img: "/images/sakura-set.png" }
            ].map((cat, i) => (
              <Link href={`/shop?category=${encodeURIComponent(cat.name)}`} key={i} className={styles.categoryCard}>
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
            <h2 className={styles.sectionTitle}>New Arrivals</h2>
            <p className={styles.sectionSubtitle}>The latest additions to elevate your ritual.</p>
          </header>
          <div className={styles.productGrid}>
            {products.slice(0, 4).map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "var(--sp-8)" }}>
            <Link href="/shop" className={styles.btnSecondary}>View All Products</Link>
          </div>
        </div>
      </section>

      {/* 5. PROMOTIONAL BANNER */}
      <section className={styles.promoSection}>
        <div className="container">
          <div className={styles.promoBanner}>
            <div className={styles.promoContent}>
              <span className={styles.promoTag}>Limited Edition</span>
              <h2 className={styles.promoTitle}>The Sakura Glow Collection</h2>
              <p style={{ color: "var(--text-light)", marginBottom: "var(--sp-5)", fontSize: "1.1rem", maxWidth: "450px" }}>
                Experience the revitalizing power of cherry blossoms. Our exclusive set is designed to brighten and perfect your complexion.
              </p>
              <Link href="/shop" className={styles.btnPrimary}>Discover More</Link>
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
            <h2 className={styles.sectionTitle}>Cult Favorites</h2>
            <p className={styles.sectionSubtitle}>Our most loved essentials by the community.</p>
          </header>
          <div className={styles.productGrid}>
            {products.slice(4, 8).map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
            {/* If there are less than 8 products, show the first 4 again just for layout symmetry in demo */}
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
