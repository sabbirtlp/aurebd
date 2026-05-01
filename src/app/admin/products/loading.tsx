import styles from "../admin.module.css";

export default function ProductsLoading() {
  return (
    <div className={styles.loadingSkeleton}>
      <div className={styles.skeletonHeader}>
        <div>
          <div className={styles.skeletonLine} style={{ width: "160px", height: "32px", marginBottom: "8px" }} />
          <div className={styles.skeletonLine} style={{ width: "200px", height: "16px" }} />
        </div>
        <div className={styles.skeletonLine} style={{ width: "140px", height: "42px", borderRadius: "10px" }} />
      </div>
      <div className={styles.skeletonCard} style={{ padding: "1.5rem" }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem", alignItems: "center" }}>
            <div className={styles.skeletonLine} style={{ width: "56px", height: "56px", borderRadius: "10px", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className={styles.skeletonLine} style={{ width: "60%", height: "16px", marginBottom: "6px" }} />
              <div className={styles.skeletonLine} style={{ width: "30%", height: "14px" }} />
            </div>
            <div className={styles.skeletonLine} style={{ width: "60px", height: "28px", borderRadius: "6px" }} />
            <div className={styles.skeletonLine} style={{ width: "32px", height: "32px", borderRadius: "8px" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
