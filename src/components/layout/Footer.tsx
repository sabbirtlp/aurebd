"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./footer.module.css";

export default function Footer() {
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for subscribing to our newsletter.');
  };

  return (
    <footer className={styles.footerSection}>
      <div className={styles.footerContainer}>
        <div className={styles.footerContent}>
          <div className={styles.footerGrid}>
            
            {/* BRAND COLUMN */}
            <div className={styles.brandCol}>
              <Image 
                src="/images/logo-cropped.png" 
                alt="Aurea BD" 
                width={120} 
                height={34} 
                style={{ filter: "brightness(0.8) sepia(1) hue-rotate(-50deg) saturate(0.5)" }} // Tint logo slightly to match palette if it's black
              />
              <p className={styles.brandDesc}>
                Your premium destination for authentic Japanese skincare in Bangladesh. Elevate your beauty routine with nature&apos;s finest ingredients.
              </p>
              
              <div className={styles.socialIcons}>
                <button className={styles.socialBtn} aria-label="Facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </button>
                <button className={styles.socialBtn} aria-label="Instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </button>
                <button className={styles.socialBtn} aria-label="Twitter">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                </button>
              </div>
            </div>

            {/* SHOP COLUMN */}
            <div className={styles.linkCol}>
              <h4>Shop</h4>
              <ul>
                <li><Link href="/shop">All Products</Link></li>
                <li><Link href="/shop?category=Skin+Essentials">Skin Essentials</Link></li>
                <li><Link href="/shop?category=Radiance+Serums">Radiance Serums</Link></li>
                <li><Link href="/shop?category=Hydration+Creams">Hydration Creams</Link></li>
              </ul>
            </div>

            {/* SUPPORT COLUMN */}
            <div className={styles.linkCol}>
              <h4>Support</h4>
              <ul>
                <li><Link href="/contact">Shipping Policy</Link></li>
                <li><Link href="/contact">Returns & Refunds</Link></li>
                <li><Link href="/contact">Contact Us</Link></li>
                <li><Link href="/contact">FAQ</Link></li>
              </ul>
            </div>

            {/* NEWSLETTER COLUMN */}
            <div className={styles.newsletterCol}>
              <h4>Stay Connected</h4>
              <p>Subscribe for exclusive offers and skincare advice.</p>
              <form className={styles.newsletterForm} onSubmit={handleSubscribe}>
                <input 
                  type="email" 
                  placeholder="Email address" 
                  required 
                  className={styles.input}
                />
                <button type="submit" className={styles.button}>Subscribe</button>
              </form>
            </div>

          </div>

          <div className={styles.bottomBar}>
            <span className={styles.bottomText}>&copy; {new Date().getFullYear()} Aurea BD. Designed for Radiance.</span>
            <div className={styles.bottomLinks}>
              <Link href="#">Privacy Policy</Link>
              <Link href="#">Terms of Service</Link>
            </div>
          </div>
          
        </div>
      </div>
    </footer>
  );
}
