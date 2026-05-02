"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import Image from "next/image";
import styles from "../../../admin.module.css";
import ImageUpload from "@/components/admin/ImageUpload";

const CATEGORIES = ["Sets", "Serums", "Creams", "Sunscreen", "Cleansers", "Radiance Serums", "Hydration Creams", "UV Protection", "Skin Essentials"];

export default function EditProductClient({ product }: { product: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [form, setForm] = useState({
    name: product.name || "",
    description: product.description || "",
    price: product.price?.toString() || "",
    image: product.image || "",
    gallery: product.gallery || [],
    stock: product.stock?.toString() || "",
    category: product.category || CATEGORIES[0],
    isNewArrival: product.isNewArrival || false,
    isBestSeller: product.isBestSeller || false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setIsSaved(false); // Reactivate button on change
  };

  const handleImageChange = (newImage: string) => {
    setForm({ ...form, image: newImage });
    setIsSaved(false);
  };

  const handleGalleryChange = (newGallery: string[]) => {
    setForm({ ...form, gallery: newGallery });
    setIsSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/products/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success("Product updated successfully! ✅");
        setIsSaved(true);
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to update product");
      }
    } catch (error) {
      toast.error("An error occurred while saving");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Edit Product</h2>
          <p className={styles.pageSubtitle}>Editing: {product.name}</p>
        </div>
        <Link href="/admin/products" className={styles.btnSecondary}>
          ← Back to Products
        </Link>
      </div>

      <div className={styles.panel}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Product Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} className={styles.formInput} required />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Category</label>
              <input 
                type="text" 
                name="category" 
                value={form.category} 
                onChange={handleChange} 
                className={styles.formInput} 
                list="category-options"
                placeholder="Type or select a category..."
                required 
              />
              <datalist id="category-options">
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Price (৳)</label>
              <input type="number" name="price" value={form.price} onChange={handleChange} className={styles.formInput} required />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Stock Quantity</label>
              <input type="number" name="stock" value={form.stock} onChange={handleChange} className={styles.formInput} required />
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <ImageUpload 
                label="Primary Product Image"
                images={form.image ? [form.image] : []}
                onChange={(images) => handleImageChange(images[0] || "")}
                maxImages={1}
              />
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <ImageUpload 
                label="Product Image Gallery"
                images={form.gallery}
                onChange={handleGalleryChange}
                maxImages={10}
              />
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <div style={{ display: "flex", gap: "2rem", padding: "1rem", background: "rgba(0,0,0,0.05)", borderRadius: "12px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input 
                    type="checkbox" 
                    name="isNewArrival" 
                    checked={form.isNewArrival} 
                    onChange={(e) => {
                      setForm({ ...form, isNewArrival: e.target.checked });
                      setIsSaved(false);
                    }}
                    style={{ width: "1.2rem", height: "1.2rem" }}
                  />
                  <span>Mark as New Arrival</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input 
                    type="checkbox" 
                    name="isBestSeller" 
                    checked={form.isBestSeller} 
                    onChange={(e) => {
                      setForm({ ...form, isBestSeller: e.target.checked });
                      setIsSaved(false);
                    }}
                    style={{ width: "1.2rem", height: "1.2rem" }}
                  />
                  <span>Mark as Best Seller</span>
                </label>
              </div>
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.formLabel}>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} className={styles.formInput} rows={4} required style={{ resize: "vertical" }} />
            </div>
          </div>

          <div className={styles.formActions}>
            <Link href="/admin/products" className={styles.btnSecondary}>Back to List</Link>
            <button 
              type="submit" 
              className={styles.btnPrimary} 
              disabled={loading || isSaved}
              style={{ minWidth: "140px" }}
            >
              {loading ? "Saving..." : isSaved ? "Saved! ✅" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
