"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import styles from "../profile.module.css";

import { useUserStore } from "@/store/userStore";
import { useHasHydrated } from "@/store/useHasHydrated";

export default function SettingsPage() {
  const { data: session } = useSession();
  const hasHydrated = useHasHydrated();
  const [activeTab, setActiveTab] = useState("profile");
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Global State
  const { 
    profileImage, setProfileImage, 
    userName, setUserName,
    phone, setPhone,
    gender, setGender
  } = useUserStore();

  // Local Security State
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

  // Notifications State
  const [notifications, setNotifications] = useState({
    orders: true,
    promo: false,
    security: true
  });

  if (!hasHydrated) return <div className="p-10 text-center text-slate-400">Loading Preferences...</div>;


  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setTimeout(() => {
      alert(`Profile updated for ${userName}!`);
      setIsUpdating(false);
    }, 1200);
  };


  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert("Error: New passwords do not match!");
      return;
    }
    setIsUpdating(true);
    setTimeout(() => {
      alert("Password updated successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
      setIsUpdating(false);
    }, 1500);
  };

  const handleSavePreferences = () => {
    setIsUpdating(true);
    setTimeout(() => {
      alert("Email preferences saved successfully!");
      setIsUpdating(false);
    }, 1000);
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
          setProfileImage(event.target.result);
          alert("Profile picture updated and saved!");
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="animate-fade-in">
      <div className={styles.dashboardHeader}>
        <h1>Account Settings</h1>
        <p>Manage your profile, security, and communication preferences.</p>
      </div>

      <div className={styles.settingsContainer}>
        {/* TABS */}
        <div className={styles.settingsTabs}>
          {["profile", "security", "notifications"].map((tab) => (
            <button 
              key={tab}
              className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace("profile", "Personal Info")}
            </button>
          ))}
        </div>

        {activeTab === "profile" && (
          <div className={styles.settingsFormCard}>
            <div className={styles.profileUploadSection}>
              <div className={styles.largeAvatar} style={{ overflow: "hidden" }}>
                {profileImage ? (
                  <img src={profileImage} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  userName.charAt(0)
                )}
              </div>
              <div className={styles.uploadInfo}>
                <h4>Profile Photo</h4>
                <p>Upload a new profile picture. Max size 2MB.</p>
                <button className="btn-nm" onClick={handlePhotoUpload}>Upload New Photo</button>
              </div>
            </div>

            <hr className={styles.divider} />

            <form onSubmit={handleUpdateProfile}>
              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    value={userName} 
                    onChange={e => setUserName(e.target.value)} 
                    required 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Email Address</label>
                  <input type="email" defaultValue={session?.user?.email || ""} disabled />
                  <small>Email cannot be changed for security.</small>
                </div>
                <div className={styles.formGroup}>
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Gender</label>
                  <select 
                    value={gender} 
                    onChange={e => setGender(e.target.value)}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className={styles.formActions}>
                <button type="submit" className="btn-nm btn-nm-primary" disabled={isUpdating}>
                  {isUpdating ? "Saving Profile..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "security" && (
          <div className={styles.settingsFormCard}>
            <h3>Change Password</h3>
            <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "var(--sp-6)" }}>
              Ensure your account is using a long, random password to stay secure.
            </p>
            <form onSubmit={handleUpdatePassword}>
              <div className={styles.formGroup} style={{ marginBottom: "var(--sp-4)" }}>
                <label>Current Password</label>
                <input 
                  type="password" 
                  value={passwords.current} 
                  onChange={e => setPasswords({...passwords, current: e.target.value})} 
                  placeholder="••••••••" 
                  required 
                />
              </div>
              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label>New Password</label>
                  <input 
                    type="password" 
                    value={passwords.new} 
                    onChange={e => setPasswords({...passwords, new: e.target.value})} 
                    placeholder="New Password" 
                    required 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Confirm Password</label>
                  <input 
                    type="password" 
                    value={passwords.confirm} 
                    onChange={e => setPasswords({...passwords, confirm: e.target.value})} 
                    placeholder="Confirm Password" 
                    required 
                  />
                </div>
              </div>
              <div className={styles.formActions}>
                <button type="submit" className="btn-nm btn-nm-primary" disabled={isUpdating}>
                  {isUpdating ? "Verifying..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className={styles.settingsFormCard}>
            <h3>Email Preferences</h3>
            <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "var(--sp-6)" }}>
              Control the emails you want to receive from Aurea BD.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
              {[
                { id: "orders", label: "Order Updates", desc: "Receive emails about your order status and shipping." },
                { id: "promo", label: "Promotions", desc: "Special offers, sales, and new collection arrivals." },
                { id: "security", label: "Account Security", desc: "Alerts about login activity and password changes." }
              ].map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--sp-4)", background: "#f8fafc", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                  <div>
                    <h5 style={{ margin: "0 0 2px", color: "var(--text-dark)" }}>{item.label}</h5>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>{item.desc}</p>
                  </div>
                  <label className={styles.switch}>
                    <input 
                      type="checkbox" 
                      checked={(notifications as any)[item.id]} 
                      onChange={() => setNotifications({...notifications, [item.id]: !(notifications as any)[item.id]})} 
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              ))}
            </div>
            <div className={styles.formActions}>
              <button onClick={handleSavePreferences} className="btn-nm btn-nm-primary" disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
