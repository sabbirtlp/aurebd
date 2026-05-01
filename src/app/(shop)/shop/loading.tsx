import styles from "./shop.module.css";

export default function ShopLoading() {
  return (
    <div className={styles.shopPage}>
      <div className="container">
        <header className={styles.sectionHeader}>
          <div className={styles.skeletonHeader} />
          <div className={styles.skeletonSub} />
        </header>

        <div className={styles.shopLayout}>
          <div className={styles.skeletonFilter} />
          
          <div className={styles.productGrid}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={styles.skeletonCard} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
