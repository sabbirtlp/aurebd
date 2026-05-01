"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useLanguageStore } from "@/store/languageStore";
import styles from "./searchOverlay.module.css";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { t } = useLanguageStore();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className={styles.searchCard}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className={styles.header}>
              <h3>{t('search.title')}</h3>
              <button className={styles.closeBtn} onClick={onClose}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <form onSubmit={handleSearch} className={styles.form}>
              <div className={styles.inputWrapper}>
                <input 
                  type="text" 
                  placeholder={t('search.placeholder')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                  className={styles.searchInput}
                />
                <button type="submit" className={styles.searchBtn}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </button>
              </div>
            </form>

            <div className={styles.suggestions}>
              <p>{t('search.popular')}</p>
              <div className={styles.tagGroup}>
                {["Sakura", "Serum", "Set", "Cleanser", "Sunscreen"].map(tag => (
                  <button 
                    key={tag} 
                    className={styles.tag}
                    onClick={() => {
                      setQuery(tag);
                      router.push(`/search?q=${tag}`);
                      onClose();
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
