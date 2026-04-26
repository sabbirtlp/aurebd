"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from '@/components/layout/Navbar';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isLogin) {
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push("/");
        router.refresh();
      }
    } else {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        
        if (res.ok) {
          setIsLogin(true);
          alert("Registration successful! Please login.");
        } else {
          const data = await res.json();
          setError(data.message);
        }
      } catch (err) {
        setError("Something went wrong");
      }
    }
    setLoading(false);
  };

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-color)" }}>
      <Navbar />
      <div className="container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 80px)" }}>
        <div style={{ background: "white", padding: "3rem", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", width: "100%", maxWidth: "400px" }}>
          <h2 style={{ textAlign: "center", marginBottom: "2rem", fontFamily: "var(--font-playfair)", fontSize: "2rem" }}>
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>

          {error && <div style={{ color: "red", marginBottom: "1rem", textAlign: "center" }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {!isLogin && (
              <input required placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)" }} />
            )}
            <input required type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)" }} />
            <input required type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)" }} />
            
            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "1rem" }}>
              {loading ? "Please wait..." : (isLogin ? "Login" : "Register")}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <button onClick={() => setIsLogin(!isLogin)} style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontWeight: "500" }}>
              {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
