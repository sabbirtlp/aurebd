"use client";

import { useEffect, useState } from "react";
import Navbar from '@/components/layout/Navbar';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetch("/api/orders")
        .then(res => res.json())
        .then(data => {
          setOrders(data.orders || []);
          setLoading(false);
        });
    }
  }, [status, router]);

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "5rem" }}>Loading...</div>;
  }

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-color)" }}>
      <Navbar />
      <div className="container" style={{ padding: "4rem 1.5rem" }}>
        <h2 className="section-title">Your Order History</h2>

        {orders.length === 0 ? (
          <p style={{ textAlign: "center" }}>You have no orders yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {orders.map((order: any) => (
              <div key={order._id} style={{ background: "white", padding: "1.5rem", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <p style={{ fontWeight: 600, color: "var(--primary)" }}>Order #{order._id.slice(-6).toUpperCase()}</p>
                    <p style={{ fontSize: "0.875rem", color: "var(--text-light)" }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontWeight: 600 }}>৳ {order.totalAmount + 60}</p>
                    <span style={{ fontSize: "0.75rem", background: order.status === "Delivered" ? "#dcfce7" : "#fef08a", padding: "0.25rem 0.75rem", borderRadius: "99px", display: "inline-block", marginTop: "0.5rem" }}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <div>
                  {order.items.map((item: any, index: number) => (
                    <div key={index} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                      <span>{item.quantity}x {item.name}</span>
                      <span>৳ {item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
