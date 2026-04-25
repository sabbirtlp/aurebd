import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import styles from "../page.module.css";

// This is required to access search params in a Server Component
export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || "";
  
  let products = [];
  
  if (query) {
    await dbConnect();
    // Perform a case-insensitive regex search on name and description
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
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-color)" }}>
      <Navbar />
      
      <div className="container" style={{ padding: "4rem 1.5rem" }}>
        <h2 className="section-title" style={{ textAlign: "left", marginBottom: "1rem" }}>
          Search Results for "{query}"
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
    </main>
  );
}
