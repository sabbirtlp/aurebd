"use client";

import { useState, useEffect, MouseEvent } from "react";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { toast } from "react-toastify";
import styles from "./product.module.css";
import ProductCard from '@/features/products/ProductCard';
import TestimonialSlider from "@/components/shared/TestimonialSlider";
import { useLanguageStore } from "@/store/languageStore";

export default function ProductClient({ product, relatedProducts }: { product: any, relatedProducts: any[] }) {
  const { language } = useLanguageStore();
  const [mainImage, setMainImage] = useState(product.image);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center center', transform: 'scale(1)' });
  const [isHovering, setIsHovering] = useState(false);
  const { addItem } = useCartStore();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [product._id]);

  const handleAddToCart = () => {
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity
    });
    toast.success(`Added ${quantity} ${product.name} to cart`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.location.href = "/checkout";
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    // Only apply zoom on desktop/larger screens
    if (window.innerWidth <= 992) return;
    
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setIsHovering(true);
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2.2)'
    });
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setZoomStyle({ transformOrigin: 'center center', transform: 'scale(1)' });
  };

  const thumbnails = [product.image, ...(product.gallery || [])];

  return (
    <main className={`${styles.productPage} animate-fade-in`}>
      <div className="container">
        {/* HERO SECTION */}
        <section className={styles.heroGrid}>
          {/* GALLERY */}
          <div className={styles.gallery}>
            <div 
              className={`${styles.mainImageWrapper} ${isHovering ? styles.zoomed : ''}`}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <Image 
                src={mainImage} 
                alt={product.name} 
                fill 
                className={styles.mainImage}
                style={{ 
                  objectFit: "contain", 
                  transformOrigin: zoomStyle.transformOrigin,
                  transform: zoomStyle.transform 
                }} 
                priority 
              />
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
          <TestimonialSlider 
            title={language === 'bn' ? 'গ্রাহকদের রিভিউ' : 'Customer Reviews'}
            items={language === 'bn' ? [
              { name: "তাহমিদ এ.", location: "ঢাকা", text: "অসাধারণ পণ্য! আমার ত্বক এখন অনেক নরম অনুভূত হয়।", initial: "T" },
              { name: "সাদিয়া জে.", location: "চট্টগ্রাম", text: "আমি এটার হালকা সুগন্ধি খুব পছন্দ করি। খুব প্রিমিয়াম ফিল দেয়।", initial: "S" },
              { name: "ফাহিম এস.", location: "সিলেট", text: "দ্রুত ডেলিভারি এবং আসল পণ্য। আমি অবশ্যই এটি রিকমেন্ড করছি।", initial: "F" },
              { name: "আনিকা আর.", location: "রাজশাহী", text: "প্যাকেজিং খুবই লাক্সারি। কাউকে গিফট করার জন্য একদম উপযুক্ত।", initial: "A" },
              { name: "রাইসা এম.", location: "ঢাকা", text: "বাংলাদেশে জাপানি স্কিনকেয়ারের জন্য সেরা। দাম অনুযায়ী মান অনেক ভালো।", initial: "R" }
            ] : [
              { name: "Tahmid A.", location: "Dhaka", text: "Amazing product! My skin has never felt so soft.", initial: "T" },
              { name: "Sadiya J.", location: "Chittagong", text: "I love the subtle floral scent. Very premium feel.", initial: "S" },
              { name: "Fahim S.", location: "Sylhet", text: "Fast delivery and authentic product. Highly recommend.", initial: "F" },
              { name: "Anika R.", location: "Rajshahi", text: "The packaging is so luxury. Perfect for gifting.", initial: "A" },
              { name: "Raisa M.", location: "Dhaka", text: "Best Japanese skincare in BD. Totally worth it.", initial: "R" }
            ]}
          />
        </section>

        {/* RELATED PRODUCTS */}
        {relatedProducts && relatedProducts.length > 0 && (
          <section className="section">
            <h2 className="section-title">{language === 'bn' ? 'সংশ্লিষ্ট পণ্য' : 'Related Products'}</h2>
            <div className={styles.relatedGrid}>
              {relatedProducts.slice(0, 4).map((rp: any) => (
                <ProductCard key={rp._id} product={rp} />
              ))}
            </div>
          </section>
        )}
      </div>

    </main>
  );
}
