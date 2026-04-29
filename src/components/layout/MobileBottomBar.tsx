"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import SearchOverlay from "./SearchOverlay";
import styles from "./mobileBottomBar.module.css";

export default function MobileBottomBar() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { data: session } = useSession();
  const { items, toggleCart } = useCartStore();
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    {
      path: "/",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      )
    },
    {
      path: "/shop",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
      )
    },
    {
      path: "/search",
      isAction: true,
      action: () => setIsSearchOpen(true),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      )
    },
    {
      path: session ? "/profile" : "/login",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      )
    }
  ];

  return (
    <>
      <nav className={styles.bottomBar}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          
          const content = (
            <motion.div 
              className={styles.iconWrapper}
              animate={{ 
                scale: isActive ? 1.2 : 1,
                color: isActive ? "var(--primary)" : "var(--text-light)"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <span style={{ position: "relative", zIndex: 10, display: "flex" }}>
                {item.icon}
              </span>
              
              {isActive && (
                <>
                  <motion.div 
                    layoutId="active-pill"
                    className={styles.activePill}
                    initial={false}
                    transition={{
                      type: "spring", stiffness: 350, damping: 30, mass: 1
                    }}
                  />
                </>
              )}
            </motion.div>
          );

          if ('isAction' in item && item.isAction) {
            return (
              <button 
                key={item.path} 
                onClick={item.action} 
                className={`${styles.navItem} ${isActive ? styles.active : ""}`}
              >
                {content}
              </button>
            );
          }

          return (
            <Link 
              key={item.path} 
              href={item.path} 
              className={`${styles.navItem} ${isActive ? styles.active : ""}`}
            >
              {content}
            </Link>
          );
        })}
        
        <button 
          className={styles.navItem} 
          onClick={() => toggleCart(true)}
          aria-label="Toggle Cart"
        >
          <motion.div 
            className={styles.iconWrapper}
            whileTap={{ scale: 0.85 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <span style={{ position: "relative", zIndex: 10, display: "flex" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
            </span>
          </motion.div>
        </button>
      </nav>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}

