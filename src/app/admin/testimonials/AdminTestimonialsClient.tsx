"use client";

import React, { useState, useEffect } from "react";
import styles from "../admin.module.css";
import { Plus, Edit2, Trash2, Star, Quote, Globe, CheckCircle, X } from "lucide-react";
import { toast } from "react-toastify";

interface Testimonial {
  _id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  image: string;
  language: string;
}

export default function AdminTestimonialsClient() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    content: "",
    rating: 5,
    language: "en"
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch("/api/admin/testimonials");
      const data = await res.json();
      setTestimonials(data.testimonials || []);
    } catch (err) {
      toast.error("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/admin/testimonials/${editingId}` : "/api/admin/testimonials";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success(editingId ? "Testimonial updated! ✅" : "Testimonial created! ✅");
        setShowModal(false);
        setEditingId(null);
        setFormData({ name: "", role: "", content: "", rating: 5, language: "en" });
        fetchTestimonials();
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleEdit = (t: Testimonial) => {
    setEditingId(t._id);
    setFormData({
      name: t.name,
      role: t.role,
      content: t.content,
      rating: t.rating,
      language: t.language
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Testimonial removed");
        fetchTestimonials();
      }
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  return (
    <React.Fragment>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Testimonials</h2>
          <p className={styles.pageSubtitle}>Manage customer reviews and feedback</p>
        </div>
        <button 
          type="button"
          className={styles.btnPrimary} 
          onClick={() => { 
            setEditingId(null); 
            setFormData({ name: "", role: "", content: "", rating: 5, language: "en" }); 
            setShowModal(true); 
          }}
        >
          <Plus size={18} /> Add New Review
        </button>
      </div>

      {loading ? (
        <div className={styles.emptyState} style={{ padding: "5rem" }}>
          <div className="animate-pulse">Loading testimonials...</div>
        </div>
      ) : (
        <div className={styles.contentGrid} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "2rem" }}>
          {testimonials.map((t) => (
            <div key={t._id} className={`${styles.contentSection} animate-fade-in`} style={{ marginBottom: 0, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", gap: "2px" }}>
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      fill={i < t.rating ? "var(--primary)" : "transparent"} 
                      color={i < t.rating ? "var(--primary)" : "var(--text-light)"} 
                      style={{ opacity: i < t.rating ? 1 : 0.2 }}
                    />
                  ))}
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button type="button" onClick={() => handleEdit(t)} className={styles.btnEdit} title="Edit" style={{ padding: "0.4rem" }}>
                    <Edit2 size={16} />
                  </button>
                  <button type="button" onClick={() => handleDelete(t._id)} className={styles.btnDanger} title="Delete" style={{ padding: "0.4rem" }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <p style={{ 
                  color: "var(--text-dark)", 
                  fontSize: "1rem", 
                  lineHeight: "1.7", 
                  marginBottom: "2rem",
                  position: "relative",
                  padding: "0 10px"
                }}>
                  <Quote size={24} style={{ position: "absolute", top: "-10px", left: "-15px", opacity: 0.1, color: "var(--primary)" }} />
                  {t.content}
                </p>
              </div>

              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "1rem", 
                paddingTop: "1.5rem", 
                borderTop: "1px solid var(--border)" 
              }}>
                <div style={{ 
                  width: "48px", 
                  height: "48px", 
                  borderRadius: "50%", 
                  background: "var(--bg-color)", 
                  display: "flex", 
                  alignItems: "center", 
                  justify-content: "center", 
                  border: "1px solid var(--border)", 
                  boxShadow: "var(--nm-outer-raised-sm)", 
                  fontWeight: 800, 
                  color: "var(--primary)",
                  fontSize: "1.2rem",
                  flexShrink: 0
                }}>
                  {t.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>{t.name}</h4>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-light)" }}>{t.role || "Customer"}</span>
                    <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--border)" }}></span>
                    <span style={{ 
                      fontSize: "0.7rem", 
                      fontWeight: 700, 
                      color: "var(--primary)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      <Globe size={10} /> {t.language.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {testimonials.length === 0 && (
            <div className={styles.emptyState} style={{ gridColumn: "1 / -1", padding: "5rem" }}>
              <Quote size={48} style={{ opacity: 0.1, marginBottom: "1rem" }} />
              <p>No testimonials yet. Share your first customer success story!</p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div style={{ 
          position: "fixed", 
          inset: 0, 
          background: "rgba(0,0,0,0.7)", 
          display: "flex", 
          alignItems: "center", 
          justify-content: "center", 
          zIndex: 10000, 
          backdropFilter: "blur(8px)",
          padding: "1rem"
        }}>
          <div className={`${styles.panel} animate-scale-in`} style={{ width: "100%", maxWidth: "550px", padding: "2.5rem", position: "relative" }}>
            <button 
              type="button"
              onClick={() => setShowModal(false)}
              style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "none", border: "none", color: "var(--text-light)", cursor: "pointer" }}
            >
              <X size={24} />
            </button>

            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "2rem", color: "var(--text-dark)" }}>
              {editingId ? "Edit Testimonial" : "Create New Testimonial"}
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Full Name</label>
                  <input type="text" className={styles.formInput} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required placeholder="e.g. Maria K." />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Role / Location</label>
                  <input type="text" className={styles.formInput} value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} placeholder="e.g. Verified Customer" />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1.5rem" }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Language</label>
                  <select className={styles.formInput} value={formData.language} onChange={(e) => setFormData({...formData, language: e.target.value})}>
                    <option value="en">English (Global)</option>
                    <option value="bn">Bengali (Local)</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Rating Score</label>
                  <select className={styles.formInput} value={formData.rating} onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}>
                    <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                    <option value="4">⭐⭐⭐⭐ (4/5)</option>
                    <option value="3">⭐⭐⭐ (3/5)</option>
                    <option value="2">⭐⭐ (2/5)</option>
                    <option value="1">⭐ (1/5)</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup} style={{ marginTop: "1.5rem" }}>
                <label className={styles.formLabel}>Testimonial Review</label>
                <textarea 
                  className={styles.formInput} 
                  rows={5} 
                  value={formData.content} 
                  onChange={(e) => setFormData({...formData, content: e.target.value})} 
                  required 
                  placeholder="Share the customer's experience with Aurea BD..."
                  style={{ resize: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "2.5rem" }}>
                <button type="submit" className={styles.btnPrimary} style={{ flex: 1, height: "50px" }}>
                  <CheckCircle size={18} /> {editingId ? "Update Review" : "Publish Review"}
                </button>
                <button type="button" className={styles.btnSecondary} onClick={() => setShowModal(false)} style={{ flex: 1, height: "50px" }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}
