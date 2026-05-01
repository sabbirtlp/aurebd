"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../admin.module.css";
import { Edit2, Trash2, Package, Tag, Layers } from "lucide-react";

export default function AdminProductsClient({ initialProducts }: { initialProducts: any[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setDeleting(id);

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(products.filter((p) => p._id !== id));
      } else {
        alert("Failed to delete product.");
      }
    } catch (error) {
      alert("An error occurred.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Products</h2>
          <p className={styles.pageSubtitle}>{products.length} products total</p>
        </div>
        <Link href="/admin/products/new" className={styles.btnPrimary}>
          <Package size={18} /> Add New Product
        </Link>
      </div>

      <div className={styles.panel}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product: any) => (
              <tr key={product._id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ 
                      width: 48, 
                      height: 48, 
                      position: "relative", 
                      borderRadius: 12, 
                      overflow: "hidden", 
                      background: "var(--bg-color)",
                      boxShadow: "var(--nm-outer-raised-sm)",
                      border: "1px solid var(--border)"
                    }}>
                      <Image src={product.image} alt={product.name} fill style={{ objectFit: "cover" }} />
                    </div>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{product.name}</span>
                  </div>
                </td>
                <td>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "var(--text-light)" }}>
                    <Layers size={14} /> {product.category}
                  </span>
                </td>
                <td style={{ fontWeight: 700, color: "var(--primary)" }}>৳ {product.price}</td>
                <td>
                  <span style={{ fontWeight: 600 }}>{product.stock}</span>
                </td>
                <td>
                  <span className={`${styles.badge} ${
                    product.stock > 10 ? styles.badgeSuccess : 
                    product.stock > 0 ? styles.badgeWarning : 
                    styles.badgeDanger
                  }`}>
                    {product.stock > 10 ? "In Stock" : product.stock > 0 ? "Low Stock" : "Out of Stock"}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                    <Link href={`/admin/products/${product._id}/edit`} className={styles.btnEdit} title="Edit Product">
                      <Edit2 size={16} />
                    </Link>
                    <button
                      className={styles.btnDanger}
                      onClick={() => handleDelete(product._id)}
                      disabled={deleting === product._id}
                      title="Delete Product"
                    >
                      {deleting === product._id ? "..." : <Trash2 size={16} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <div className={styles.emptyState}>
                    <p>No products found</p>
                    <Link href="/admin/products/new" className={styles.btnPrimary}>Add Your First Product</Link>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
