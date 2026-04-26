"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./hero.module.css";

const slides = [
  {
    id: 1,
    tagline: "Premium Japanese Skincare",
    title: "Protect Your \n Skin This \n Summer",
    subtitle: "SPF 50+ protection infused with Sakura extracts for a weightless, non-greasy glow.",
    image: "/images/premium-hero-bg.png",
  },
  {
    id: 2,
    tagline: "Nature Meets Science",
    title: "Glow From \n Within \n Naturally",
    subtitle: "Experience the legend of Japanese Sakura distilled into pure, potent skincare.",
    image: "/images/sakura-hero-banner.png",
  },
  {
    id: 3,
    tagline: "The Art of Self-Care",
    title: "Complete \n Ritual For \n Radiance",
    subtitle: "A holistic 5-step journey to your most luminous skin ever.",
    image: "/images/sakura-set.png",
  }
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 8000);
    return () => clearInterval(timer);
  }, [current]);

  const handleNext = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
      setIsAnimating(false);
    }, 800);
  };

  const handlePrev = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
      setIsAnimating(false);
    }, 800);
  };

  return (
    <section className={styles.heroWrapper}>
      {/* SAKURA PETALS (Subtle Layer) */}
      <div className={styles.petalsContainer}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className={styles.petal} style={{ left: `${i * 25}%`, animationDelay: `${i * 2}s` }}>🌸</div>
        ))}
      </div>

      <div className={`${styles.splitGrid} ${isAnimating ? styles.isChanging : ""}`}>
        {/* LEFT SIDE - CONTENT */}
        <div className={styles.contentSide}>
          <div className={styles.contentBg}>
            <div className={styles.grainOverlay}></div>
          </div>
          
          <div className={styles.contentInner}>
            <div className={styles.textStack}>
              <span className={styles.tagline}>{slides[current].tagline}</span>
              <h1 className={styles.title}>
                {slides[current].title.split('\n').map((line, i) => (
                  <span key={i} className={styles.titleLine}>{line}<br/></span>
                ))}
              </h1>
              <p className={styles.subtitle}>{slides[current].subtitle}</p>
              <div className={styles.ctaRow}>
                <Link href="/shop" className={`${styles.primaryBtn} pulse`}>
                  Shop The Collection
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - IMAGE */}
        <div className={styles.imageSide}>
          <div className={styles.imageContainer}>
            <Image 
              src={slides[current].image} 
              alt={slides[current].title} 
              fill 
              className={styles.heroImg}
              priority
            />
            <div className={styles.imageOverlay}></div>
            <div className={styles.edgeFade}></div>
          </div>
        </div>
      </div>

      {/* MINIMAL CONTROLS */}
      <div className={styles.controls}>
        <div className={styles.indicators}>
          {slides.map((_, i) => (
            <button 
              key={i} 
              className={`${styles.dot} ${current === i ? styles.activeDot : ""}`}
              onClick={() => {
                setIsAnimating(true);
                setTimeout(() => { setCurrent(i); setIsAnimating(false); }, 800);
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
