"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Package, ArrowRight, Loader2, Search, Filter } from "lucide-react";
import styles from "../profile.module.css";

interface Order {
  id: string;
  _id: string;
  date: string;
  status: string;
  total: string;
  items: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/profile/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!loading) {
      window.scrollTo(0, 0);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className={styles.ordersWrapper}>
        <div className={styles.skeletonHeader} />
        <div className={styles.skeletonSub} />
        <div className={styles.skeletonCard} />
      </div>
    );
  }

  return (
    <div className={styles.ordersWrapper}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.welcomeTitle}>My <span className={styles.highlight}>Orders</span></h1>
        <p className={styles.welcomeSubtitle}>Track, manage and view your complete order history.</p>
      </div>

      <div className={styles.ordersToolbar}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input type="text" placeholder="Search by order ID..." />
        </div>
        <button className={styles.filterBtn}>
          <Filter size={18} /> Filter
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.card}
      >
        <div className={styles.tableContainer}>
          {orders.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {orders.map((order, i) => (
                    <motion.tr 
                      key={order._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <td><span className={styles.orderId}>{order.id}</span></td>
                      <td className={styles.dateCell}>{order.date}</td>
                      <td className={styles.itemsCell}>{order.items} {order.items === 1 ? 'Product' : 'Products'}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}>
                          <span className={styles.statusDot} />
                          {order.status}
                        </span>
                      </td>
                      <td className={styles.priceCell}>{order.total}</td>
                      <td>
                        <Link href={`/profile/orders/${order._id}`} className={styles.detailsLink}>
                          View Details <ArrowRight size={14} />
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          ) : (
            <div className={styles.emptyState}>
              <Package size={64} opacity={0.2} />
              <h3>No orders yet</h3>
              <p>Looks like you haven&apos;t placed any orders with us yet.</p>
              <Link href="/shop" className={styles.shopNowBtn}>Start Shopping</Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
