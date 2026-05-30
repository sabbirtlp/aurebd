import styles from "../admin.module.css";

export default function ReviewImagesLoading() {
  return (
    <div className={styles.loadingSkeleton}>
      <div className={styles.skeletonHeader}>
        <div>
          <div className={styles.skeletonLine} style={{ width: "180px", height: "32px", marginBottom: "8px" }} />
          <div className={styles.skeletonLine} style={{ width: "260px", height: "16px" }} />
        </div>
        <div className={styles.skeletonLine} style={{ width: "160px", height: "42px", borderRadius: "10px" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "2rem" }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.skeletonCard} style={{ padding: "1.5rem" }}>
            <div className={styles.skeletonLine} style={{ width: "100%", aspectRatio: "1/1", borderRadius: "12px", marginBottom: "1rem" }} />
            <div className={styles.skeletonLine} style={{ width: "60%", height: "14px", marginBottom: "8px" }} />
            <div className={styles.skeletonLine} style={{ width: "40%", height: "14px" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
