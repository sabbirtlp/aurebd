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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/profile/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setRecentOrders(data.recentOrders);
        }
      } catch (err) {
        console.error("Failed to fetch profile stats");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

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
      <div className={styles.loadingContainer}>
        <Loader2 className="animate-spin" size={40} color="var(--primary)" />
        <p>Polishing your dashboard...</p>
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
