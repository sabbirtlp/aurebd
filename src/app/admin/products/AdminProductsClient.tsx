"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../admin.module.css";

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
          + Add Product
        </Link>
      </div>

      <div className={styles.panel}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product: any) => (
              <tr key={product._id}>
                <td>
                  <div style={{ width: 40, height: 40, position: "relative", borderRadius: 6, overflow: "hidden", background: "#f3f4f6" }}>
                    <Image src={product.image} alt={product.name} fill style={{ objectFit: "cover" }} />
                  </div>
                </td>
                <td style={{ fontWeight: 600 }}>{product.name}</td>
                <td>{product.category}</td>
                <td>৳ {product.price}</td>
                <td>{product.stock}</td>
                <td>
                  <span className={`${styles.badge} ${product.stock > 0 ? styles.badgeSuccess : styles.badgePending}`}>
                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Link href={`/admin/products/${product._id}/edit`} className={styles.btnEdit}>Edit</Link>
                    <button
                      className={styles.btnDanger}
                      onClick={() => handleDelete(product._id)}
                      disabled={deleting === product._id}
                    >
                      {deleting === product._id ? "..." : "Delete"}
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
