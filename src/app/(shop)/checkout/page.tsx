"use client";

import { useCartStore } from "@/store/cartStore";
import Image from "next/image";
import Link from "next/link";
import styles from "./checkout.module.css";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  getDivisions,
  getDistricts,
  getPoliceStations,
  getShippingCharge,
  SHIPPING_INSIDE_DHAKA,
  SHIPPING_OUTSIDE_DHAKA,
  isDhakaCity,
} from "@/data/bangladeshLocations";

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
    division: "",
    district: "",
    policeStation: "",
  });

  // Derived location data
  const divisions = useMemo(() => getDivisions(), []);
  const districts = useMemo(
    () => getDistricts(formData.division),
    [formData.division]
  );
  const policeStations = useMemo(
    () => getPoliceStations(formData.division, formData.district),
    [formData.division, formData.district]
  );

  // Shipping charge calculation
  const shippingCharge = useMemo(
    () => getShippingCharge(formData.division, formData.district),
    [formData.division, formData.district]
  );

  const isInsideDhaka = useMemo(
    () => isDhakaCity(formData.division, formData.district),
    [formData.division, formData.district]
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "division") {
      // Reset district and police station when division changes
      setFormData((prev) => ({
        ...prev,
        division: value,
        district: "",
        policeStation: "",
      }));
    } else if (name === "district") {
      // Reset police station when district changes
      setFormData((prev) => ({
        ...prev,
        district: value,
        policeStation: "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePlaceOrder = async () => {
    // Basic Validation
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.address ||
      !formData.division ||
      !formData.district
    ) {
      toast.error("অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            product: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          totalAmount: getTotal() + shippingCharge,
          shippingAddress: {
            ...formData,
            city: `${formData.district}, ${formData.division}`,
          },
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Save order details for the success page PDF generation
        localStorage.setItem(
          "lastOrder",
          JSON.stringify({
            ...data.order,
            customer: formData,
            subtotal: getTotal(),
            shipping: shippingCharge,
            total: getTotal() + shippingCharge,
          })
        );

        toast.success("অর্ডার সফলভাবে সম্পন্ন হয়েছে!");
        clearCart();
        router.push(`/checkout/success?order_id=${data.order._id}`);
      } else {
        toast.error(
          data.message || "অর্ডার প্রক্রিয়াকরণে সমস্যা হয়েছে। আবার চেষ্টা করুন।"
        );
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("একটি অপ্রত্যাশিত ত্রুটি হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div
        className="section container text-center animate-fade-in"
        style={{
          padding: "clamp(4rem, 10vw, 10rem) 0",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
            marginBottom: "var(--sp-4)",
          }}
        >
          আপনার কার্ট খালি
        </h2>
        <p style={{ marginBottom: "var(--sp-6)" }}>
          চেকআউট করার আগে পণ্য যোগ করুন।
        </p>
        <Link href="/shop" className="btn-nm btn-nm-primary">
          শপে ফিরে যান
        </Link>
      </div>
    );
  }

  return (
    <main className={`${styles.checkoutPage} container animate-fade-in`}>
      <div className={styles.grid}>
        {/* LEFT SIDE - FORM */}
        <div className={styles.leftSide}>
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>যোগাযোগের তথ্য</h2>
            <div className={styles.inputGroup}>
              <div className={styles.inputField}>
                <label>সম্পূর্ণ নাম *</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="আপনার সম্পূর্ণ নাম লিখুন"
                  className={styles.nmInput}
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.inputField}>
                <label>ইমেইল</label>
                <input
                  type="email"
                  name="email"
                  placeholder="example@email.com"
                  className={styles.nmInput}
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-light)",
                    marginTop: "4px",
                  }}
                >
                  অর্ডার ট্র্যাক করতে স্বয়ংক্রিয়ভাবে একটি অ্যাকাউন্ট তৈরি হবে।
                </p>
              </div>
              <div className={styles.inputField}>
                <label>মোবাইল নম্বর *</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="০১XXXXXXXXX"
                  className={styles.nmInput}
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>ডেলিভারি ঠিকানা</h2>
            <div className={styles.inputGroup}>
              {/* Division */}
              <div className={styles.inputField}>
                <label>বিভাগ *</label>
                <select
                  name="division"
                  className={styles.nmInput}
                  value={formData.division}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">বিভাগ নির্বাচন করুন</option>
                  {divisions.map((div) => (
                    <option key={div} value={div}>
                      {div}
                    </option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div className={styles.inputField}>
                <label>জেলা *</label>
                <select
                  name="district"
                  className={styles.nmInput}
                  value={formData.district}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.division}
                >
                  <option value="">
                    {formData.division
                      ? "জেলা নির্বাচন করুন"
                      : "আগে বিভাগ নির্বাচন করুন"}
                  </option>
                  {districts.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>

              {/* Police Station / Thana */}
              <div className={styles.inputField}>
                <label>থানা / উপজেলা *</label>
                <select
                  name="policeStation"
                  className={styles.nmInput}
                  value={formData.policeStation}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.district}
                >
                  <option value="">
                    {formData.district
                      ? "থানা নির্বাচন করুন"
                      : "আগে জেলা নির্বাচন করুন"}
                  </option>
                  {policeStations.map((ps) => (
                    <option key={ps} value={ps}>
                      {ps}
                    </option>
                  ))}
                </select>
              </div>

              {/* Full Address */}
              <div className={`${styles.inputField} ${styles.inputFullWidth}`}>
                <label>সম্পূর্ণ ঠিকানা *</label>
                <input
                  type="text"
                  name="address"
                  placeholder="বাসা নম্বর, রাস্তার নাম, এলাকা"
                  className={styles.nmInput}
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>ডেলিভারি চার্জ</h2>
            <div className={styles.deliveryOptions}>
              <div
                className={`${styles.deliveryOption} ${styles.nmInset} ${
                  isInsideDhaka ? styles.deliveryActive : ""
                }`}
              >
                <div className={styles.deliveryIcon}>🏙️</div>
                <div className={styles.deliveryContent}>
                  <span className={styles.deliveryName}>ঢাকার ভিতরে</span>
                  <span className={styles.deliveryTime}>
                    ১-২ কার্যদিবসে ডেলিভারি
                  </span>
                </div>
                <span className={styles.deliveryPrice}>
                  ৳ {SHIPPING_INSIDE_DHAKA}
                </span>
              </div>
              <div
                className={`${styles.deliveryOption} ${styles.nmInset} ${
                  !isInsideDhaka ? styles.deliveryActive : ""
                }`}
              >
                <div className={styles.deliveryIcon}>🚚</div>
                <div className={styles.deliveryContent}>
                  <span className={styles.deliveryName}>ঢাকার বাইরে</span>
                  <span className={styles.deliveryTime}>
                    ৩-৫ কার্যদিবসে ডেলিভারি
                  </span>
                </div>
                <span className={styles.deliveryPrice}>
                  ৳ {SHIPPING_OUTSIDE_DHAKA}
                </span>
              </div>
            </div>
            {formData.district && (
              <div className={styles.shippingNote}>
                <span className={styles.shippingNoteIcon}>📍</span>
                <p>
                  আপনার নির্বাচিত জেলা:{" "}
                  <strong>{formData.district}</strong> —{" "}
                  {isInsideDhaka
                    ? "ঢাকার ভিতরে ডেলিভারি চার্জ প্রযোজ্য"
                    : "ঢাকার বাইরে ডেলিভারি চার্জ প্রযোজ্য"}
                  {" "}(৳ {shippingCharge})
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE - SUMMARY */}
        <div className={styles.rightSide}>
          <div className={styles.summaryCard}>
            <h2 className={styles.summaryTitle}>অর্ডার সারাংশ</h2>
            <div className={styles.itemList}>
              {items.map((item) => (
                <div key={item.id} className={styles.summaryItem}>
                  <div className={styles.itemImage}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                    <span className={styles.itemQty}>{item.quantity}</span>
                  </div>
                  <div className={styles.itemInfo}>
                    <h4>{item.name}</h4>
                    <p>৳ {item.price}</p>
                  </div>
                  <span className={styles.itemTotal}>
                    ৳ {item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.calculation}>
              <div className={styles.calcRow}>
                <span>মোট মূল্য</span>
                <span>৳ {getTotal()}</span>
              </div>
              <div className={styles.calcRow}>
                <span>
                  ডেলিভারি চার্জ{" "}
                  <small>
                    ({isInsideDhaka ? "ঢাকার ভিতরে" : "ঢাকার বাইরে"})
                  </small>
                </span>
                <span>৳ {shippingCharge}</span>
              </div>
              <div className={`${styles.calcRow} ${styles.totalRow}`}>
                <span>সর্বমোট</span>
                <span>৳ {getTotal() + shippingCharge}</span>
              </div>
            </div>

            <div className={styles.paymentSection}>
              <h3>পেমেন্ট পদ্ধতি</h3>
              <div className={styles.paymentOptions}>
                <button
                  className={`${styles.paymentBtn} ${
                    paymentMethod === "cod" ? styles.active : ""
                  }`}
                  onClick={() => setPaymentMethod("cod")}
                >
                  ক্যাশ অন ডেলিভারি
                </button>
                <button
                  className={`${styles.paymentBtn} ${
                    paymentMethod === "online" ? styles.active : ""
                  }`}
                  onClick={() => setPaymentMethod("online")}
                >
                  অনলাইন পেমেন্ট
                </button>
              </div>
            </div>

            <button
              className={`btn-nm btn-nm-primary ${loading ? "" : "pulse"}`}
              style={{
                width: "100%",
                marginTop: "var(--sp-6)",
                justifyContent: "center",
              }}
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? "প্রক্রিয়াকরণ হচ্ছে..." : "অর্ডার সম্পন্ন করুন"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
