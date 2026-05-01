import styles from "./product.module.css";

export default function ProductLoading() {
  return (
    <main className={styles.productPage}>
      <div className="container">
        <section className={styles.heroGrid}>
          {/* Gallery skeleton */}
          <div className={styles.gallery}>
            <div 
              className={styles.mainImageWrapper}
              style={{
                background: "linear-gradient(90deg, var(--border) 25%, rgba(203,163,148,0.08) 50%, var(--border) 75%)",
                backgroundSize: "800px 100%",
                animation: "shimmer 1.5s infinite ease-in-out"
              }}
            />
            <div className={styles.thumbnails}>
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i}
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "12px",
                    background: "linear-gradient(90deg, var(--border) 25%, rgba(203,163,148,0.08) 50%, var(--border) 75%)",
                    backgroundSize: "800px 100%",
                    animation: "shimmer 1.5s infinite ease-in-out"
                  }}
                />
              ))}
            </div>
          </div>

          {/* Info skeleton */}
          <div className={styles.info}>
            <div className={styles.header}>
              <div style={{ width: "80px", height: "24px", borderRadius: "20px", background: "var(--border)", marginBottom: "12px" }} />
              <div style={{ width: "70%", height: "32px", borderRadius: "8px", background: "var(--border)", marginBottom: "12px" }} />
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} style={{ width: "18px", height: "18px", borderRadius: "2px", background: "var(--border)" }} />
                ))}
                <div style={{ width: "80px", height: "18px", borderRadius: "4px", background: "var(--border)", marginLeft: "8px" }} />
              </div>
              <div style={{ width: "120px", height: "36px", borderRadius: "8px", background: "var(--border)" }} />
            </div>

            <div style={{ marginTop: "24px" }}>
              <div style={{ width: "100%", height: "14px", borderRadius: "4px", background: "var(--border)", marginBottom: "8px" }} />
              <div style={{ width: "90%", height: "14px", borderRadius: "4px", background: "var(--border)", marginBottom: "8px" }} />
              <div style={{ width: "60%", height: "14px", borderRadius: "4px", background: "var(--border)" }} />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
              <div style={{ width: "120px", height: "56px", borderRadius: "14px", background: "var(--border)" }} />
              <div style={{ flex: 1, height: "56px", borderRadius: "14px", background: "var(--border)" }} />
              <div style={{ flex: 1, height: "56px", borderRadius: "14px", background: "var(--border)" }} />
            </div>

            <div style={{ display: "flex", gap: "16px", marginTop: "24px" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ flex: 1, height: "48px", borderRadius: "12px", background: "var(--border)" }} />
              ))}
            </div>
          </div>
        </section>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
      `}</style>
    </main>
  );
}
