"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./admin.module.css";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/products", label: "Products", icon: "🛍️" },
  { href: "/admin/orders", label: "Orders", icon: "📦" },
  { href: "/admin/pages", label: "Pages (CMS)", icon: "📝" },
  { href: "/admin/customers", label: "Customers", icon: "👥" },
];

export default function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarLogo}>
        <Link href="/">
          <Image src="/images/logo-cropped.png" alt="Aurea BD Logo" width={160} height={50} style={{ objectFit: "contain" }} />
        </Link>
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
  );
}
