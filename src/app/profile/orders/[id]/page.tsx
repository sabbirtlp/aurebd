"use client";

import Link from "next/link";
import styles from "../../profile.module.css";

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  // Mock data for a single order
  const order = {
    id: params.id || "#ORD-9921",
    date: "Oct 24, 2023",
    status: "Delivered",
    shippingAddress: {
      name: "Abu Talha",
      street: "123 Green Road",
      city: "Dhaka",
      phone: "+880 1711223344"
    },
    items: [
      { name: "Sakura Glow Serum", price: 2450, quantity: 1, image: "/images/sakura-serum.png" },
      { name: "Daily Defense Sunscreen", price: 1800, quantity: 1, image: "/images/sakura-sunscreen.png" },
    ],
    summary: {
      subtotal: 4250,
      shipping: 100,
      tax: 0,
      total: 4350
    }
  };

  return (
    <div className="animate-fade-in">
      <div className={styles.dashboardHeader}>
        <Link href="/profile/orders" className={styles.backLink}>
          ← Back to Orders
        </Link>
        <h1 style={{ marginTop: "var(--sp-4)" }}>Order {order.id}</h1>
        <p>Placed on {order.date} • <span className={styles.statusDelivered} style={{ padding: "2px 8px", borderRadius: "4px" }}>{order.status}</span></p>
      </div>

      <div className={styles.detailsGrid}>
        {/* LEFT - PRODUCTS */}
        <div className={styles.orderLeft}>
          <div className={styles.card}>
            <h3>Order Items</h3>
            <div className={styles.orderItems}>
              {order.items.map((item, i) => (
                <div key={i} className={styles.orderItem}>
                  <img src={item.image} alt={item.name} className={styles.orderItemImg} />
                  <div className={styles.orderItemInfo}>
                    <h4>{item.name}</h4>
                    <p>Quantity: {item.quantity}</p>
                  </div>
                  <div className={styles.orderItemPrice}>
                    ৳ {item.price}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <h3>Order Timeline</h3>
            <div className={styles.timeline}>
              <div className={styles.timelineItem}>
                <div className={`${styles.dot} ${styles.dotActive}`}></div>
                <div className={styles.timelineContent}>
                  <strong>Order Placed</strong>
                  <p>Oct 24, 2023 - 10:30 AM</p>
                </div>
              </div>
              <div className={styles.timelineItem}>
                <div className={`${styles.dot} ${styles.dotActive}`}></div>
                <div className={styles.timelineContent}>
                  <strong>Processing</strong>
                  <p>Oct 24, 2023 - 02:15 PM</p>
                </div>
              </div>
              <div className={styles.timelineItem}>
                <div className={`${styles.dot} ${styles.dotActive}`}></div>
                <div className={styles.timelineContent}>
                  <strong>Shipped</strong>
                  <p>Oct 25, 2023 - 09:00 AM</p>
                </div>
              </div>
              <div className={styles.timelineItem}>
                <div className={`${styles.dot} ${styles.dotActive}`}></div>
                <div className={styles.timelineContent}>
                  <strong>Delivered</strong>
                  <p>Oct 26, 2023 - 11:45 AM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT - SUMMARY & ADDRESS */}
        <div className={styles.orderRight}>
          <div className={styles.card}>
            <h3>Order Summary</h3>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>৳ {order.summary.subtotal}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span>৳ {order.summary.shipping}</span>
            </div>
            <div className={styles.summaryRow} style={{ borderTop: "1px solid #f1f5f9", marginTop: "10px", paddingTop: "10px", fontWeight: "800" }}>
              <span>Total</span>
              <span>৳ {order.summary.total}</span>
            </div>
          </div>

          <div className={styles.card}>
            <h3>Shipping Address</h3>
            <p><strong>{order.shippingAddress.name}</strong></p>
            <p>{order.shippingAddress.street}</p>
            <p>{order.shippingAddress.city}</p>
            <p>Phone: {order.shippingAddress.phone}</p>
          </div>

          <button className="btn-nm" style={{ width: "100%", marginTop: "var(--sp-4)" }}>Download Invoice</button>
        </div>
      </div>
    </div>
  );
}
