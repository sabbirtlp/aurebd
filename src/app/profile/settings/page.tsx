"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Shield, Bell, Camera, Loader2, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useUserStore } from "@/store/userStore";
import styles from "../profile.module.css";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const { setProfileImage, setUserName } = useUserStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    image: ""
  });

  useEffect(() => {
    async function fetchUserData() {
      try {
        const res = await fetch("/api/profile/user");
        if (res.ok) {
          const data = await res.json();
          setFormData({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            gender: data.gender || "",
            image: data.image || ""
          });
        }
      } catch (err) {
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    }
    fetchUserData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/profile/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Profile updated successfully!");
        
        // Update local store for immediate UI feedback in sidebar
        setUserName(formData.name);
        setProfileImage(formData.image);

        // Update session name (small string is safe for cookies)
        await update({ name: formData.name });
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          setFormData({ ...formData, image: event.target.result });
          toast.info("Click 'Save Changes' to update your photo.");
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className="animate-spin" size={40} color="var(--primary)" />
        <p>Fetching your settings...</p>
      </div>
    );
  }

  return (
    <div className={styles.settingsWrapper}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.welcomeTitle}>Account <span className={styles.highlight}>Settings</span></h1>
        <p className={styles.welcomeSubtitle}>Personalize your profile and security preferences.</p>
      </div>

      <div className={styles.settingsLayout}>
        {/* TABS NAVIGATION */}
        <div className={styles.tabNav}>
          {[
            { id: "profile", label: "Profile", icon: <User size={18} /> },
            { id: "security", label: "Security", icon: <Shield size={18} /> },
            { id: "notifications", label: "Alerts", icon: <Bell size={18} /> }
          ].map((tab) => (
            <button 
              key={tab.id}
              className={`${styles.tabItem} ${activeTab === tab.id ? styles.tabItemActive : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={styles.settingsCard}
          >
            {activeTab === "profile" && (
              <form onSubmit={handleUpdateProfile} className={styles.profileForm}>
                <div className={styles.photoSection}>
                  <div className={styles.avatarLarge}>
                    {formData.image ? (
                      <Image src={formData.image} alt="Profile" fill style={{ objectFit: "cover" }} />
                    ) : (
                      formData.name.charAt(0)
                    )}
                    <button type="button" onClick={handlePhotoUpload} className={styles.photoEditBtn}>
                      <Camera size={16} />
                    </button>
                  </div>
                  <div className={styles.photoLabels}>
                    <h4>Profile Picture</h4>
                    <p>PNG, JPG up to 2MB</p>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.inputField}>
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={e => setFormData({ ...formData, name: e.target.value })} 
                      placeholder="Your Name"
                    />
                  </div>
                  <div className={styles.inputField}>
                    <label>Email Address</label>
                    <input type="email" value={formData.email} disabled className={styles.disabledInput} />
                  </div>
                  <div className={styles.inputField}>
                    <label>Phone Number</label>
                    <input 
                      type="tel" 
                      value={formData.phone} 
                      onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                      placeholder="+880 1XXX XXXXXX"
                    />
                  </div>
                  <div className={styles.inputField}>
                    <label>Gender</label>
                    <select 
                      value={formData.gender} 
                      onChange={e => setFormData({ ...formData, gender: e.target.value })}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formFooter}>
                  <button type="submit" className={styles.saveBtn} disabled={isSaving}>
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "security" && (
              <div className={styles.securityPlaceholder}>
                <Shield size={64} color="var(--primary)" opacity={0.2} />
                <h3>Security Settings</h3>
                <p>Since you are logged in with Google, your security is managed by Google Account Services.</p>
                <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className={styles.externalLink}>
                  Manage Google Security
                </a>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className={styles.notificationSettings}>
                <h3>Communication Preferences</h3>
                <p>Stay updated with our latest news and your order progress.</p>
                
                <div className={styles.toggleList}>
                  {[
                    { label: "Order Updates", desc: "Real-time shipping and delivery alerts" },
                    { label: "Promotional", desc: "News, offers, and seasonal sales" },
                    { label: "Security Alerts", desc: "Critical account and login notifications" }
                  ].map((item, i) => (
                    <div key={i} className={styles.toggleItem}>
                      <div className={styles.toggleText}>
                        <h5>{item.label}</h5>
                        <p>{item.desc}</p>
                      </div>
                      <label className={styles.switch}>
                        <input type="checkbox" defaultChecked />
                        <span className={styles.slider} />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
