"use client";

import { useCartStore } from "@/store/cartStore";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();
  const { data: session } = useSession();
  const router = useRouter();
  
  const [address, setAddress] = useState({ fullName: "", address: "", city: "", phone: "" });
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      alert("Please login to place an order.");
      router.push("/login");
      return;
    }
    if (items.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(item => ({ product: item.id, name: item.name, price: item.price, quantity: item.quantity, image: item.image })),
          totalAmount: getTotal(),
          shippingAddress: address,
          paymentMethod: "Cash on Delivery",
        }),
      });

      if (res.ok) {
        clearCart();
        alert("Order placed successfully!");
        router.push("/orders");
      } else {
        const err = await res.json();
        alert("Error: " + err.message);
      }
    } catch (error) {
      console.error(error);
      alert("Checkout failed.");
    }
    setLoading(false);
  };

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-color)" }}>
      <Navbar />
      <div className="container" style={{ padding: "4rem 1.5rem" }}>
        <h2 className="section-title">Your Cart</h2>
        
        {items.length === 0 ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ marginBottom: "2rem" }}>Your cart is empty.</p>
            <button className="btn-primary" onClick={() => router.push("/")}>Continue Shopping</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
            <div>
              {items.map((item) => (
                <div key={item.id} style={{ display: "flex", gap: "1.5rem", background: "white", padding: "1.5rem", borderRadius: "12px", marginBottom: "1rem", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                  <Image src={item.image} alt={item.name} width={80} height={80} style={{ objectFit: "cover", borderRadius: "8px" }} />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: "1.15rem", marginBottom: "0.5rem" }}>{item.name}</h3>
                    <p style={{ color: "var(--primary)", fontWeight: "600", marginBottom: "1rem" }}>৳ {item.price}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <button className="btn-outline" style={{ padding: "0.25rem 0.75rem" }} onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button className="btn-outline" style={{ padding: "0.25rem 0.75rem" }} onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      <button style={{ marginLeft: "auto", color: "red", background: "none", border: "none", cursor: "pointer", fontWeight: "500" }} onClick={() => removeItem(item.id)}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: "white", padding: "2rem", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)", height: "fit-content" }}>
              <h3 style={{ marginBottom: "1.5rem", fontSize: "1.25rem" }}>Order Summary</h3>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                <span>Subtotal</span>
                <span>৳ {getTotal()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid var(--border)" }}>
                <span>Shipping</span>
                <span>৳ 60</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem", fontWeight: "bold", fontSize: "1.25rem" }}>
                <span>Total</span>
                <span>৳ {getTotal() + 60}</span>
              </div>

              <h4 style={{ marginBottom: "1rem" }}>Shipping Details</h4>
              <form onSubmit={handleCheckout} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <input required placeholder="Full Name" value={address.fullName} onChange={e => setAddress({...address, fullName: e.target.value})} style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)" }} />
                <input required placeholder="Address" value={address.address} onChange={e => setAddress({...address, address: e.target.value})} style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)" }} />
                <input required placeholder="City" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)" }} />
                <input required placeholder="Phone Number" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)" }} />
                
                <p style={{ fontSize: "0.875rem", color: "var(--text-light)", marginTop: "1rem" }}>Payment: Cash on Delivery</p>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? "Processing..." : "Place Order"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
