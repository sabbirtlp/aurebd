import styles from "../admin.module.css";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Image from "next/image";

export default async function AdminProducts() {
  await dbConnect();
  const products = await Product.find({}).lean();

  return (
    <div className={styles.panel}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h3 className={styles.panelTitle} style={{ marginBottom: 0 }}>Product Management</h3>
        <button className="btn-primary">Add New Product</button>
      </div>
      
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product: any) => (
            <tr key={product._id.toString()}>
              <td>
                <div style={{ width: 40, height: 40, position: "relative", borderRadius: 4, overflow: "hidden" }}>
                  <Image src={product.image} alt={product.name} fill style={{ objectFit: "cover" }} />
                </div>
              </td>
              <td style={{ fontWeight: 500 }}>{product.name}</td>
              <td>৳ {product.price}</td>
              <td>{product.stock}</td>
              <td>
                <span className={`${styles.badge} ${product.stock > 0 ? styles.badgeSuccess : styles.badgePending}`}>
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </td>
              <td>
                <button style={{ marginRight: "0.5rem", background: "none", border: "none", color: "var(--primary)", cursor: "pointer" }}>Edit</button>
                <button style={{ background: "none", border: "none", color: "red", cursor: "pointer" }}>Delete</button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr><td colSpan={6} style={{textAlign: "center"}}>No products found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
