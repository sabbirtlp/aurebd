"use client";

import { useCartStore } from "@/store/cartStore";
import Image from "next/image";
import Link from "next/link";
import styles from "./checkout.module.css";
import { useState } from "react";

export default function CheckoutPage() {
  const { items, getTotal } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState("cod");

  if (items.length === 0) {
    return (
      <div className="section container text-center animate-fade-in" style={{ padding: "clamp(4rem, 10vw, 10rem) 0", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", marginBottom: "var(--sp-4)" }}>Your cart is empty</h2>
        <p style={{ marginBottom: "var(--sp-6)" }}>Please add some products before checking out.</p>
        <Link href="/shop" className="btn-nm btn-nm-primary">Return to Shop</Link>
      </div>
    );
  }

  return (
    <main className={`${styles.checkoutPage} container animate-fade-in`}>
      <div className={styles.grid}>
        {/* LEFT SIDE - FORM */}
        <div className={styles.leftSide}>
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Contact Information</h2>
            <div className={styles.inputGroup}>
              <div className={styles.inputField}>
                <label>Full Name</label>
                <input type="text" placeholder="Enter your full name" className={styles.nmInput} />
              </div>
              <div className={styles.inputField}>
                <label>Email Address</label>
                <input type="email" placeholder="email@example.com" className={styles.nmInput} />
              </div>
              <div className={styles.inputField}>
                <label>Phone Number</label>
                <input type="tel" placeholder="+880" className={styles.nmInput} />
              </div>
            </div>
          </div>

          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Shipping Address</h2>
            <div className={styles.inputGroup}>
              <div className={`${styles.inputField} ${styles.inputFullWidth}`}>
                <label>Street Address</label>
                <input type="text" placeholder="House number and street name" className={styles.nmInput} />
              </div>
              <div className={styles.inputField}>
                <label>City</label>
                <input type="text" placeholder="City" className={styles.nmInput} />
              </div>
              <div className={styles.inputField}>
                <label>Postal Code</label>
                <input type="text" placeholder="1234" className={styles.nmInput} />
              </div>
            </div>
          </div>

          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Delivery Method</h2>
            <div className={styles.deliveryOptions}>
              <label className={`${styles.deliveryOption} ${styles.nmInset}`}>
                <input type="radio" name="delivery" defaultChecked />
                <div className={styles.deliveryContent}>
                  <span className={styles.deliveryName}>Standard Delivery</span>
                  <span className={styles.deliveryTime}>3-5 business days</span>
                </div>
                <span className={styles.deliveryPrice}>৳ 60</span>
              </label>
              <label className={`${styles.deliveryOption} ${styles.nmInset}`}>
                <input type="radio" name="delivery" />
                <div className={styles.deliveryContent}>
                  <span className={styles.deliveryName}>Express Delivery</span>
                  <span className={styles.deliveryTime}>1-2 business days</span>
                </div>
                <span className={styles.deliveryPrice}>৳ 120</span>
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - SUMMARY */}
        <div className={styles.rightSide}>
          <div className={styles.summaryCard}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>
            <div className={styles.itemList}>
              {items.map((item) => (
                <div key={item.id} className={styles.summaryItem}>
                  <div className={styles.itemImage}>
                    <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} />
                    <span className={styles.itemQty}>{item.quantity}</span>
                  </div>
                  <div className={styles.itemInfo}>
                    <h4>{item.name}</h4>
                    <p>৳ {item.price}</p>
                  </div>
                  <span className={styles.itemTotal}>৳ {item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className={styles.calculation}>
              <div className={styles.calcRow}>
                <span>Subtotal</span>
                <span>৳ {getTotal()}</span>
              </div>
              <div className={styles.calcRow}>
                <span>Shipping</span>
                <span>৳ 60</span>
              </div>
              <div className={`${styles.calcRow} ${styles.totalRow}`}>
                <span>Total</span>
                <span>৳ {getTotal() + 60}</span>
              </div>
            </div>

            <div className={styles.paymentSection}>
              <h3>Payment Method</h3>
              <div className={styles.paymentOptions}>
                <button 
                  className={`${styles.paymentBtn} ${paymentMethod === 'cod' ? styles.active : ''}`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  Cash on Delivery
                </button>
                <button 
                  className={`${styles.paymentBtn} ${paymentMethod === 'online' ? styles.active : ''}`}
                  onClick={() => setPaymentMethod('online')}
                >
                  Online Payment
                </button>
              </div>
            </div>

            <button className="btn-nm btn-nm-primary pulse" style={{ width: "100%", marginTop: "var(--sp-6)", justifyContent: "center" }}>
              Place Order
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
