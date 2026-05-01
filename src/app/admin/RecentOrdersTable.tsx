"use client";

import { useState } from "react";
import styles from "../admin.module.css";
import Link from "next/link";

export default function RecentOrdersTable({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrders(orders.map((o) => o._id === orderId ? { ...o, status: newStatus } : o));
      } else {
        alert("Failed to update status.");
      }
    } catch (error) {
      alert("An error occurred.");
    } finally {
      setUpdating(null);
    }
  };

  return (
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
          {orders.map((order: any) => (
            <tr key={order._id}>
              <td style={{ fontWeight: 600 }}>#{order._id.toString().slice(-6).toUpperCase()}</td>
              <td>{order.shippingAddress?.fullName || "N/A"}</td>
              <td>৳ {order.totalAmount}</td>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              <td>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  className={styles.statusSelect}
                  disabled={updating === order._id}
                  style={{
                    padding: "4px 8px",
                    fontSize: "0.75rem",
                    borderRadius: "6px",
                    background: "var(--bg-color)",
                    color: "var(--text-dark)",
                    border: "1px solid var(--border)",
                    boxShadow: "var(--nm-inner-pressed-sm)"
                  }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr><td colSpan={5} style={{textAlign: "center", color: "#9ca3af", padding: "2rem"}}>No orders yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
