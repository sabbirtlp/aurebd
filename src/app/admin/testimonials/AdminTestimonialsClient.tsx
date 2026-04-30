"use client";

import { useState, useEffect } from "react";
import styles from "../admin.module.css";
import { Plus, Edit2, Trash2, Star, Quote } from "lucide-react";
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
        toast.success(editingId ? "Testimonial updated" : "Testimonial created");
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
        toast.success("Testimonial deleted");
        fetchTestimonials();
      }
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Testimonials</h2>
          <p className={styles.pageSubtitle}>Manage customer reviews and feedback</p>
        </div>
        <button className={styles.btnPrimary} onClick={() => { setEditingId(null); setFormData({ name: "", role: "", content: "", rating: 5, language: "en" }); setShowModal(true); }}>
          <Plus size={18} /> Add Testimonial
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading testimonials...</div>
      ) : (
        <div className={styles.contentGrid} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1.5rem" }}>
          {testimonials.map((t) => (
            <div key={t._id} className={styles.contentSection} style={{ padding: "1.5rem", position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div style={{ display: "flex", gap: "2px" }}>
                  {[...Array(t.rating)].map((_, i) => <Star key={i} size={14} fill="var(--primary)" color="var(--primary)" />)}
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => handleEdit(t)} className={styles.actionBtn} style={{ color: "var(--primary)" }}><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(t._id)} className={styles.actionBtn} style={{ color: "#ff4d4d" }}><Trash2 size={16} /></button>
                </div>
              </div>
              <p style={{ fontStyle: "italic", color: "var(--text-light)", marginBottom: "1rem", lineHeight: "1.6" }}>
                <Quote size={16} style={{ opacity: 0.3, marginRight: "4px" }} />
                {t.content}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--bg-color)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", boxShadow: "var(--nm-outer-raised-sm)", fontWeight: "bold", color: "var(--primary)" }}>
                  {t.name.charAt(0)}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "0.95rem" }}>{t.name}</h4>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-light)" }}>{t.role} • <span style={{ fontWeight: 700, color: "var(--primary)" }}>{t.language.toUpperCase()}</span></p>
                </div>
              </div>
            </div>
          ))}
          {testimonials.length === 0 && <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>No testimonials found. Add your first one!</div>}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, backdropFilter: "blur(5px)" }}>
          <div className={styles.contentSection} style={{ width: "90%", maxWidth: "500px", padding: "2rem" }}>
            <h3 style={{ marginBottom: "1.5rem" }}>{editingId ? "Edit Testimonial" : "Add New Testimonial"}</h3>
            <form onSubmit={handleSubmit}>
              <div className={styles.contentField}>
                <label>Name</label>
                <input type="text" className={styles.formInput} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className={styles.contentField}>
                <label>Role</label>
                <input type="text" className={styles.formInput} value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} placeholder="e.g. Customer" />
              </div>
              <div className={styles.contentField}>
                <label>Language</label>
                <select className={styles.formInput} value={formData.language} onChange={(e) => setFormData({...formData, language: e.target.value})}>
                  <option value="en">English</option>
                  <option value="bn">Bengali</option>
                </select>
              </div>
              <div className={styles.contentField}>
                <label>Rating (1-5)</label>
                <select className={styles.formInput} value={formData.rating} onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
              <div className={styles.contentField}>
                <label>Testimonial Content</label>
                <textarea className={styles.formInput} rows={4} value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} required />
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                <button type="submit" className={styles.btnPrimary} style={{ flex: 1 }}>Save</button>
                <button type="button" className={styles.btnSecondary} onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
