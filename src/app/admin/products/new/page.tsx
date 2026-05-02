"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "../../admin.module.css";
import ImageUpload from "@/components/admin/ImageUpload";
import RichTextEditor from "@/components/admin/RichTextEditor";
import AIAssistant from "@/components/admin/AIAssistant";

const CATEGORIES = ["Sets", "Serums", "Creams", "Sunscreen", "Cleansers", "Radiance Serums", "Hydration Creams", "UV Protection", "Skin Essentials"];

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    gallery: [] as string[],
    stock: "",
    category: CATEGORIES[0],
    isNewArrival: false,
    isBestSeller: false,
    isSpecialOffer: false,
    isGiftSet: false,
    discountPrice: "",
    ingredients: "",
    howToUse: "",
    shortDescription: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to create product");
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
          <h2 className={styles.pageTitle}>Add New Product</h2>
          <p className={styles.pageSubtitle}>Create a new product listing</p>
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
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="e.g. Japan Sakura Serum"
                required
              />
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
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="e.g. 450"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Discount Price (৳) - Optional</label>
              <input
                type="number"
                name="discountPrice"
                value={form.discountPrice}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="e.g. 399"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Stock Quantity</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="e.g. 100"
                required
              />
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
                    onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })}
                    style={{ width: "1.2rem", height: "1.2rem" }}
                  />
                  <span>Mark as New Arrival</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input 
                    type="checkbox" 
                    name="isBestSeller" 
                    checked={form.isBestSeller} 
                    onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })}
                    style={{ width: "1.2rem", height: "1.2rem" }}
                  />
                  <span>Best Seller</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input 
                    type="checkbox" 
                    name="isSpecialOffer" 
                    checked={form.isSpecialOffer} 
                    onChange={(e) => setForm({ ...form, isSpecialOffer: e.target.checked })}
                    style={{ width: "1.2rem", height: "1.2rem" }}
                  />
                  <span>Special Offer</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input 
                    type="checkbox" 
                    name="isGiftSet" 
                    checked={form.isGiftSet} 
                    onChange={(e) => setForm({ ...form, isGiftSet: e.target.checked })}
                    style={{ width: "1.2rem", height: "1.2rem" }}
                  />
                  <span>Gift Set</span>
                </label>
              </div>
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <AIAssistant 
                productName={form.name} 
                category={form.category} 
                field="ingredients" 
                onGenerate={(text) => setForm({ ...form, ingredients: text })} 
              />
              <RichTextEditor 
                label="Ingredients"
                value={form.ingredients}
                onChange={(val) => setForm({ ...form, ingredients: val })}
              />
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <AIAssistant 
                productName={form.name} 
                category={form.category} 
                field="howToUse" 
                onGenerate={(text) => setForm({ ...form, howToUse: text })} 
              />
              <RichTextEditor 
                label="How To Use"
                value={form.howToUse}
                onChange={(val) => setForm({ ...form, howToUse: val })}
              />
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "0.5rem" }}>
                <label className={styles.formLabel} style={{ marginBottom: 0 }}>Short Description</label>
                <AIAssistant 
                  productName={form.name} 
                  category={form.category} 
                  field="description" // I'll use a specific field type for short desc in a moment
                  onGenerate={(text) => {
                    // Truncate to 2-3 sentences for short desc
                    const shortText = text.split('.').slice(0, 2).join('.') + '.';
                    setForm({ ...form, shortDescription: shortText });
                  }} 
                />
              </div>
              <textarea
                name="shortDescription"
                value={form.shortDescription}
                onChange={handleChange}
                className={styles.formInput}
                rows={2}
                placeholder="Catchy 2-sentence summary..."
                style={{ resize: "vertical" }}
              />
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "0.5rem" }}>
                <label className={styles.formLabel} style={{ marginBottom: 0 }}>Description</label>
                <AIAssistant 
                  productName={form.name} 
                  category={form.category} 
                  field="description" 
                  onGenerate={(text) => setForm({ ...form, description: text })} 
                />
              </div>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className={styles.formInput}
                rows={4}
                placeholder="Product description..."
                required
                style={{ resize: "vertical" }}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <Link href="/admin/products" className={styles.btnSecondary}>Cancel</Link>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
