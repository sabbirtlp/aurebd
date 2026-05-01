import styles from "../admin.module.css";

export default function OrdersLoading() {
  return (
    <div className={styles.loadingSkeleton}>
      <div className={styles.skeletonHeader}>
        <div>
          <div className={styles.skeletonLine} style={{ width: "140px", height: "32px", marginBottom: "8px" }} />
          <div className={styles.skeletonLine} style={{ width: "220px", height: "16px" }} />
        </div>
      </div>
      {/* Filter tabs skeleton */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.skeletonLine} style={{ width: "100px", height: "38px", borderRadius: "10px" }} />
        ))}
      </div>
      {/* Order cards skeleton */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={styles.skeletonCard} style={{ padding: "1.25rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div className={styles.skeletonLine} style={{ width: "120px", height: "18px" }} />
            <div className={styles.skeletonLine} style={{ width: "90px", height: "28px", borderRadius: "6px" }} />
          </div>
          <div style={{ display: "flex", gap: "2rem" }}>
            <div className={styles.skeletonLine} style={{ width: "140px", height: "14px" }} />
            <div className={styles.skeletonLine} style={{ width: "80px", height: "14px" }} />
            <div className={styles.skeletonLine} style={{ width: "100px", height: "14px" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
