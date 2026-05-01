"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import styles from "./profile.module.css";
import Image from "next/image";
import { useUserStore } from "@/store/userStore";
import { useHasHydrated } from '@/hooks/useHasHydrated';

const menuItems = [
  { label: "Dashboard", href: "/profile", icon: "📊" },
  { label: "My Orders", href: "/profile/orders", icon: "📦" },
  { label: "Addresses", href: "/profile/addresses", icon: "📍" },
  { label: "Wishlist", href: "/wishlist", icon: "💖" },
  { label: "Settings", href: "/profile/settings", icon: "⚙️" },
];

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const hasHydrated = useHasHydrated();
  const pathname = usePathname();
  const router = useRouter();
  const { profileImage, userName } = useUserStore();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <main className={styles.profilePage}>
        <div className="container">
          <div className={styles.layoutGrid}>
            <aside className={styles.sidebar}>
              <div className={styles.skeletonBase} style={{ width: '100%', height: '120px', marginBottom: '2rem' }} />
              <div className={styles.sideNav}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={styles.skeletonLine} style={{ height: '45px', marginBottom: '10px' }} />
                ))}
              </div>
            </aside>
            <section className={styles.mainContent}>
              <div className={styles.skeletonHeader} />
              <div className={styles.skeletonSub} />
              <div className={styles.skeletonStats}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={styles.skeletonStatCard} />
                ))}
              </div>
              <div className={styles.skeletonCard} />
            </section>
          </div>
        </div>
      </main>
    );
  }

  if (!session) return null;

  return (
    <main className={`${styles.profilePage} animate-fade-in`}>
      <div className="container">
        <div className={styles.layoutGrid}>
          {/* SIDEBAR */}
          <aside className={styles.sidebar}>
            <div className={styles.userBrief}>
              <div className={styles.avatar} style={{ overflow: "hidden", position: "relative" }}>
                {profileImage ? (
                  <Image 
                    src={profileImage} 
                    alt="Profile" 
                    fill 
                    style={{ objectFit: "cover" }} 
                  />
                ) : session.user?.image ? (
                  <Image 
                    src={session.user.image} 
                    alt="Profile" 
                    fill 
                    style={{ objectFit: "cover" }} 
                  />
                ) : (
                  (session.user?.name || userName).charAt(0)
                )}
              </div>
              <div className={styles.userInfo}>
                <h4>{session.user?.name || (hasHydrated ? userName : "Loading...")}</h4>
                <p>{session.user?.email}</p>
              </div>
            </div>

            <nav className={styles.sideNav}>
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navItem} ${pathname === item.href ? styles.active : ""}`}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              <button onClick={() => signOut()} className={styles.logoutBtn}>
                <span className={styles.navIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                </span>
                Logout Account
              </button>
            </nav>
          </aside>

          {/* MAIN CONTENT */}
          <section className={styles.mainContent}>
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
