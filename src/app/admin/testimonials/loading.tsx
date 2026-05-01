import styles from "../admin.module.css";

export default function TestimonialsLoading() {
  return (
    <div className={styles.loadingSkeleton}>
      <div className={styles.skeletonHeader}>
        <div>
          <div className={styles.skeletonLine} style={{ width: "180px", height: "32px", marginBottom: "8px" }} />
          <div className={styles.skeletonLine} style={{ width: "260px", height: "16px" }} />
        </div>
        <div className={styles.skeletonLine} style={{ width: "160px", height: "42px", borderRadius: "10px" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "2rem" }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.skeletonCard} style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", gap: "2px", marginBottom: "1.5rem" }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className={styles.skeletonLine} style={{ width: "16px", height: "16px", borderRadius: "2px" }} />
              ))}
            </div>
            <div className={styles.skeletonLine} style={{ width: "100%", height: "14px", marginBottom: "8px" }} />
            <div className={styles.skeletonLine} style={{ width: "80%", height: "14px", marginBottom: "8px" }} />
            <div className={styles.skeletonLine} style={{ width: "60%", height: "14px", marginBottom: "1.5rem" }} />
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", paddingTop: "1.5rem", borderTop: "1px solid var(--border)" }}>
              <div className={styles.skeletonLine} style={{ width: "48px", height: "48px", borderRadius: "50%", flexShrink: 0 }} />
              <div>
                <div className={styles.skeletonLine} style={{ width: "100px", height: "16px", marginBottom: "4px" }} />
                <div className={styles.skeletonLine} style={{ width: "70px", height: "12px" }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
