"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Plus, Edit2, Trash2, CheckCircle2, X } from "lucide-react";
import styles from "../admin.module.css";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function CategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    setFormData({ name, slug: editingId ? formData.slug : slug });
  };

  const openModal = (cat?: Category) => {
    if (cat) {
      setEditingId(cat._id);
      setFormData({ name: cat.name, slug: cat.slug });
    } else {
      setEditingId(null);
      setFormData({ name: "", slug: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const url = editingId ? `/api/admin/categories/${editingId}` : "/api/admin/categories";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success(editingId ? "Category updated!" : "Category created!");
        fetchCategories();
        closeModal();
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Category deleted");
        fetchCategories();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to delete category");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Category Management</h2>
          <p className={styles.pageSubtitle}>Organize your products with SEO-friendly categories.</p>
        </div>
        <div className={styles.pageHeaderActions}>
          <button className={styles.btnPrimary} onClick={() => openModal()}>
            <Plus size={18} /> Add Category
          </button>
        </div>
      </div>

      <div className={styles.contentSection}>
        {loading ? (
          <p>Loading categories...</p>
        ) : categories.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>No categories found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Permalink (Slug)</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(203, 163, 148, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem' }}>
                          {cat.name[0].toUpperCase()}
                        </div>
                        <span className="font-bold text-white tracking-tight">{cat.name}</span>
                      </div>
                    </td>
                    <td>
                      <code className="text-[11px] bg-black/20 px-2 py-1 rounded border border-white/5 text-gray-400">
                        /category/{cat.slug}
                      </code>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => openModal(cat)} className={styles.btnEdit} title="Edit Category">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(cat._id)} className={styles.btnDanger} title="Delete Category" style={{ padding: '0.5rem' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{editingId ? "Edit Category" : "Add New Category"}</h3>
              <button onClick={closeModal} className={styles.modalCloseBtn}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className="flex flex-col gap-6">
                  <div>
                    <label className={styles.contentFieldLabel}>Category Name</label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={handleNameChange} 
                      className={styles.formInput} 
                      placeholder="e.g. Skin Essentials" 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label className={styles.contentFieldLabel}>Permalink (Slug)</label>
                    <input 
                      type="text" 
                      value={formData.slug} 
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '') })} 
                      className={styles.formInput} 
                      placeholder="e.g. skin-essentials" 
                      required 
                    />
                    <div className="flex items-center gap-2 mt-2 opacity-50">
                      <CheckCircle2 size={12} className="text-green-500" />
                      <p className="text-[10px] font-medium uppercase letter-spacing-1">URL: /category/{formData.slug || '...'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" onClick={closeModal} className={styles.btnSecondary}>
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary} disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Update Category" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
