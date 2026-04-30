"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import styles from "./admin.module.css";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/products", label: "Products", icon: "🛍️" },
  { href: "/admin/orders", label: "Orders", icon: "📦" },
  { href: "/admin/testimonials", label: "Testimonials", icon: "💬" },
  { href: "/admin/pages", label: "Pages (CMS)", icon: "📝" },
  { href: "/admin/customers", label: "Customers", icon: "👥" },
];

export default function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className={styles.mobileHeader}>
        <Link href="/admin">
          <Image src="/images/logo-v2.png" alt="Aurea BD Logo" width={120} height={40} style={{ objectFit: "contain" }} />
        </Link>
        <button className={styles.mobileMenuBtn} onClick={() => setIsOpen(true)}>
          <Menu size={28} />
        </button>
      </div>

      {/* Mobile Overlay */}
      <div 
        className={`${styles.mobileOverlay} ${isOpen ? styles.open : ""}`} 
        onClick={() => setIsOpen(false)} 
      />

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <div className={styles.sidebarLogo}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <Link href="/">
              <Image src="/images/logo-v2.png" alt="Aurea BD Logo" width={160} height={50} style={{ objectFit: "contain" }} />
            </Link>
            <button className={styles.closeSidebarBtn} onClick={() => setIsOpen(false)}>
              <X size={24} />
            </button>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive(item.href) ? styles.navItemActive : ""}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.adminUser}>
            <div className={styles.avatar}>{userName[0].toUpperCase()}</div>
            <div>
              <p className={styles.adminName}>{userName}</p>
              <p className={styles.adminRole}>Administrator</p>
            </div>
          </div>
          <Link href="/" className={styles.backLink}>
            ← Back to Shop
          </Link>
        </div>
      </aside>
    </>
  );
}
