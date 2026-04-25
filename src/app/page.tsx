import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import Hero from "@/components/Hero";
import { getProducts } from "@/actions/product";
import TestimonialSlider from "@/components/TestimonialSlider";
import Newsletter from "@/components/Newsletter";

export default async function Home() {
  const products = await getProducts() || [];

  return (
    <main>
      <Hero />

      {/* Brand Promise Section */}
      <section className={styles.sectionPromise}>
        <div className="container">
          <div className={styles.featuresGrid}>
            {[
              { icon: "✨", title: "Authentic Quality", desc: "100% genuine Japanese imports" },
              { icon: "🌸", title: "Skin-Friendly", desc: "Natural ingredients for all types" },
              { icon: "🚚", title: "Fast Delivery", desc: "Express shipping all over BD" },
              { icon: "🤝", title: "Trusted Brand", desc: "Over 10k happy customers" }
            ].map((item, i) => (
              <div key={i} className={`${styles.featureCard} animate-fade-in`}>
                <div className={styles.featureIcon}>{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className={styles.sectionCategories}>
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <div className={styles.categoryGrid}>
            {[
              { name: "Skincare Sets", img: "/images/sakura-set.png" },
              { name: "Sun Protection", img: "/images/sakura-sunscreen.png" },
              { name: "Serums", img: "/images/sakura-serum.png" },
              { name: "Creams", img: "/images/sakura-cream.png" }
            ].map((cat, i) => (
              <div key={i} className={styles.categoryCard}>
                <div className={styles.categoryImgWrapper}>
                  <Image src={cat.img} alt={cat.name} fill className={styles.categoryImg} />
                </div>
                <div className={styles.categoryOverlay}>
                  <h3>{cat.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="products" className={styles.sectionFeatured}>
        <div className="container">
          <h2 className="section-title">Featured Products</h2>
          <div className={styles.productGrid}>
            {products.slice(0, 4).map((product: any) => (
              <ProductCard key={product._id} product={product} styles={styles} />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "var(--sp-8)" }}>
            <Link href="/shop" className="btn-nm">View All Products</Link>
          </div>
        </div>
      </section>


      {/* Promo Banner */}
      <section className="section container">
        <div className={styles.promoBanner}>
          <div className={styles.promoContent}>
            <span style={{ color: "var(--primary)", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase" }}>Limited Offer</span>
            <h2 style={{ fontSize: "3rem", margin: "var(--sp-2) 0 var(--sp-3)" }}>Get Your Sakura Glow Today</h2>
            <p style={{ marginBottom: "var(--sp-5)", fontSize: "1.1rem" }}>Experience the magic of authentic Japanese skincare. Limited time offers available on all Sakura sets.</p>
            <Link href="/shop" className="btn-nm btn-nm-primary pulse">Shop The Collection</Link>
          </div>
          <div className={styles.promoImage}>
            <Image src="/images/sakura-set.png" alt="Promo Product" width={420} height={420} className="float" style={{ objectFit: "contain" }} />
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className={styles.sectionTrending}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "var(--sp-6)" }}>
            <h2 style={{ margin: 0, textAlign: "left", fontSize: "2.5rem", color: "var(--primary)" }}>Trending Now</h2>
            <div style={{ display: "flex", gap: "var(--sp-3)" }}>
              <Link href="/shop" className="btn-nm btn-nm-primary" style={{ padding: "var(--sp-1) var(--sp-3)", fontSize: "0.8rem" }}>New Arrivals</Link>
              <Link href="/shop" className="btn-nm" style={{ padding: "var(--sp-1) var(--sp-3)", fontSize: "0.8rem" }}>Best Sellers</Link>
            </div>
          </div>
          <div className={styles.productGrid}>
            {products.slice(0, 4).map((product: any) => (
              <ProductCard key={product._id} product={product} styles={styles} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className={styles.sectionTestimonials}>
        <div className="container">
          <h2 className="section-title">What Our Glowers Say</h2>
          <TestimonialSlider />
        </div>
      </section>

      {/* Instagram Gallery */}
      <section className={styles.sectionInstagram}>
        <div className="container">
          <h2 className="section-title">Follow @AureaBD</h2>
          <div className={styles.galleryGrid}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Link href="https://instagram.com" key={i} className={styles.galleryItem} target="_blank">
                <Image src={`/images/sakura-cream.png`} alt="Gallery" fill style={{ objectFit: "cover" }} />
                <div className={styles.galleryOverlay}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <Newsletter />

    </main>
  );
}
