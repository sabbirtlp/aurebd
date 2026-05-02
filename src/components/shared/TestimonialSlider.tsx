"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLanguageStore } from "@/store/languageStore";
import { motion, useMotionValue, useSpring, useTransform, animate } from "framer-motion";
import styles from "./testimonialSlider.module.css";

const testimonialsBn = [
  { name: "নুসরাত জে.", text: "জাপান সাকুরা সেটটি আমার শুষ্ক ত্বককে বদলে দিয়েছে। এটি এখন অনেক নরম এবং হাইড্রেটেড অনুভূত হয়!", initial: "N", location: "ঢাকা" },
  { name: "সারা টি.", text: "আসল পণ্য এবং দ্রুত ডেলিভারি। অরিয়া বিডি এখন আমার প্রিয় স্কিনকেয়ার শপ।", initial: "S", location: "চট্টগ্রাম" },
  { name: "মারিয়া কে.", text: "সিরামটি খুব হালকা এবং দ্রুত শোষিত হয়। মাত্র এক সপ্তাহে আমি আমার ত্বকে এক উজ্জ্বলতা লক্ষ্য করেছি!", initial: "M", location: "সিলেট" },
  { name: "রাইসা এম.", text: "বাংলাদেশে জাপানি স্কিনকেয়ারের সেরা দোকান। তাদের প্যাকেজিংও খুব প্রিমিয়াম ছিল!", initial: "R", location: "ঢাকা" },
  { name: "ফারহানা এ.", text: "আমি তাদের হাইড্রেশন ক্রিমের প্রেমে পড়েছি। আমার ত্বক অনেক সতেজ এবং প্রাণবন্ত অনুভূত হয়।", initial: "F", location: "রাজশাহী" }
];

const testimonialsEn = [
  { name: "Nusrat J.", text: "The Japan Sakura set transformed my dry skin. It feels so soft and hydrated now!", initial: "N", location: "Dhaka" },
  { name: "Sarah T.", text: "Authentic products and fast delivery. Aurea BD is now my go-to skincare destination.", initial: "S", location: "Chittagong" },
  { name: "Maria K.", text: "The serum is lightweight and absorbs quickly. I've seen a noticeable glow in just a week!", initial: "M", location: "Sylhet" },
  { name: "Raisa M.", text: "Best Japanese skincare shop in Bangladesh. The packaging was so premium too!", initial: "R", location: "Dhaka" },
  { name: "Farhana A.", text: "I am absolutely in love with the hydration creams. My skin feels plump and youthful.", initial: "F", location: "Rajshahi" }
];

interface Testimonial {
  name: string;
  text: string;
  initial: string;
  location: string;
}

interface TestimonialSliderProps {
  items?: Testimonial[];
  title?: string;
}

export default function TestimonialSlider({ items, title }: TestimonialSliderProps) {
  const { language } = useLanguageStore();
  const [current, setCurrent] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [mounted, setMounted] = useState(false);
  const [dbTestimonials, setDbTestimonials] = useState<any[]>([]);
  const constraintsRef = useRef(null);

  const staticItems = language === 'bn' ? testimonialsBn : testimonialsEn;
  const formattedStatic = staticItems.map(s => ({
    name: s.name,
    content: s.text,
    role: s.location,
    rating: 5,
    initial: s.initial
  }));

  const displayItems = items || (dbTestimonials.length > 0 ? dbTestimonials : formattedStatic);
  const displayTitle = title || (language === 'bn' ? 'গ্রাহকদের কথা' : 'What Our Clients Say');

  const fetchTestimonials = useCallback(async () => {
    try {
      const res = await fetch(`/api/testimonials?lang=${language}`);
      const data = await res.json();
      if (data.testimonials && data.testimonials.length > 0) {
        setDbTestimonials(data.testimonials);
      }
    } catch (err) {
      console.error("Failed to fetch testimonials");
    }
  }, [language]);

  useEffect(() => {
    setMounted(true);
    fetchTestimonials();
    const handleResize = () => {
      if (window.innerWidth <= 768) setVisibleCount(1);
      else if (window.innerWidth <= 1024) setVisibleCount(2);
      else setVisibleCount(3);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [language, fetchTestimonials]);

  const maxIndex = Math.max(0, displayItems.length - visibleCount);

  const x = useMotionValue(0);
  const xPercentage = useTransform(x, (val) => `${val}%`);

  useEffect(() => {
    // Snap to current index
    const width = 100 / visibleCount;
    animate(x, -current * width, {
      type: "spring",
      stiffness: 300,
      damping: 30
    });
  }, [current, visibleCount, x]);

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 50; // pixels to trigger slide
    if (info.offset.x < -threshold && current < maxIndex) {
      setCurrent(current + 1);
    } else if (info.offset.x > threshold && current > 0) {
      setCurrent(current - 1);
    } else {
      // Re-animate to current
      const width = 100 / visibleCount;
      animate(x, -current * width, {
        type: "spring",
        stiffness: 300,
        damping: 30
      });
    }
  };

  useEffect(() => {
    if (displayItems.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 8000); // Increased time for better readability
    return () => clearInterval(timer);
  }, [maxIndex, displayItems.length]);

  if (!mounted) return null;

  return (
    <div className={styles.sliderContainer}>
      <h2 className="section-title">{displayTitle}</h2>
      <div className={styles.slider} ref={constraintsRef}>
        <motion.div 
          className={styles.track}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }} // We handle constraints manually via snap
          onDragEnd={handleDragEnd}
          style={{ 
            x: xPercentage,
            display: "flex",
            width: `${(displayItems.length / visibleCount) * 100}%`
          }}
        >
          {displayItems.map((t, i) => (
            <div 
              key={i} 
              className={styles.slide}
              style={{ width: `${(1 / displayItems.length) * 100}%` }}
            >
              <div className={`${styles.card} nm-card`}>
                <div className={styles.avatarRow}>
                  <div className={styles.avatar}>{t.initial || t.name.charAt(0)}</div>
                  <div className={styles.authorInfo}>
                    <h4>{t.name}</h4>
                    <span>{t.role || t.location}</span>
                  </div>
                  <div className={styles.stars}>
                    {"★".repeat(t.rating || 5)}{"☆".repeat(5 - (t.rating || 5))}
                  </div>
                </div>
                <p className={styles.text}>&quot;{t.content || t.text}&quot;</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
      {maxIndex > 0 && (
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
      )}
    </div>
  );
}
