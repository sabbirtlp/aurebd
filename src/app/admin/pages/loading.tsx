import styles from "../admin.module.css";

export default function PagesLoading() {
  return (
    <div className={styles.loadingSkeleton}>
      <div className={styles.skeletonHeader}>
        <div>
          <div className={styles.skeletonLine} style={{ width: "180px", height: "32px", marginBottom: "8px" }} />
          <div className={styles.skeletonLine} style={{ width: "240px", height: "16px" }} />
        </div>
        <div className={styles.skeletonLine} style={{ width: "180px", height: "42px", borderRadius: "10px" }} />
      </div>
      {/* Tabs skeleton */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.skeletonLine} style={{ flex: 1, height: "44px", borderRadius: "10px" }} />
        ))}
      </div>
      {/* Content sections skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className={styles.skeletonCard} style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div className={styles.skeletonLine} style={{ width: "160px", height: "20px", marginBottom: "1.5rem" }} />
          {[1, 2, 3].map((j) => (
            <div key={j} style={{ marginBottom: "1rem" }}>
              <div className={styles.skeletonLine} style={{ width: "100px", height: "14px", marginBottom: "6px" }} />
              <div className={styles.skeletonLine} style={{ width: "100%", height: "40px", borderRadius: "8px" }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
