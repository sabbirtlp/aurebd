"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Package, Truck, CheckCircle, Clock, FileText, Loader2 } from "lucide-react";
import styles from "../../profile.module.css";

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/profile/orders/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (err) {
        console.error("Failed to fetch order details");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className="animate-spin" size={40} color="var(--primary)" />
        <p>Retrieving order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.emptyState}>
        <Package size={64} opacity={0.2} />
        <h3>Order not found</h3>
        <Link href="/profile/orders" className={styles.shopNowBtn}>Back to Orders</Link>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return <CheckCircle size={18} />;
      case 'processing': return <Clock size={18} />;
      case 'shipped': return <Truck size={18} />;
      default: return <Package size={18} />;
    }
  };

  return (
    <div className={styles.detailsWrapper}>
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={styles.dashboardHeader}
      >
        <Link href="/profile/orders" className={styles.backBtn}>
          <ArrowLeft size={18} /> Back to My Orders
        </Link>
        <div className={styles.orderHeaderMain}>
          <h1 className={styles.welcomeTitle}>Order <span className={styles.highlight}>#{(order._id as string).slice(-6).toUpperCase()}</span></h1>
          <div className={`${styles.statusBadgeLarge} ${styles[order.status.toLowerCase()]}`}>
            {getStatusIcon(order.status)}
            {order.status}
          </div>
        </div>
        <p className={styles.orderMeta}>Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </motion.div>

      <div className={styles.detailsGrid}>
        {/* LEFT - PRODUCTS */}
        <div className={styles.orderContent}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.card}
          >
            <div className={styles.cardHeaderPlain}>
              <h3>Items Ordered</h3>
              <span className={styles.itemCount}>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
            </div>
            <div className={styles.orderItemsList}>
              {order.items.map((item: any, i: number) => (
                <div key={i} className={styles.orderItemRow}>
                  <div className={styles.productImgBox}>
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} />
                    ) : (
                      <Package size={24} opacity={0.2} />
                    )}
                  </div>
                  <div className={styles.productDetails}>
                    <h4>{item.name}</h4>
                    <p className={styles.productQty}>Quantity: {item.quantity}</p>
                  </div>
                  <div className={styles.productPrice}>
                    ৳ {item.price.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={styles.card}
          >
            <h3>Order Progress</h3>
            <div className={styles.timelineList}>
              {[
                { label: "Order Placed", date: order.createdAt, active: true },
                { label: "Processing", date: order.updatedAt, active: order.status !== 'Pending' },
                { label: "Out for Delivery", date: null, active: order.status === 'Delivered' },
                { label: "Delivered", date: null, active: order.status === 'Delivered' }
              ].map((step, i) => (
                <div key={i} className={`${styles.timelineStep} ${step.active ? styles.stepActive : ""}`}>
                  <div className={styles.stepMarker}>
                    {step.active ? <Check size={12} /> : i + 1}
                  </div>
                  <div className={styles.stepInfo}>
                    <strong>{step.label}</strong>
                    {step.date && <p>{new Date(step.date).toLocaleDateString()}</p>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* RIGHT - SUMMARY & ADDRESS */}
        <div className={styles.orderSidebar}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className={styles.card}
          >
            <h3>Payment Summary</h3>
            <div className={styles.summaryTable}>
              <div className={styles.summaryItem}>
                <span>Subtotal</span>
                <span>৳ {order.totalAmount.toLocaleString()}</span>
              </div>
              <div className={styles.summaryItem}>
                <span>Shipping</span>
                <span>৳ 0</span>
              </div>
              <div className={styles.summaryItemTotal}>
                <span>Total Amount</span>
                <span>৳ {order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
            <div className={styles.paymentInfo}>
              <p>Method: <strong>{order.paymentMethod}</strong></p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className={styles.card}
          >
            <h3>Delivery Address</h3>
            <div className={styles.addressDisplay}>
              <p className={styles.addrName}>{order.shippingAddress.fullName}</p>
              <p className={styles.addrText}>{order.shippingAddress.address}</p>
              <p className={styles.addrCity}>{order.shippingAddress.city}</p>
              <p className={styles.addrPhone}>Phone: {order.shippingAddress.phone}</p>
            </div>
          </motion.div>

          <button className={styles.invoiceBtn}>
            <FileText size={18} /> Download Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

// Add simple check icon for timeline
function Check({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}
