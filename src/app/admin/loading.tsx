import styles from "./admin.module.css";

export default function AdminLoading() {
  return (
    <div className={styles.loadingSkeleton}>
      {/* Header skeleton */}
      <div className={styles.skeletonHeader}>
        <div>
          <div className={styles.skeletonLine} style={{ width: "180px", height: "32px", marginBottom: "8px" }} />
          <div className={styles.skeletonLine} style={{ width: "280px", height: "16px" }} />
        </div>
      </div>

      {/* Stats grid skeleton */}
      <div className={styles.statsGrid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.skeletonCard}>
            <div className={styles.skeletonLine} style={{ width: "100px", height: "14px", marginBottom: "12px" }} />
            <div className={styles.skeletonLine} style={{ width: "80px", height: "28px" }} />
          </div>
        ))}
      </div>

      {/* Actions skeleton */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={styles.skeletonLine} style={{ width: "140px", height: "40px", borderRadius: "10px" }} />
        ))}
      </div>

      {/* Table skeleton */}
      <div className={styles.skeletonCard} style={{ padding: "1.5rem" }}>
        <div className={styles.skeletonLine} style={{ width: "160px", height: "20px", marginBottom: "1.5rem" }} />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ display: "flex", gap: "1rem", marginBottom: "1rem", alignItems: "center" }}>
            <div className={styles.skeletonLine} style={{ width: "80px", height: "16px" }} />
            <div className={styles.skeletonLine} style={{ width: "120px", height: "16px" }} />
            <div className={styles.skeletonLine} style={{ width: "60px", height: "16px" }} />
            <div className={styles.skeletonLine} style={{ width: "90px", height: "16px" }} />
            <div className={styles.skeletonLine} style={{ width: "80px", height: "28px", borderRadius: "6px" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
