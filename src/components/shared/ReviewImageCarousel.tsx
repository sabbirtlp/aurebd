"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLanguageStore } from "@/store/languageStore";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import styles from "./reviewImageCarousel.module.css";

interface ReviewImage {
  _id: string;
  imageUrl: string;
  altText: string;
  order: number;
}

export default function ReviewImageCarousel() {
  const { language } = useLanguageStore();
  const [images, setImages] = useState<ReviewImage[]>([]);
  const [current, setCurrent] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [mounted, setMounted] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch("/api/review-images");
      const data = await res.json();
      if (data.images && data.images.length > 0) {
        setImages(data.images);
      }
    } catch (err) {
      console.error("Failed to fetch review images");
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchImages();
    const handleResize = () => {
      if (window.innerWidth <= 640) setVisibleCount(1);
      else if (window.innerWidth <= 1024) setVisibleCount(2);
      else setVisibleCount(3);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [fetchImages]);

  const maxIndex = Math.max(0, images.length - visibleCount);

  const x = useMotionValue(0);
  const xPercentage = useTransform(x, (val) => `${val}%`);

  useEffect(() => {
    const width = 100 / visibleCount;
    animate(x, -current * width, {
      type: "spring",
      stiffness: 300,
      damping: 30,
    });
  }, [current, visibleCount, x]);

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 50;
    if (info.offset.x < -threshold && current < maxIndex) {
      setCurrent(current + 1);
    } else if (info.offset.x > threshold && current > 0) {
      setCurrent(current - 1);
    } else {
      const width = 100 / visibleCount;
      animate(x, -current * width, {
        type: "spring",
        stiffness: 300,
        damping: 30,
      });
    }
  };

  // Auto-slide
  useEffect(() => {
    if (images.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [maxIndex, images.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIdx === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIdx(null);
      if (e.key === "ArrowRight") setLightboxIdx((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : prev));
      if (e.key === "ArrowLeft") setLightboxIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [lightboxIdx, images.length]);

  if (!mounted || images.length === 0) return null;

  const displayTitle = language === "bn" ? "আমাদের সন্তুষ্ট গ্রাহক" : "Our Happy Customers";

  return (
    <>
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className="section-title">{displayTitle}</h2>
          <p className={styles.subtitle}>
            {language === "bn"
              ? "বিশ্বস্ত গ্রাহকদের সত্যিকারের অভিজ্ঞতা"
              : "Real experiences from our trusted customers"}
          </p>

          <div className={styles.carousel} ref={containerRef}>
            <motion.div
              className={styles.track}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              style={{
                x: xPercentage,
                display: "flex",
                width: `${(images.length / visibleCount) * 100}%`,
              }}
            >
              {images.map((img, i) => (
                <div
                  key={img._id}
                  className={styles.slide}
                  style={{ width: `${(1 / images.length) * 100}%` }}
                >
                  <motion.div
                    className={styles.imageCard}
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    onClick={() => setLightboxIdx(i)}
                  >
                    <div className={styles.imageWrapper}>
                      <Image
                        src={img.imageUrl}
                        alt={img.altText}
                        fill
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                        className={styles.image}
                        quality={85}
                      />
                      <div className={styles.imageOverlay}>
                        <div className={styles.zoomIcon}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                            <path d="M11 8v6" />
                            <path d="M8 11h6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className={styles.cardFooter}>
                      <div className={styles.verifiedBadge}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--primary)" stroke="none">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span>{language === "bn" ? "যাচাইকৃত ক্রেতা" : "Verified Buyer"}</span>
                      </div>
                      <div className={styles.stars}>★★★★★</div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Navigation */}
          <div className={styles.navigation}>
            <button
              className={styles.navBtn}
              onClick={() => setCurrent(Math.max(0, current - 1))}
              disabled={current === 0}
              aria-label="Previous"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <div className={styles.dots}>
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  className={`${styles.dot} ${current === i ? styles.activeDot : ""}`}
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              className={styles.navBtn}
              onClick={() => setCurrent(Math.min(maxIndex, current + 1))}
              disabled={current === maxIndex}
              aria-label="Next"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div className={styles.lightbox} onClick={() => setLightboxIdx(null)}>
          <button className={styles.lightboxClose} onClick={() => setLightboxIdx(null)} aria-label="Close">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>

          {lightboxIdx > 0 && (
            <button
              className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIdx(lightboxIdx - 1);
              }}
              aria-label="Previous image"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          )}

          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[lightboxIdx].imageUrl}
              alt={images[lightboxIdx].altText}
              width={800}
              height={800}
              className={styles.lightboxImage}
              quality={95}
              priority
            />
            <div className={styles.lightboxCounter}>
              {lightboxIdx + 1} / {images.length}
            </div>
          </div>

          {lightboxIdx < images.length - 1 && (
            <button
              className={`${styles.lightboxNav} ${styles.lightboxNext}`}
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIdx(lightboxIdx + 1);
              }}
              aria-label="Next image"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          )}
        </div>
      )}
    </>
  );
}
