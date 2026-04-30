"use client";

import { useState } from "react";
import styles from "../admin.module.css";

export default function AdminOrdersClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");

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

  const handleDelete = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, { method: "DELETE" });
      if (res.ok) {
        setOrders(orders.filter((o) => o._id !== orderId));
      } else {
        alert("Failed to delete order.");
      }
    } catch (error) {
      alert("An error occurred.");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === "All" ? orders : orders.filter((o) => o.status === filter);

  const statusCounts = {
    All: orders.length,
    Pending: orders.filter(o => o.status === "Pending").length,
    Processing: orders.filter(o => o.status === "Processing").length,
    Delivered: orders.filter(o => o.status === "Delivered").length,
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Orders</h2>
          <p className={styles.pageSubtitle}>{orders.length} orders total</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        {(["All", "Pending", "Processing", "Delivered"] as const).map((status) => (
          <button
            key={status}
            className={filter === status ? styles.btnPrimary : styles.btnSecondary}
            onClick={() => setFilter(status)}
            style={{ fontSize: "0.8rem", padding: "0.4rem 0.9rem" }}
          >
            {status} ({statusCounts[status]})
          </button>
        ))}
      </div>

      <div className={styles.panel}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order: any) => (
              <tr key={order._id}>
                <td style={{ fontWeight: 600 }}>#{order._id.slice(-6).toUpperCase()}</td>
                <td>
                  <div>
                    <p style={{ fontWeight: 500, margin: 0, fontSize: "0.85rem" }}>{order.shippingAddress?.fullName || "N/A"}</p>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "#6b7280" }}>{order.shippingAddress?.phone || ""}</p>
                  </div>
                </td>
                <td>{order.items?.length || 0} items</td>
                <td style={{ fontWeight: 600 }}>৳ {order.totalAmount}</td>
                <td>{order.paymentMethod || "COD"}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className={styles.statusSelect}
                    disabled={updating === order._id}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </td>
                <td>
                  <button
                    className={styles.btnDanger}
                    onClick={() => handleDelete(order._id)}
                    disabled={updating === order._id}
                  >
                    {updating === order._id ? "..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8}>
                  <div className={styles.emptyState}>
                    <p>No {filter === "All" ? "" : filter.toLowerCase()} orders found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
