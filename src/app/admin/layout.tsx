import Link from "next/link";
import Image from "next/image";
import styles from "./admin.module.css";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className={styles.adminContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo} style={{ padding: "0 1.5rem", marginBottom: "2rem", display: "flex", justifyContent: "center" }}>
          <Link href="/">
            <Image src="/images/logo-cropped.png" alt="Aurea BD Logo" width={160} height={50} style={{ objectFit: "contain" }} />
          </Link>
        </div>
        <nav>
          <Link href="/admin" className={`${styles.navItem} ${styles.navItemActive}`}>
            📊 Dashboard
          </Link>
          <Link href="/admin/products" className={styles.navItem}>
            🛍️ Products
          </Link>
          <Link href="/admin/orders" className={styles.navItem}>
            📦 Orders
          </Link>
          <Link href="/admin/stock" className={styles.navItem}>
            📈 Stock
          </Link>
          <Link href="/admin/customers" className={styles.navItem}>
            👥 Customers
          </Link>
          <Link href="/" className={styles.navItem} style={{ marginTop: "auto", borderTop: "1px solid #374151" }}>
            ⬅️ Back to Shop
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h2 className={styles.pageTitle}>Dashboard</h2>
          <div className={styles.adminProfile}>
            <span style={{ fontWeight: 500 }}>{session.user.name}</span>
            <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
              {session.user.name?.[0].toUpperCase()}
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
