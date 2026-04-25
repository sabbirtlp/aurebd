import styles from "./admin.module.css";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

export default async function AdminDashboard() {
  await dbConnect();
  
  // Fetch real data
  const totalOrders = await Order.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalUsers = await User.countDocuments({ role: "user" });
  
  const allOrders = await Order.find({}).lean();
  const totalRevenue = allOrders.reduce((acc, order: any) => acc + order.totalAmount, 0);
  
  const recentOrders = await Order.find({}).sort({ createdAt: -1 }).limit(5).populate("user").lean();

  return (
    <>
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
          <span className={styles.statTitle}>Products</span>
          <span className={styles.statValue}>{totalProducts}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statTitle}>Active Customers</span>
          <span className={styles.statValue}>{totalUsers}</span>
        </div>
      </div>

      {/* Main Panels */}
      <div className={styles.chartSection}>
        {/* Recent Orders */}
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Recent Orders</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order: any) => (
                <tr key={order._id.toString()}>
                  <td>#{order._id.toString().slice(-6).toUpperCase()}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>৳ {order.totalAmount}</td>
                  <td>
                    <span className={`${styles.badge} ${order.status === 'Delivered' ? styles.badgeSuccess : styles.badgePending}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr><td colSpan={4} style={{textAlign: "center"}}>No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
