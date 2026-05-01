import styles from "./admin.module.css";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import Link from "next/link";
import RecentOrdersTable from "./RecentOrdersTable";

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
        <RecentOrdersTable initialOrders={recentOrders.map(o => ({...o, _id: o._id.toString()}))} />
      </div>
    </>
  );
}
