"use client";

import { useCartStore } from "@/store/cartStore";
import Image from "next/image";
import Link from "next/link";
import styles from "./checkout.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    // Basic Validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address) {
      toast.error("Please fill in all required fields (Name, Email, Phone, Address)");
      return;
    }

    setLoading(true);
    
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(item => ({
            product: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          totalAmount: getTotal() + 60, // Including shipping
          shippingAddress: formData,
          paymentMethod
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Save order details for the success page PDF generation
        localStorage.setItem('lastOrder', JSON.stringify({
          ...data.order,
          customer: formData,
          subtotal: getTotal(),
          shipping: 60,
          total: getTotal() + 60,
        }));
        
        toast.success("Order placed successfully! Redirecting...");
        clearCart();
        router.push(`/checkout/success?order_id=${data.order._id}`);
      } else {
        toast.error(data.message || "Failed to place order. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
                <label>Full Name *</label>
                <input 
                  type="text" 
                  name="fullName"
                  placeholder="Enter your full name" 
                  className={styles.nmInput} 
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.inputField}>
                <label>Email Address *</label>
                <input 
                  type="email" 
                  name="email"
                  placeholder="email@example.com" 
                  className={styles.nmInput} 
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px' }}>
                  An account will be created for you automatically to track your order.
                </p>
              </div>
              <div className={styles.inputField}>
                <label>Phone Number *</label>
                <input 
                  type="tel" 
                  name="phone"
                  placeholder="+880" 
                  className={styles.nmInput} 
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Shipping Address</h2>
            <div className={styles.inputGroup}>
              <div className={`${styles.inputField} ${styles.inputFullWidth}`}>
                <label>Street Address *</label>
                <input 
                  type="text" 
                  name="address"
                  placeholder="House number and street name" 
                  className={styles.nmInput} 
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.inputField}>
                <label>City</label>
                <input 
                  type="text" 
                  name="city"
                  placeholder="City" 
                  className={styles.nmInput} 
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </div>
              <div className={styles.inputField}>
                <label>Postal Code</label>
                <input 
                  type="text" 
                  name="zip"
                  placeholder="1234" 
                  className={styles.nmInput} 
                  value={formData.zip}
                  onChange={handleInputChange}
                />
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

            <button 
              className={`btn-nm btn-nm-primary ${loading ? '' : 'pulse'}`} 
              style={{ width: "100%", marginTop: "var(--sp-6)", justifyContent: "center" }}
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
