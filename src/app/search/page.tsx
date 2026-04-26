import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import ProductCard from '@/features/products/ProductCard';
import styles from "../page.module.css";

export const dynamic = 'force-dynamic';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || "";
  
  let products = [];
  
  if (query) {
    await dbConnect();
    const rawProducts = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } }
      ]
    }).lean();
    
    products = JSON.parse(JSON.stringify(rawProducts));
  }

  return (
    <div className="container" style={{ padding: "8rem 1.5rem 4rem" }}>
      <h2 className="section-title" style={{ textAlign: "left", marginBottom: "1rem" }}>
        Search Results for &quot;{query}&quot;
      </h2>
        <p style={{ marginBottom: "3rem", color: "var(--text-light)", fontSize: "1.1rem" }}>
          Found {products.length} {products.length === 1 ? 'product' : 'products'}
        </p>
        
        {products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", background: "white", borderRadius: "12px", border: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>No results found</h3>
            <p style={{ color: "var(--text-light)" }}>Try adjusting your search or browsing our categories.</p>
          </div>
        ) : (
          <div className={styles.productGrid}>
            {products.map((product: any) => (
              <ProductCard key={product._id} product={product} styles={styles} />
            ))}
          </div>
        )}
      </div>
  );
}
