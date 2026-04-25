"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import styles from "./profile.module.css";

// Mock data for initial UI
const stats = [
  { label: "Total Orders", value: "12", color: "#f0fdf4" },
  { label: "Pending", value: "02", color: "#fffbeb" },
  { label: "Completed", value: "10", color: "#f0fdf4" },
  { label: "Total Spent", value: "৳ 14,500", color: "#f8fafc" },
];

const recentOrders = [
  { id: "#ORD-9921", date: "Oct 24, 2023", status: "Delivered", total: "৳ 2,450" },
  { id: "#ORD-9845", date: "Oct 20, 2023", status: "Processing", total: "৳ 1,200" },
  { id: "#ORD-9712", date: "Oct 15, 2023", status: "Delivered", total: "৳ 4,100" },
];

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="animate-fade-in">
      <div className={styles.dashboardHeader}>
        <h1>Welcome back, {session?.user?.name}!</h1>
        <p>Here's what's happening with your account today.</p>
      </div>

      {/* STATS */}
      <div className={styles.statsGrid}>
        {stats.map((stat, i) => (
          <div key={i} className={styles.statCard}>
            <span className={styles.statLabel}>{stat.label}</span>
            <span className={styles.statValue}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* RECENT ORDERS */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3>Recent Orders</h3>
          <Link href="/profile/orders" className={styles.viewAll}>View All</Link>
        </div>
        <div className={styles.tableContainer}>
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
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td><strong>{order.id}</strong></td>
                  <td>{order.date}</td>
                  <td>
                    <span className={`${styles.status} ${
                      order.status === "Delivered" ? styles.statusDelivered : 
                      order.status === "Processing" ? styles.statusProcessing : 
                      styles.statusPending
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{order.total}</td>
                  <td>
                    <Link href={`/profile/orders/${order.id}`} className={styles.viewAll}>Details</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
