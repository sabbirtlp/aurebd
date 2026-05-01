import styles from "../../../admin.module.css";

export default function EditProductLoading() {
  return (
    <div className={styles.loadingSkeleton}>
      <div className={styles.skeletonHeader}>
        <div>
          <div className={styles.skeletonLine} style={{ width: "200px", height: "32px", marginBottom: "8px" }} />
          <div className={styles.skeletonLine} style={{ width: "300px", height: "16px" }} />
        </div>
        <div className={styles.skeletonLine} style={{ width: "140px", height: "42px", borderRadius: "10px" }} />
      </div>

      {/* Form skeleton */}
      <div className={styles.skeletonCard} style={{ padding: "2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i}>
              <div className={styles.skeletonLine} style={{ width: "100px", height: "14px", marginBottom: "8px" }} />
              <div className={styles.skeletonLine} style={{ width: "100%", height: "44px", borderRadius: "10px" }} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: "1.5rem" }}>
          <div className={styles.skeletonLine} style={{ width: "100px", height: "14px", marginBottom: "8px" }} />
          <div className={styles.skeletonLine} style={{ width: "100%", height: "120px", borderRadius: "10px" }} />
        </div>
        <div style={{ marginTop: "1.5rem" }}>
          <div className={styles.skeletonLine} style={{ width: "120px", height: "14px", marginBottom: "8px" }} />
          <div style={{ display: "flex", gap: "12px" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.skeletonLine} style={{ width: "100px", height: "100px", borderRadius: "12px" }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
