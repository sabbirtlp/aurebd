import styles from "./admin.module.css";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import Link from "next/link";

export default async function AdminDashboard() {
  await dbConnect();
  
  const totalOrders = await Order.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalUsers = await User.countDocuments({ role: "user" });
  
  const allOrders = await Order.find({}).lean();
  const totalRevenue = allOrders.reduce((acc, order: any) => acc + order.totalAmount, 0);
  
  const recentOrders = await Order.find({}).sort({ createdAt: -1 }).limit(8).lean();
  const pendingOrders = await Order.countDocuments({ status: "Pending" });

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Dashboard</h2>
          <p className={styles.pageSubtitle}>Welcome back! Here&apos;s your business overview.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statTitle}>Total Revenue</span>
          <span className={styles.statValue}>৳ {totalRevenue.toLocaleString()}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statTitle}>Total Orders</span>
          <span className={styles.statValue}>{totalOrders}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statTitle}>Pending Orders</span>
          <span className={styles.statValue}>{pendingOrders}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statTitle}>Products</span>
          <span className={styles.statValue}>{totalProducts}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <Link href="/admin/products/new" className={styles.btnPrimary}>+ Add Product</Link>
        <Link href="/admin/orders" className={styles.btnSecondary}>📦 View All Orders</Link>
        <Link href="/admin/pages" className={styles.btnSecondary}>📝 Edit Pages</Link>
      </div>

      {/* Recent Orders */}
      <div className={styles.chartSection}>
        <div className={styles.panel}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 className={styles.panelTitle} style={{ marginBottom: 0 }}>Recent Orders</h3>
            <Link href="/admin/orders" className={styles.btnSecondary} style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}>
              View All →
            </Link>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order: any) => (
                <tr key={order._id.toString()}>
                  <td style={{ fontWeight: 600 }}>#{order._id.toString().slice(-6).toUpperCase()}</td>
                  <td>{order.shippingAddress?.fullName || "N/A"}</td>
                  <td>৳ {order.totalAmount}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`${styles.badge} ${
                      order.status === 'Delivered' ? styles.badgeSuccess : 
                      order.status === 'Processing' ? styles.badgeProcessing : 
                      styles.badgePending
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr><td colSpan={5} style={{textAlign: "center", color: "#9ca3af", padding: "2rem"}}>No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
