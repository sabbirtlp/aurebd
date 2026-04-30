"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "../../../admin.module.css";
import ImageUpload from "@/components/admin/ImageUpload";

const CATEGORIES = ["Sets", "Serums", "Creams", "Sunscreen", "Cleansers", "Radiance Serums", "Hydration Creams", "UV Protection", "Skin Essentials"];

export default function EditProductClient({ product }: { product: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: product.name || "",
    description: product.description || "",
    price: product.price?.toString() || "",
    image: product.image || "",
    gallery: product.gallery || [],
    stock: product.stock?.toString() || "",
    category: product.category || CATEGORIES[0],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
        router.push("/admin/products");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update product");
      }
    } catch (error) {
      alert("An error occurred");
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
              <select name="category" value={form.category} onChange={handleChange} className={styles.formInput}>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
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
                onChange={(images) => setForm({ ...form, image: images[0] || "" })}
                maxImages={1}
              />
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <ImageUpload 
                label="Product Image Gallery"
                images={form.gallery}
                onChange={(images) => setForm({ ...form, gallery: images })}
                maxImages={4}
              />
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.formLabel}>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} className={styles.formInput} rows={4} required style={{ resize: "vertical" }} />
            </div>
          </div>

          <div className={styles.formActions}>
            <Link href="/admin/products" className={styles.btnSecondary}>Cancel</Link>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
