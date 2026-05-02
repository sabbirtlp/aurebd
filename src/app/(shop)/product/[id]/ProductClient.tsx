"use client";

import { useState, useEffect, MouseEvent } from "react";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { toast } from "react-toastify";
import styles from "./product.module.css";
import ProductCard from '@/features/products/ProductCard';
import TestimonialSlider from "@/components/shared/TestimonialSlider";
import { useLanguageStore } from "@/store/languageStore";

const TAB_KEYS: Record<string, string> = {
  description: 'product.tab_description',
  ingredients: 'product.tab_ingredients',
  howToUse: 'product.tab_how_to_use'
};

export default function ProductClient({ product, relatedProducts }: { product: any, relatedProducts: any[] }) {
  const { language, t } = useLanguageStore();
  const [mainImage, setMainImage] = useState(product.image);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center center', transform: 'scale(1)' });
  const [isHovering, setIsHovering] = useState(false);
  const { addItem } = useCartStore();

  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 3;
  const totalReviews = product.reviews?.length || 0;
  const totalPages = Math.ceil(totalReviews / reviewsPerPage);
  const currentReviews = product.reviews?.slice((currentPage - 1) * reviewsPerPage, currentPage * reviewsPerPage) || [];

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.comment) return toast.error("Please fill all fields");
    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${product._id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewForm),
      });
      if (res.ok) {
        toast.success("Review submitted successfully!");
        setReviewForm({ name: '', rating: 5, comment: '' });
        window.location.reload();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to submit review");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [product._id]);

  const handleAddToCart = () => {
    addItem({
      id: product._id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.image,
      quantity: quantity
    });
    toast.success(`${product.name} ${t('product.added_to_cart')}`);
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
                <div className={styles.stars}>
                  {"★".repeat(Math.round(product.rating || 5)) + "☆".repeat(5 - Math.round(product.rating || 5))}
                </div>
                <span className={styles.reviewCount}>({product.numReviews || 0} {t('product.reviews') || 'Reviews'})</span>
              </div>
              {product.discountPrice ? (
                <div className={styles.priceContainer}>
                  <span className={styles.discountPrice}>৳ {product.discountPrice.toLocaleString()}</span>
                  <span className={styles.originalPrice}>৳ {product.price.toLocaleString()}</span>
                </div>
              ) : (
                <p className={styles.price}>৳ {product.price.toLocaleString()}</p>
              )}
            </div>

            <p className={styles.shortDesc}>
              {product.shortDescription || t('product.short_desc')}
            </p>

            <div className={styles.actions}>
              <div className={styles.quantityStepper}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
              <button className="btn-nm btn-nm-primary" style={{ flex: 1, height: "56px" }} onClick={handleAddToCart}>
                {t('product.add_to_cart')}
              </button>
              <button className="btn-nm" style={{ flex: 1, height: "56px" }} onClick={handleBuyNow}>
                {t('product.buy_now')}
              </button>
            </div>

            <div className={styles.trustBadges}>
              <div className={styles.badge}>
                <span className={styles.badgeIcon}>🛡️</span>
                <span>{t('product.authentic')}</span>
              </div>
              <div className={styles.badge}>
                <span className={styles.badgeIcon}>🚚</span>
                <span>{t('product.fast_delivery')}</span>
              </div>
              <div className={styles.badge}>
                <span className={styles.badgeIcon}>🔒</span>
                <span>{t('product.safe_payment')}</span>
              </div>
            </div>
          </div>
        </section>

        {/* BENEFITS SECTION */}
        <section className="section">
          <div className={styles.benefitsGrid}>
            {[
              { icon: "💧", title: t('product.benefit_hydration'), desc: t('product.benefit_hydration_desc') },
              { icon: "✨", title: t('product.benefit_brightening'), desc: t('product.benefit_brightening_desc') },
              { icon: "🌿", title: t('product.benefit_pure'), desc: t('product.benefit_pure_desc') },
              { icon: "⚡", title: t('product.benefit_absorbing'), desc: t('product.benefit_absorbing_desc') }
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
                  {t(TAB_KEYS[tab])}
                </button>
              ))}
            </div>
            <div className={`${styles.tabContent} nm-card`} suppressHydrationWarning>
              {activeTab === "description" && (
                <div className="animate-fade-in">
                  <p>{product.description}</p>
                  <p>{t('product.desc_extra')}</p>
                </div>
              )}
              {activeTab === "ingredients" && (
                <div className={`${styles.richText} animate-fade-in`} dangerouslySetInnerHTML={{ __html: product.ingredients || '<p>Aqua, Prunus Lannesiana Flower Extract, Ascorbic Acid, Malic Acid, Prunus Mume Fruit Extract, Citric Acid, Potassium Hydroxide, Sodium Hyaluronate.</p>' }} />
              )}
              {activeTab === "howToUse" && (
                <div className={`${styles.richText} animate-fade-in`} dangerouslySetInnerHTML={{ __html: product.howToUse || `<p>1. Cleanse your face with Sakura Facewash.<br/>2. Apply a small amount to fingertips.<br/>3. Gently massage onto skin.<br/>4. Use morning and night.</p>` }} />
              )}
            </div>
          </div>
        </section>

        {/* REVIEWS SECTION */}
        <section className="section" id="reviews">
          <h2 className="section-title">{language === 'bn' ? 'কাস্টমার রিভিউ' : 'Customer Reviews'}</h2>
          <div className={styles.reviewsContainer}>
            <div className={styles.reviewsList}>
              {totalReviews > 0 ? (
                <>
                  {currentReviews.map((rv: any, idx: number) => (
                    <div key={idx} className={`${styles.reviewCard} nm-card`} style={{ marginBottom: '1rem', padding: '1.5rem', textAlign: 'left' }}>
                      <div className={styles.reviewHeader} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <strong style={{ color: 'var(--primary)' }}>{rv.user}</strong>
                        <span className={styles.stars}>{"★".repeat(rv.rating)}{"☆".repeat(5 - rv.rating)}</span>
                      </div>
                      <p style={{ marginBottom: '0.5rem' }}>{rv.comment}</p>
                      <small style={{ color: 'var(--text-light)' }}>{new Date(rv.createdAt || new Date()).toLocaleDateString()}</small>
                    </div>
                  ))}
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                      <button 
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="btn-nm"
                        style={{ padding: '0.5rem 1rem' }}
                      >
                        &laquo;
                      </button>
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => handlePageChange(i + 1)}
                          className={`btn-nm ${currentPage === i + 1 ? 'btn-nm-primary' : ''}`}
                          style={{ padding: '0.5rem 1rem' }}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button 
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="btn-nm"
                        style={{ padding: '0.5rem 1rem' }}
                      >
                        &raquo;
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="nm-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                  {language === 'bn' ? 'এখনো কোনো রিভিউ নেই। আপনিই প্রথম হোন!' : 'No reviews yet. Be the first to review this product!'}
                </div>
              )}
            </div>
            
            <div className={`${styles.reviewFormCard} nm-card`} style={{ padding: '2rem', textAlign: 'left' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--primary)' }}>
                {language === 'bn' ? 'রিভিউ লিখুন' : 'Write a Review'}
              </h3>
              <form onSubmit={handleReviewSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{language === 'bn' ? 'আপনার নাম' : 'Your Name'}</label>
                  <input 
                    type="text" 
                    value={reviewForm.name} 
                    onChange={e => setReviewForm({...reviewForm, name: e.target.value})} 
                    required 
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{language === 'bn' ? 'রেটিং' : 'Rating'}</label>
                  <select 
                    value={reviewForm.rating} 
                    onChange={e => setReviewForm({...reviewForm, rating: Number(e.target.value)})}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                  >
                    <option value={5}>5 - Excellent</option>
                    <option value={4}>4 - Very Good</option>
                    <option value={3}>3 - Average</option>
                    <option value={2}>2 - Poor</option>
                    <option value={1}>1 - Terrible</option>
                  </select>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{language === 'bn' ? 'আপনার মন্তব্য' : 'Review'}</label>
                  <textarea 
                    rows={4} 
                    value={reviewForm.comment} 
                    onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} 
                    required 
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-color)', color: 'var(--text-color)', resize: 'vertical' }}
                  />
                </div>
                <button type="submit" className="btn-nm btn-nm-primary" disabled={submittingReview} style={{ width: '100%' }}>
                  {submittingReview ? (language === 'bn' ? "সাবমিট হচ্ছে..." : "Submitting...") : (language === 'bn' ? "সাবমিট করুন" : "Submit Review")}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* RELATED PRODUCTS */}
        {relatedProducts && relatedProducts.length > 0 && (
          <section className="section">
            <h2 className="section-title">{t('product.related')}</h2>
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
