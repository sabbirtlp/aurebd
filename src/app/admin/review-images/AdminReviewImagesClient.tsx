"use client";

import { useState, useEffect } from "react";
import styles from "../admin.module.css";
import { Plus, Edit2, Trash2, X, Image as ImageIcon, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import ImageUpload from "@/components/admin/ImageUpload";
import Image from "next/image";

interface ReviewImage {
  _id: string;
  imageUrl: string;
  altText: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminReviewImagesClient() {
  const [images, setImages] = useState<ReviewImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    imageUrl: "",
    altText: "Happy Customer Review",
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchImages();
  }, []);

  async function fetchImages() {
    try {
      const res = await fetch("/api/admin/review-images");
      const data = await res.json();
      setImages(data.images || []);
    } catch (err) {
      toast.error("Failed to load review images");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.imageUrl) {
      toast.error("Please upload an image first!");
      return;
    }

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/admin/review-images/${editingId}` : "/api/admin/review-images";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success(editingId ? "Review image updated! ✅" : "Review image added! ✅");
        setShowModal(false);
        setEditingId(null);
        setFormData({ imageUrl: "", altText: "Happy Customer Review", order: 0, isActive: true });
        fetchImages();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to save review image");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  }

  function handleEdit(img: ReviewImage) {
    setEditingId(img._id);
    setFormData({
      imageUrl: img.imageUrl,
      altText: img.altText,
      order: img.order,
      isActive: img.isActive,
    });
    setShowModal(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this review image?")) return;
    try {
      const res = await fetch(`/api/admin/review-images/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Review image deleted");
        fetchImages();
      } else {
        toast.error("Failed to delete review image");
      }
    } catch (err) {
      toast.error("Failed to delete");
    }
  }

  async function toggleActive(img: ReviewImage) {
    try {
      const res = await fetch(`/api/admin/review-images/${img._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...img, isActive: !img.isActive }),
      });
      if (res.ok) {
        toast.success("Status updated!");
        fetchImages();
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  }

  return (
    <div className={styles.adminContainerInner}>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Review Images</h2>
          <p className={styles.pageSubtitle}>Manage customer review screenshots shown on the home page carousel</p>
        </div>
        <button
          className={styles.btnPrimary}
          onClick={() => {
            setEditingId(null);
            setFormData({ imageUrl: "", altText: "Happy Customer Review", order: images.length, isActive: true });
            setShowModal(true);
          }}
        >
          <Plus size={18} /> Add Review Image
        </button>
      </div>

      {loading ? (
        <div className={styles.emptyState} style={{ padding: "5rem" }}>
          <div className="animate-pulse">Loading review images...</div>
        </div>
      ) : (
        <div className={styles.contentGrid} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "2rem" }}>
          {images.map((img) => (
            <div key={img._id} className={styles.contentSection} style={{ marginBottom: 0, padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border)", background: "rgba(0,0,0,0.1)" }}>
                <Image
                  src={img.imageUrl}
                  alt={img.altText}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-light)" }}>Order: {img.order}</span>
                  <span
                    onClick={() => toggleActive(img)}
                    style={{
                      cursor: "pointer",
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: "12px",
                      background: img.isActive ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                      color: img.isActive ? "#10b981" : "#ef4444",
                      border: img.isActive ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(239, 68, 68, 0.2)",
                    }}
                  >
                    {img.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-dark)", margin: "0.25rem 0 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {img.altText}
                </p>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", borderTop: "1px solid var(--border)", paddingTop: "0.75rem" }}>
                <button onClick={() => handleEdit(img)} className={styles.btnEdit} title="Edit" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: "4px", padding: "0.5rem" }}>
                  <Edit2 size={14} /> Edit
                </button>
                <button onClick={() => handleDelete(img._id)} className={styles.btnDanger} title="Delete" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: "4px", padding: "0.5rem" }}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}

          {images.length === 0 && (
            <div className={styles.emptyState} style={{ gridColumn: "1 / -1", padding: "5rem" }}>
              <ImageIcon size={48} style={{ opacity: 0.1, marginBottom: "1rem" }} />
              <p>No review images yet. Upload your first customer review screenshot!</p>
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
          justifyContent: "center",
          zIndex: 10000,
          backdropFilter: "blur(8px)",
          padding: "1rem",
        }}>
          <div className={styles.panel} style={{ width: "100%", maxWidth: "500px", padding: "2.5rem", position: "relative" }}>
            <button
              onClick={() => setShowModal(false)}
              style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "none", border: "none", color: "var(--text-light)", cursor: "pointer" }}
            >
              <X size={24} />
            </button>

            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "2rem", color: "var(--text-dark)" }}>
              {editingId ? "Edit Review Image" : "Add Review Image"}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <ImageUpload
                label="Screenshot Image"
                images={formData.imageUrl ? [formData.imageUrl] : []}
                onChange={(urls) => setFormData({ ...formData, imageUrl: urls[0] || "" })}
                maxImages={1}
              />

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Alt Text / Description</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={formData.altText}
                  onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                  placeholder="e.g. 5 Star review from Facebook"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Display Order</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Is Active</label>
                  <select
                    className={styles.formInput}
                    value={formData.isActive ? "true" : "false"}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
                  >
                    <option value="true">Active (Visible)</option>
                    <option value="false">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button type="button" onClick={() => setShowModal(false)} className={styles.btnSecondary} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary} style={{ flex: 1 }}>
                  {editingId ? "Save Changes" : "Add Image"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
