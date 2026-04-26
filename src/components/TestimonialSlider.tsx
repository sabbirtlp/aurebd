"use client";

import { useState, useEffect } from "react";
import styles from "./testimonialSlider.module.css";

const testimonials = [
  { name: "Nusrat J.", text: "The Japan Sakura set transformed my dry skin. It feels so soft and hydrated now!", initial: "N", location: "Dhaka" },
  { name: "Sarah T.", text: "Authentic products and fast delivery. Aurea BD is now my go-to skincare destination.", initial: "S", location: "Chittagong" },
  { name: "Maria K.", text: "The serum is lightweight and absorbs quickly. I've seen a noticeable glow in just a week!", initial: "M", location: "Sylhet" },
  { name: "Raisa M.", text: "Best Japanese skincare shop in Bangladesh. The packaging was so premium too!", initial: "R", location: "Dhaka" }
];

export default function TestimonialSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.slider}>
        {testimonials.map((t, i) => (
          <div 
            key={i} 
            className={`${styles.slide} ${current === i ? styles.active : ""}`}
            style={{ transform: `translateX(${(i - current) * 100}%)` }}
          >
            <div className={`${styles.card} nm-card`}>
              <div className={styles.avatarRow}>
                <div className={styles.avatar}>{t.initial}</div>
                <div>
                  <h4>{t.name}</h4>
                  <span>{t.location}</span>
                </div>
                <div className={styles.stars}>★★★★★</div>
              </div>
              <p className={styles.text}>&quot;{t.text}&quot;</p>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.dots}>
        {testimonials.map((_, i) => (
          <button 
            key={i} 
            className={`${styles.dot} ${current === i ? styles.activeDot : ""}`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </div>
  );
}
