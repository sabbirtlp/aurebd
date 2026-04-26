"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import styles from "./product.module.css";
import ProductCard from '@/features/products/ProductCard';

export default function ProductClient({ product, relatedProducts }: { product: any, relatedProducts: any[] }) {
  const [mainImage, setMainImage] = useState(product.image);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.location.href = "/checkout";
  };

  const thumbnails = [product.image, "/images/sakura-cream.png", "/images/sakura-serum.png"];

  return (
    <main className={`${styles.productPage} animate-fade-in`}>
      <div className="container">
        {/* HERO SECTION */}
        <section className={styles.heroGrid}>
          {/* GALLERY */}
          <div className={styles.gallery}>
            <div className={styles.mainImageWrapper}>
              <Image src={mainImage} alt={product.name} fill style={{ objectFit: "contain" }} priority />
            </div>
            <div className={styles.thumbnails}>
              {thumbnails.map((img, i) => (
                <button 
                  key={i} 
                  className={`${styles.thumbBtn} ${mainImage === img ? styles.active : ""}`}
                  onClick={() => setMainImage(img)}
                >
                  <Image src={img} alt="Thumbnail" width={80} height={80} style={{ objectFit: "contain" }} />
                </button>
              ))}
            </div>
          </div>

          {/* INFO */}
          <div className={styles.info}>
            <div className={styles.header}>
              <span className={styles.categoryBadge}>{product.category}</span>
              <h1 className={styles.title}>{product.name}</h1>
              <div className={styles.ratingRow}>
                <div className={styles.stars}>★★★★★</div>
                <span className={styles.reviewCount}>(124 Reviews)</span>
              </div>
              <p className={styles.price}>৳ {product.price}</p>
            </div>

            <p className={styles.shortDesc}>
              Experience the natural brightening power of Japanese Sakura. This premium formula deeply hydrates and rejuvenates your skin for a healthy, youthful glow.
            </p>

            <div className={styles.actions}>
              <div className={styles.quantityStepper}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
              <button className="btn-nm btn-nm-primary" style={{ flex: 1, height: "56px" }} onClick={handleAddToCart}>
                Add to Cart
              </button>
              <button className="btn-nm" style={{ flex: 1, height: "56px" }} onClick={handleBuyNow}>
                Buy Now
              </button>
            </div>

            <div className={styles.trustBadges}>
              <div className={styles.badge}>
                <span className={styles.badgeIcon}>🛡️</span>
                <span>Authentic Product</span>
              </div>
              <div className={styles.badge}>
                <span className={styles.badgeIcon}>🚚</span>
                <span>Fast Delivery</span>
              </div>
              <div className={styles.badge}>
                <span className={styles.badgeIcon}>🔒</span>
                <span>Safe Payment</span>
              </div>
            </div>
          </div>
        </section>

        {/* BENEFITS SECTION */}
        <section className="section">
          <div className={styles.benefitsGrid}>
            {[
              { icon: "💧", title: "Deep Hydration", desc: "Locks in moisture for 24 hours." },
              { icon: "✨", title: "Brightening", desc: "Reduces dullness and evening skin tone." },
              { icon: "🌿", title: "Pure Ingredients", desc: "Sakura essence from nature." },
              { icon: "⚡", title: "Fast Absorbing", desc: "Non-greasy, lightweight formula." }
            ].map((benefit, i) => (
              <div key={i} className={`${styles.benefitCard} nm-card`}>
                <div className={styles.benefitIcon}>{benefit.icon}</div>
                <h3>{benefit.title}</h3>
                <p>{benefit.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TABS SECTION */}
        <section className="section">
          <div className={styles.tabsWrapper}>
            <div className={styles.tabsHeader}>
              {["description", "ingredients", "howToUse"].map((tab) => (
                <button 
                  key={tab} 
                  className={`${styles.tabBtn} ${activeTab === tab ? styles.activeTab : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1).replace(/([A-Z])/g, ' $1')}
                </button>
              ))}
            </div>
            <div className={`${styles.tabContent} nm-card`}>
              {activeTab === "description" && (
                <div className="animate-fade-in">
                  <p>{product.description}</p>
                  <p>Our Japan Sakura line is crafted with care to bring the legendary beauty of Japanese blossoms to your daily routine. Each batch is tested for purity and effectiveness, ensuring a premium experience every time.</p>
                </div>
              )}
              {activeTab === "ingredients" && (
                <div className="animate-fade-in">
                  <p>Aqua, Prunus Lannesiana Flower Extract, Ascorbic Acid, Malic Acid, Prunus Mume Fruit Extract, Citric Acid, Potassium Hydroxide, Sodium Hyaluronate.</p>
                </div>
              )}
              {activeTab === "howToUse" && (
                <div className="animate-fade-in">
                  <p>1. Cleanse your face with Sakura Facewash.<br/>2. Apply a small amount of product to your fingertips.<br/>3. Gently massage onto skin in upward circular motions.<br/>4. Use morning and night for best results.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* REVIEWS SECTION */}
        <section className="section">
          <h2 className="section-title">Customer Reviews</h2>
          <div className={styles.reviewsGrid}>
            {[
              { name: "Tahmid A.", date: "2 days ago", comment: "Amazing product! My skin has never felt so soft.", rating: 5 },
              { name: "Sadiya J.", date: "1 week ago", comment: "I love the subtle floral scent. Very premium feel.", rating: 5 },
              { name: "Fahim S.", date: "2 weeks ago", comment: "Fast delivery and authentic product. Highly recommend.", rating: 4 }
            ].map((rev, i) => (
              <div key={i} className={`${styles.reviewCard} nm-card`}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewUser}>
                    <div className={styles.reviewAvatar}>{rev.name[0]}</div>
                    <div>
                      <h4>{rev.name}</h4>
                      <span>{rev.date}</span>
                    </div>
                  </div>
                  <div className={styles.reviewStars}>{"★".repeat(rev.rating)}</div>
                </div>
                <p>{rev.comment}</p>
              </div>
            ))}
          </div>
        </section>

        {/* RELATED PRODUCTS */}
        <section className="section">
          <h2 className="section-title">Related Products</h2>
          <div className={styles.relatedGrid}>
            {relatedProducts.slice(0, 4).map((rp: any) => (
              <ProductCard key={rp._id} product={rp} styles={styles} />
            ))}
          </div>
        </section>
      </div>

      {/* MOBILE STICKY BAR */}
      <div className={styles.mobileStickyBar}>
        <div className={styles.stickyInfo}>
          <p>৳ {product.price}</p>
          <span className={styles.itemTitle}>{product.name}</span>
        </div>
        <button className="btn-nm btn-nm-primary" onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </main>
  );
}
