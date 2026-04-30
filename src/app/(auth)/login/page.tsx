"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User as UserIcon, Eye, EyeOff, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import styles from "./auth.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        const { getSession } = await import("next-auth/react");
        const session = await getSession();
        
        if (session?.user?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
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

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setFormData({ name: "", email: "", password: "" });
  };

  return (
    <div className={styles.authWrapper}>
      {/* Abstract Background Blobs */}
      <div className={`${styles.blob} ${styles.blob1}`} />
      <div className={`${styles.blob} ${styles.blob2}`} />

      {/* Image Section (Desktop Only) */}
      <div className={styles.imageSection}>
        <Image 
          src="https://images.unsplash.com/photo-1615397323237-77fb5442ed18?q=80&w=2000&auto=format&fit=crop" 
          alt="Premium Cosmetics Background" 
          fill 
          style={{ objectFit: "cover" }}
          priority
        />
        <div className={styles.imageOverlay} />
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={styles.imageContent}
        >
          <h1 className={styles.imageTitle}>
            Discover The<br/>Essence Of<br/>True Beauty
          </h1>
          <p className={styles.imageDesc}>
            Unlock the secrets of premium Japanese skincare. Join Aurea BD and elevate your daily ritual with our curated collection.
          </p>
        </motion.div>
      </div>

      {/* Form Section */}
      <div className={styles.formSection}>
        <motion.div 
          className={styles.formContainer}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.header}>
            <motion.h2 
              key={isLogin ? "login-title" : "register-title"}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.title}
            >
              {isLogin ? "Welcome Back" : "Create Account"}
            </motion.h2>
            <p className={styles.subtitle}>
              {isLogin 
                ? "Enter your credentials to access your account" 
                : "Join us and discover premium skincare"
              }
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className={styles.errorBox}
              >
                <AlertCircle size={18} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: "hidden" }}
                >
                  <div className={styles.inputGroup}>
                    <input 
                      required 
                      type="text"
                      placeholder="Full Name" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      className={styles.input}
                    />
                    <UserIcon className={styles.inputIcon} size={20} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={styles.inputGroup}>
              <input 
                required 
                type="email" 
                placeholder="Email Address" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                className={styles.input}
              />
              <Mail className={styles.inputIcon} size={20} />
            </div>

            <div className={styles.inputGroup}>
              <input 
                required 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                className={styles.input}
              />
              <Lock className={styles.inputIcon} size={20} />
              <button 
                type="button" 
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <motion.button 
              type="submit" 
              className={styles.submitBtn} 
              disabled={loading}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          <div className={styles.switchText}>
            {isLogin ? "New to Aurea?" : "Already have an account?"}
            <button onClick={toggleAuthMode} className={styles.switchLink} type="button">
              {isLogin ? "Create an account" : "Sign in here"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
