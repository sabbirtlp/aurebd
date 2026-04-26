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
    <div className="container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 120px)", padding: "var(--sp-8) 0" }}>
      <div className="nm-card" style={{ padding: "var(--sp-10) var(--sp-8)", width: "100%", maxWidth: "450px", textAlign: "center" }}>
        <h2 style={{ marginBottom: "var(--sp-6)", fontWeight: 300, fontSize: "2.5rem", color: "var(--text-dark)" }}>
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>

        {error && <div style={{ color: "#d32f2f", marginBottom: "var(--sp-4)", fontSize: "0.9rem" }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
          {!isLogin && (
            <div className="input-group">
              <input 
                required 
                placeholder="Full Name" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                style={{ width: "100%", padding: "14px 20px", borderRadius: "12px", border: "none", background: "var(--bg-color)", boxShadow: "var(--nm-inner-pressed-sm)", outline: "none", color: "var(--text-dark)" }} 
              />
            </div>
          )}
          <input 
            required 
            type="email" 
            placeholder="Email Address" 
            value={formData.email} 
            onChange={e => setFormData({...formData, email: e.target.value})} 
            style={{ width: "100%", padding: "14px 20px", borderRadius: "12px", border: "none", background: "var(--bg-color)", boxShadow: "var(--nm-inner-pressed-sm)", outline: "none", color: "var(--text-dark)" }} 
          />
          <input 
            required 
            type="password" 
            placeholder="Password" 
            value={formData.password} 
            onChange={e => setFormData({...formData, password: e.target.value})} 
            style={{ width: "100%", padding: "14px 20px", borderRadius: "12px", border: "none", background: "var(--bg-color)", boxShadow: "var(--nm-inner-pressed-sm)", outline: "none", color: "var(--text-dark)" }} 
          />
          
          <button type="submit" className="btn-nm btn-nm-primary" disabled={loading} style={{ marginTop: "var(--sp-4)", width: "100%", height: "54px" }}>
            {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
          </button>
        </form>

        <div style={{ marginTop: "var(--sp-6)" }}>
          <button onClick={() => setIsLogin(!isLogin)} style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontWeight: "500", fontSize: "0.95rem" }}>
            {isLogin ? "New to Aurea? Register here" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
