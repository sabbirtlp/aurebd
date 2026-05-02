"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, Clock, CheckCircle2, Wallet, ArrowRight, Loader2 } from "lucide-react";
import styles from "./profile.module.css";

interface Order {
  id: string;
  _id: string;
  date: string;
  status: string;
  total: string;
}

interface Stat {
  label: string;
  value: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stat[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [hasPassword, setHasPassword] = useState(true);
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/profile/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setRecentOrders(data.recentOrders);
          setHasPassword(data.hasPassword);
        }
      } catch (err) {
        console.error("Failed to fetch profile stats");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });

      if (res.ok) {
        alert("Password set successfully!");
        setHasPassword(true);
        setNewPassword("");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to set password");
      }
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setPasswordLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      window.scrollTo(0, 0);
    }
  }, [loading]);

  const getStatIcon = (label: string) => {
    switch (label) {
      case "Total Orders": return <Package size={20} />;
      case "Pending": return <Clock size={20} />;
      case "Completed": return <CheckCircle2 size={20} />;
      case "Total Spent": return <Wallet size={20} />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className={styles.dashboardWrapper}>
        <div className={styles.skeletonHeader} />
        <div className={styles.skeletonSub} />
        
        <div className={styles.skeletonStats}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={styles.skeletonStatCard} />
          ))}
        </div>
        
        <div className={styles.skeletonCard} />
      </div>
    );
  }

  return (
    <div className={styles.dashboardWrapper}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.dashboardHeader}
      >
        <h1 className={styles.welcomeTitle}>
          Welcome back, <span className={styles.highlight}>{session?.user?.name?.split(' ')[0]}</span>!
        </h1>
        <p className={styles.welcomeSubtitle}>Here&apos;s a quick overview of your account activity.</p>
      </motion.div>

      {/* STATS GRID */}
      <div className={styles.statsGrid}>
        {stats.map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={styles.statCard}
          >
            <div className={styles.statIconWrapper}>
              {getStatIcon(stat.label)}
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>{stat.label}</span>
              <span className={styles.statValue}>{stat.value}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* SECURITY - SETUP PASSWORD */}
      {!hasPassword && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={styles.card}
          style={{ marginBottom: '2rem', border: '1px solid var(--primary)', background: 'rgba(var(--primary-rgb), 0.05)' }}
        >
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleGroup}>
              <h3>Setup Your Password</h3>
              <p>You created this account during guest checkout. Set a password to log in easily next time.</p>
            </div>
          </div>
          <form onSubmit={handleSetPassword} style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <input 
              type="password" 
              placeholder="New Password (min 6 characters)" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={styles.nmInput}
              style={{ flex: 1, minWidth: '250px' }}
              required
            />
            <button 
              type="submit" 
              className="btn-nm btn-nm-primary" 
              disabled={passwordLoading}
              style={{ height: '48px', minWidth: '150px' }}
            >
              {passwordLoading ? 'Saving...' : 'Set Password'}
            </button>
          </form>
        </motion.div>
      )}

      {/* RECENT ORDERS */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={styles.card}
      >
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleGroup}>
            <h3>Recent Orders</h3>
            <p>Your latest transactions</p>
          </div>
          <Link href="/profile/orders" className={styles.viewAllBtn}>
            View All <ArrowRight size={16} />
          </Link>
        </div>
        
        <div className={styles.tableContainer}>
          {recentOrders.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, i) => (
                  <motion.tr 
                    key={order.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + (i * 0.05) }}
                  >
                    <td><span className={styles.orderId}>{order.id}</span></td>
                    <td className={styles.dateCell}>{order.date}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}>
                        <span className={styles.statusDot} />
                        {order.status}
                      </span>
                    </td>
                    <td className={styles.priceCell}>{order.total}</td>
                    <td>
                      <Link href={`/profile/orders/${order._id}`} className={styles.detailsLink}>
                        Details
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.emptyState}>
              <Package size={48} />
              <p>You haven&apos;t placed any orders yet.</p>
              <Link href="/shop" className={styles.shopNowBtn}>Start Shopping</Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
