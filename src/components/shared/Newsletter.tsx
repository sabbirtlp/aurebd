"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/store/languageStore";
import styles from "./newsletter.module.css";

export default function Newsletter() {
  const { t, language } = useLanguageStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tr = (key: string) => mounted ? t(key) : key;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(language === 'bn' ? 'সাবস্ক্রাইব করার জন্য ধন্যবাদ! আমরা আপনাকে আপডেট জানাব।' : 'Thank you for subscribing! We will keep you updated.');
  };

  return (
    <section className={styles.newsletterSection}>
      <div className="container">
        <div className={styles.newsletterCard}>
          <div className={styles.contentWrapper}>
            <h2 className={styles.title}>{language === 'bn' ? 'আমাদের ইনার সার্কেলে যোগ দিন' : 'Join Our Inner Circle'}</h2>
            <p className={styles.subtitle}>
              {language === 'bn' 
                ? 'নতুন কালেকশন, পার্সোনালাইজড স্কিনকেয়ার পরামর্শ এবং মেম্বার-অনলি সুবিধার জন্য সাবস্ক্রাইব করুন।' 
                : 'Subscribe to receive exclusive access to new arrivals, personalized skincare advice, and member-only privileges.'}
            </p>
            <form className={styles.form} onSubmit={handleSubmit}>
              <input 
                type="email" 
                placeholder={language === 'bn' ? 'আপনার ইমেল ঠিকানা লিখুন' : 'Enter your email address'} 
                required 
                className={styles.input}
              />
              <button type="submit" className={styles.button}>{language === 'bn' ? 'সাবস্ক্রাইব' : 'Subscribe'}</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
