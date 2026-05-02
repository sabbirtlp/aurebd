"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "../../admin.module.css";
import ImageUpload from "@/components/admin/ImageUpload";
import RichTextEditor from "@/components/admin/RichTextEditor";
import AIAssistant from "@/components/admin/AIAssistant";

// Static categories removed in favor of DB categories

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dbCategories, setDbCategories] = useState<{name: string, slug: string}[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    gallery: [] as string[],
    stock: "",
    category: "",
    categories: [] as string[],
    isNewArrival: false,
    isBestSeller: false,
    isSpecialOffer: false,
    isGiftSet: false,
    discountPrice: "",
    ingredients: "",
    howToUse: "",
    shortDescription: "",
  });

  useEffect(() => {
    fetch("/api/admin/categories")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDbCategories(data);
        }
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCategoryToggle = (slug: string) => {
    const newCategories = form.categories.includes(slug)
      ? form.categories.filter(c => c !== slug)
      : [...form.categories, slug];
    
    setForm({ 
      ...form, 
      categories: newCategories,
      category: newCategories[0] || "" // First one as main
    });
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

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.formLabel}>Select Categories</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", padding: "1rem", background: "rgba(255,255,255,0.05)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                {dbCategories.length === 0 ? (
                  <p className="text-sm opacity-50">No categories found. Please create categories first.</p>
                ) : (
                  dbCategories.map((cat) => (
                    <label key={cat.slug} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", background: form.categories.includes(cat.slug) ? "var(--primary-dark)" : "transparent", padding: "4px 8px", borderRadius: "4px", border: "1px solid var(--border)" }}>
                      <input 
                        type="checkbox" 
                        checked={form.categories.includes(cat.slug)} 
                        onChange={() => handleCategoryToggle(cat.slug)}
                        style={{ width: "1rem", height: "1rem" }}
                      />
                      <span className="text-sm">{cat.name}</span>
                    </label>
                  ))
                )}
              </div>
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
