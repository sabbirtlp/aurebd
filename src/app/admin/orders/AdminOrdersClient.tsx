"use client";

import { useState } from "react";
import { 
  User, 
  Phone, 
  CreditCard, 
  Trash2, 
  Clock, 
  Truck, 
  CheckCircle, 
  ShoppingBag,
  Calendar
} from "lucide-react";
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

      {/* Premium Filter Tabs */}
      <div className={styles.tabGroup}>
        {[
          { id: "All", icon: <ShoppingBag size={16} /> },
          { id: "Pending", icon: <Clock size={16} /> },
          { id: "Processing", icon: <Truck size={16} /> },
          { id: "Delivered", icon: <CheckCircle size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tabItem} ${filter === tab.id ? styles.tabItemActive : ""}`}
            onClick={() => setFilter(tab.id)}
          >
            {tab.icon}
            {tab.id}
            <span className={styles.tabCount}>{statusCounts[tab.id as keyof typeof statusCounts]}</span>
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
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order: any) => (
              <tr key={order._id}>
                <td style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--primary)" }}>
                  #{order._id.slice(-6).toUpperCase()}
                </td>
                <td>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, fontSize: "0.85rem" }}>
                      <User size={14} style={{ opacity: 0.6 }} />
                      {order.shippingAddress?.fullName || "N/A"}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "var(--text-light)" }}>
                      <Phone size={14} style={{ opacity: 0.6 }} />
                      {order.shippingAddress?.phone || "N/A"}
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                    {order.items?.length || 0} items
                  </span>
                </td>
                <td style={{ fontWeight: 700, fontSize: "1rem" }}>৳ {order.totalAmount}</td>
                <td>
                  <span className={styles.badgePending} style={{ fontSize: "0.65rem", padding: "4px 8px", borderRadius: "6px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <CreditCard size={12} /> {order.paymentMethod?.toUpperCase() || "COD"}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "var(--text-light)" }}>
                    <Calendar size={14} />
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className={styles.statusSelect}
                    disabled={updating === order._id}
                    style={{
                      color: order.status === "Delivered" ? "#16a34a" : order.status === "Processing" ? "#d97706" : "inherit"
                    }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button
                    className={styles.btnDanger}
                    onClick={() => handleDelete(order._id)}
                    disabled={updating === order._id}
                    title="Delete Order"
                    style={{ padding: "0.5rem" }}
                  >
                    {updating === order._id ? "..." : <Trash2 size={16} />}
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
