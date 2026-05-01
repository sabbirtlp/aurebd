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
                background: "var(--border)",
                opacity: 0.5
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
                    background: "var(--border)",
                    opacity: 0.4
                  }}
                />
              ))}
            </div>
          </div>

          {/* Info skeleton */}
          <div className={styles.info}>
            <div className={styles.header}>
              <div style={{ width: "80px", height: "24px", borderRadius: "20px", background: "var(--border)", marginBottom: "12px", opacity: 0.4 }} />
              <div style={{ width: "70%", height: "32px", borderRadius: "8px", background: "var(--border)", marginBottom: "12px", opacity: 0.5 }} />
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} style={{ width: "18px", height: "18px", borderRadius: "2px", background: "var(--border)", opacity: 0.3 }} />
                ))}
                <div style={{ width: "80px", height: "18px", borderRadius: "4px", background: "var(--border)", marginLeft: "8px", opacity: 0.3 }} />
              </div>
              <div style={{ width: "120px", height: "36px", borderRadius: "8px", background: "var(--border)", opacity: 0.5 }} />
            </div>

            <div style={{ marginTop: "24px" }}>
              <div style={{ width: "100%", height: "14px", borderRadius: "4px", background: "var(--border)", marginBottom: "8px", opacity: 0.3 }} />
              <div style={{ width: "90%", height: "14px", borderRadius: "4px", background: "var(--border)", marginBottom: "8px", opacity: 0.3 }} />
              <div style={{ width: "60%", height: "14px", borderRadius: "4px", background: "var(--border)", opacity: 0.3 }} />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
              <div style={{ width: "120px", height: "56px", borderRadius: "14px", background: "var(--border)", opacity: 0.4 }} />
              <div style={{ flex: 1, height: "56px", borderRadius: "14px", background: "var(--border)", opacity: 0.4 }} />
              <div style={{ flex: 1, height: "56px", borderRadius: "14px", background: "var(--border)", opacity: 0.4 }} />
            </div>

            <div style={{ display: "flex", gap: "16px", marginTop: "24px" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ flex: 1, height: "48px", borderRadius: "12px", background: "var(--border)", opacity: 0.3 }} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
