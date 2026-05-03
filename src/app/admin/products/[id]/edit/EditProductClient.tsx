"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import { 
  ArrowLeft, 
  Save, 
  Tag, 
  Package, 
  Image as ImageIcon, 
  Sparkles, 
  Eye, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import styles from "../../../admin.module.css";
import ImageUpload from "@/components/admin/ImageUpload";
import RichTextEditor from "@/components/admin/RichTextEditor";
import AIAssistant from "@/components/admin/AIAssistant";

// Static categories removed in favor of DB categories

export default function EditProductClient({ product }: { product: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [dbCategories, setDbCategories] = useState<{name: string, slug: string}[]>([]);
  const [activeLang, setActiveLang] = useState<"en" | "bn">("en");
  const [form, setForm] = useState({
    name: product.name || "",
    name_bn: product.name_bn || "",
    description: product.description || "",
    description_bn: product.description_bn || "",
    price: product.price?.toString() || "",
    image: product.image || "",
    gallery: Array.isArray(product.gallery) ? product.gallery : (product.gallery ? [product.gallery] : []),
    stock: product.stock?.toString() || "",
    category: product.category || "",
    categories: Array.isArray(product.categories) ? product.categories : (product.categories ? [product.categories] : [product.category].filter(Boolean) || []),
    isNewArrival: product.isNewArrival || false,
    isBestSeller: product.isBestSeller || false,
    isSpecialOffer: product.isSpecialOffer || false,
    isGiftSet: product.isGiftSet || false,
    discountPrice: product.discountPrice?.toString() || "",
    ingredients: product.ingredients || "",
    ingredients_bn: product.ingredients_bn || "",
    howToUse: product.howToUse || "",
    howToUse_bn: product.howToUse_bn || "",
    shortDescription: product.shortDescription || "",
    shortDescription_bn: product.shortDescription_bn || "",
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
    setIsSaved(false);
  };

  const handleCategoryToggle = (slug: string) => {
    const newCategories = form.categories.includes(slug)
      ? form.categories.filter((c: string) => c !== slug)
      : [...form.categories, slug];
    
    setForm({ 
      ...form, 
      categories: newCategories,
      category: newCategories[0] || "", // First one as main
      isSaved: false
    } as any);
    setIsSaved(false);
  };

  const handleToggle = (name: string) => {
    setForm({ ...form, [name]: !((form as any)[name]) });
    setIsSaved(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/products/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success("Product changes synchronized! ✅");
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
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
    <div className="pb-20">
      {/* Sticky Premium Header */}
      <div className={styles.stickyHeader}>
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className={styles.btnEdit} style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className={styles.pageTitle} style={{ fontSize: '1.5rem' }}>{form.name || "Untitled Product"}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={styles.badgePending} style={{ fontSize: '0.6rem' }}>Product ID: {product._id}</span>
              {isSaved && <span className="text-green-500 text-[10px] font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> All changes saved</span>}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Language Toggle */}
          <div className="flex bg-black/20 rounded-full p-1 border border-white/10 mr-4">
            <button 
              onClick={() => setActiveLang("en")}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${activeLang === "en" ? "bg-[var(--primary)] text-white shadow-lg" : "text-white/40 hover:text-white"}`}
            >
              EN
            </button>
            <button 
              onClick={() => setActiveLang("bn")}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${activeLang === "bn" ? "bg-[var(--primary)] text-white shadow-lg" : "text-white/40 hover:text-white"}`}
            >
              BN
            </button>
          </div>

          <Link href={`/product/${product._id}`} target="_blank" className={styles.btnSecondary}>
            <Eye className="w-4 h-4" />
            Preview
          </Link>
          <button 
            onClick={() => handleSubmit()}
            className={styles.btnPrimary} 
            disabled={loading || isSaved}
            style={{ background: isSaved ? 'var(--nm-dark)' : 'var(--primary)', color: isSaved ? 'var(--text-light)' : 'white' }}
          >
            {loading ? <span className="animate-pulse">Saving...</span> : isSaved ? "Changes Saved" : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>
      </div>

      <div className={styles.editLayout}>
        {/* Main Content Column */}
        <div className={styles.mainCol}>
          
          {/* General Information */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[var(--primary)]" />
                <h3 className={styles.sectionTitle}>Product Information</h3>
              </div>
            </div>
            <div className={styles.fieldGrid}>
              <div className={styles.fieldFull}>
                <label className={styles.contentFieldLabel}>
                  Formal Product Name ({activeLang === "en" ? "English" : "Bangla"})
                </label>
                <input 
                  type="text" 
                  name={activeLang === "en" ? "name" : "name_bn"} 
                  value={activeLang === "en" ? form.name : form.name_bn} 
                  onChange={handleChange} 
                  className={styles.formInput} 
                  placeholder={activeLang === "en" ? "e.g. Japan Sakura Radiance Serum" : "যেমন: জাপান সাকুরা রেডিয়েন্স সিরাম"} 
                  required={activeLang === "en"} 
                />
              </div>
              <div className={styles.fieldFull}>
                <label className={styles.contentFieldLabel}>Select Categories</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", padding: "1rem", background: "rgba(255,255,255,0.05)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                  {dbCategories.length === 0 ? (
                    <p className="text-sm opacity-50">No categories found.</p>
                  ) : (
                    dbCategories.map((cat) => (
                      <label key={cat.slug} style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", background: form.categories.includes(cat.slug) ? "var(--primary-dark)" : "transparent", padding: "2px 6px", borderRadius: "4px", border: "1px solid var(--border)" }}>
                        <input 
                          type="checkbox" 
                          checked={form.categories.includes(cat.slug)} 
                          onChange={() => handleCategoryToggle(cat.slug)}
                          style={{ width: "0.9rem", height: "0.9rem" }}
                        />
                        <span className="text-xs">{cat.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
              <div>
                <label className={styles.contentFieldLabel}>Inventory Status</label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                  <input type="number" name="stock" value={form.stock} onChange={handleChange} className={styles.formInput} style={{ paddingLeft: '2.5rem' }} placeholder="0" required />
                </div>
              </div>
            </div>
          </section>

          {/* Marketing & Description (AI ASSISTED) */}
          <section className={`${styles.sectionCard} ${styles.aiSection}`}>
            <div className={styles.sectionHeader}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--primary)]" />
                <h3 className={styles.sectionTitle}>Merchandising Content</h3>
              </div>
            </div>
            
            <div className="flex flex-col gap-8">
              {/* Short Description */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className={styles.contentFieldLabel}>Hook / Short Description ({activeLang.toUpperCase()})</label>
                </div>
                <AIAssistant 
                  productName={form.name} 
                  category={form.category} 
                  field="shortDescription" 
                  language={activeLang}
                  existingContent={activeLang === "en" ? form.shortDescription : form.shortDescription_bn}
                  onGenerate={(text) => {
                    const fieldName = activeLang === "en" ? "shortDescription" : "shortDescription_bn";
                    setForm(prev => ({ ...prev, [fieldName]: text }));
                    setIsSaved(false);
                  }} 
                />
                <RichTextEditor 
                  label=""
                  value={activeLang === "en" ? form.shortDescription : form.shortDescription_bn}
                  onChange={(val) => {
                    const fieldName = activeLang === "en" ? "shortDescription" : "shortDescription_bn";
                    setForm(prev => ({ ...prev, [fieldName]: val }));
                    setIsSaved(false);
                  }}
                />
              </div>

              {/* Ingredients */}
              <div>
                <label className={styles.contentFieldLabel}>Active Ingredients ({activeLang.toUpperCase()})</label>
                <AIAssistant 
                  productName={form.name} 
                  category={form.category} 
                  field="ingredients" 
                  language={activeLang}
                  existingContent={activeLang === "en" ? form.ingredients : form.ingredients_bn}
                  onGenerate={(text) => {
                    const fieldName = activeLang === "en" ? "ingredients" : "ingredients_bn";
                    setForm(prev => ({ ...prev, [fieldName]: text }));
                    setIsSaved(false);
                  }} 
                />
                <RichTextEditor 
                  label=""
                  value={activeLang === "en" ? form.ingredients : form.ingredients_bn}
                  onChange={(val) => {
                    const fieldName = activeLang === "en" ? "ingredients" : "ingredients_bn";
                    setForm(prev => ({ ...prev, [fieldName]: val }));
                    setIsSaved(false);
                  }}
                />
              </div>

              {/* Usage */}
              <div>
                <label className={styles.contentFieldLabel}>Application Guide ({activeLang.toUpperCase()})</label>
                <AIAssistant 
                  productName={form.name} 
                  category={form.category} 
                  field="howToUse" 
                  language={activeLang}
                  existingContent={activeLang === "en" ? form.howToUse : form.howToUse_bn}
                  onGenerate={(text) => {
                    const fieldName = activeLang === "en" ? "howToUse" : "howToUse_bn";
                    setForm(prev => ({ ...prev, [fieldName]: text }));
                    setIsSaved(false);
                  }} 
                />
                <RichTextEditor 
                  label=""
                  value={activeLang === "en" ? form.howToUse : form.howToUse_bn}
                  onChange={(val) => {
                    const fieldName = activeLang === "en" ? "howToUse" : "howToUse_bn";
                    setForm(prev => ({ ...prev, [fieldName]: val }));
                    setIsSaved(false);
                  }}
                />
              </div>

              {/* Main Description */}
              <div>
                <label className={styles.contentFieldLabel}>Full Detailed Description ({activeLang.toUpperCase()})</label>
                <AIAssistant 
                  productName={form.name} 
                  category={form.category} 
                  field="description" 
                  language={activeLang}
                  existingContent={activeLang === "en" ? form.description : form.description_bn}
                  onGenerate={(text) => {
                    const fieldName = activeLang === "en" ? "description" : "description_bn";
                    setForm(prev => ({ ...prev, [fieldName]: text }));
                    setIsSaved(false);
                  }} 
                />
                <RichTextEditor 
                  label=""
                  value={activeLang === "en" ? form.description : form.description_bn}
                  onChange={(val) => {
                    const fieldName = activeLang === "en" ? "description" : "description_bn";
                    setForm(prev => ({ ...prev, [fieldName]: val }));
                    setIsSaved(false);
                  }}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Column */}
        <div className={styles.sideCol}>
          
          {/* Pricing Card */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Pricing (৳)</h3>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className={styles.contentFieldLabel}>Regular Price</label>
                <input type="number" name="price" value={form.price} onChange={handleChange} className={styles.formInput} required />
              </div>
              <div>
                <label className={styles.contentFieldLabel}>Discounted Price</label>
                <input type="number" name="discountPrice" value={form.discountPrice} onChange={handleChange} className={styles.formInput} />
                <p className="text-[10px] mt-1 opacity-50">Leave empty if no active discount.</p>
              </div>
            </div>
          </section>

          {/* Product Media */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[var(--primary)]" />
                <h3 className={styles.sectionTitle}>Product Media</h3>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <ImageUpload 
                label="Primary Visual"
                images={form.image ? [form.image] : []}
                onChange={(images) => {
                  setForm(prev => ({ ...prev, image: images[0] || "" }));
                  setIsSaved(false);
                }}
                maxImages={1}
              />
              <div className="border-t border-[var(--border)] pt-4">
                <ImageUpload 
                  label="Gallery Collection"
                  images={form.gallery}
                  onChange={(images) => {
                    setForm(prev => ({ ...prev, gallery: images }));
                    setIsSaved(false);
                  }}
                  maxImages={10}
                />
              </div>
            </div>
          </section>

          {/* Organization & Visibility */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Organization</h3>
            </div>
            <div className="flex flex-col gap-3">
              <label className={styles.switchLabel}>
                <span className="text-xs font-bold opacity-80">New Arrival</span>
                <div className={styles.switch}>
                  <input type="checkbox" checked={form.isNewArrival} onChange={() => handleToggle('isNewArrival')} />
                  <span className={styles.slider}></span>
                </div>
              </label>
              <label className={styles.switchLabel}>
                <span className="text-xs font-bold opacity-80">Best Seller</span>
                <div className={styles.switch}>
                  <input type="checkbox" checked={form.isBestSeller} onChange={() => handleToggle('isBestSeller')} />
                  <span className={styles.slider}></span>
                </div>
              </label>
              <label className={styles.switchLabel}>
                <span className="text-xs font-bold opacity-80">Special Offer</span>
                <div className={styles.switch}>
                  <input type="checkbox" checked={form.isSpecialOffer} onChange={() => handleToggle('isSpecialOffer')} />
                  <span className={styles.slider}></span>
                </div>
              </label>
              <label className={styles.switchLabel}>
                <span className="text-xs font-bold opacity-80">Gift Set</span>
                <div className={styles.switch}>
                  <input type="checkbox" checked={form.isGiftSet} onChange={() => handleToggle('isGiftSet')} />
                  <span className={styles.slider}></span>
                </div>
              </label>
            </div>
          </section>

          {/* Danger Zone */}
          <div className="mt-4 px-2 flex items-start gap-2 opacity-40 hover:opacity-100 transition-opacity">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
            <p className="text-[10px] leading-tight">Deletion of this product is permanent and will remove it from all active orders and collections.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
