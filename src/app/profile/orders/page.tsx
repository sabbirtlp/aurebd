"use client";

import Link from "next/link";
import styles from "../profile.module.css";

const allOrders = [
  { id: "#ORD-9921", date: "Oct 24, 2023", status: "Delivered", total: "৳ 2,450", items: 2 },
  { id: "#ORD-9845", date: "Oct 20, 2023", status: "Processing", total: "৳ 1,200", items: 1 },
  { id: "#ORD-9712", date: "Oct 15, 2023", status: "Delivered", total: "৳ 4,100", items: 3 },
  { id: "#ORD-9654", date: "Oct 10, 2023", status: "Cancelled", total: "৳ 850", items: 1 },
  { id: "#ORD-9520", date: "Oct 05, 2023", status: "Delivered", total: "৳ 3,200", items: 2 },
];

export default function OrdersPage() {
  return (
    <div className="animate-fade-in">
      <div className={styles.dashboardHeader}>
        <h1>My Orders</h1>
        <p>Track, manage and view your order history.</p>
      </div>

      <div className={styles.card}>
        <div className={styles.tableContainer}>
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
              {allOrders.map((order) => (
                <tr key={order.id}>
                  <td><strong>{order.id}</strong></td>
                  <td>{order.date}</td>
                  <td>{order.items} Products</td>
                  <td>
                    <span className={`${styles.status} ${
                      order.status === "Delivered" ? styles.statusDelivered : 
                      order.status === "Processing" ? styles.statusProcessing : 
                      order.status === "Cancelled" ? styles.statusCancelled :
                      styles.statusPending
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{order.total}</td>
                  <td>
                    <Link href={`/profile/orders/${order.id}`} className={styles.viewAll}>View Details</Link>
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
