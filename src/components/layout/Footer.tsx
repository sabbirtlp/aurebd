"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useLanguageStore } from "@/store/languageStore";
import styles from "./footer.module.css";

export default function Footer() {
  const { t } = useLanguageStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tr = (key: string) => mounted ? t(key) : key;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert(language === 'bn' ? 'আমাদের নিউজলেটারে সাবস্ক্রাইব করার জন্য ধন্যবাদ।' : 'Thank you for subscribing to our newsletter.');
  };

  const { language } = useLanguageStore();

  return (
    <footer className={styles.footerSection}>
      <div className={styles.footerContainer}>
        <div className={styles.footerContent}>
          <div className={styles.footerGrid}>

            {/* BRAND COLUMN */}
            <div className={styles.brandCol}>
              <Image
                src="/images/logo-v2.png"
                alt="Aurea BD"
                width={600}
                height={200}
                style={{ width: "auto", height: "64px", objectFit: "contain" }}
              />
              <p className={styles.brandDesc}>
                {tr('footer.description')}
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
              <h4>{tr('footer.shop')}</h4>
              <ul>
                <li><Link href="/shop">{tr('footer.all_products')}</Link></li>
                <li><Link href="/shop?category=Skin+Essentials">{language === 'bn' ? 'স্কিন এসেনশিয়ালস' : 'Skin Essentials'}</Link></li>
                <li><Link href="/shop?category=Radiance+Serums">{language === 'bn' ? 'রেডিয়েন্স সিরাম' : 'Radiance Serums'}</Link></li>
                <li><Link href="/shop?category=Hydration+Creams">{language === 'bn' ? 'হাইড্রেশন ক্রিম' : 'Hydration Creams'}</Link></li>
              </ul>
            </div>

            {/* SUPPORT COLUMN */}
            <div className={styles.linkCol}>
              <h4>{tr('footer.support')}</h4>
              <ul>
                <li><Link href="/shipping">{tr('footer.shipping_policy')}</Link></li>
                <li><Link href="/returns">{tr('footer.returns')}</Link></li>
                <li><Link href="/contact">{tr('nav.contact')}</Link></li>
                <li><Link href="/faq">{tr('footer.faq')}</Link></li>
              </ul>
            </div>

            {/* NEWSLETTER COLUMN */}
            <div className={styles.newsletterCol}>
              <h4>{tr('footer.stay_connected')}</h4>
              <p>{tr('footer.newsletter_text')}</p>
              <form className={styles.newsletterForm} onSubmit={handleSubscribe}>
                <input
                  type="email"
                  placeholder={language === 'bn' ? 'ইমেল অ্যাড্রেস' : 'Email address'}
                  required
                  className={styles.input}
                />
                <button type="submit" className={styles.button}>{tr('footer.subscribe')}</button>
              </form>
            </div>

          </div>

          <div className={styles.bottomBar}>
            <span className={styles.bottomText}>&copy; {new Date().getFullYear()} Aurea BD. {tr('footer.rights')}</span>
            <div className={styles.bottomLinks}>
              <Link href="/privacy-policy">{tr('footer.privacy')}</Link>
              <Link href="/terms-of-service">{tr('footer.terms')}</Link>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
