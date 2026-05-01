import styles from "./about.module.css";

export default function AboutLoading() {
  return (
    <main className="animate-fade-in">
      {/* Hero skeleton */}
      <section className={styles.aboutHero}>
        <div className="container" style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <div className={styles.heroContent}>
            <div style={{ width: "140px", height: "16px", borderRadius: "8px", background: "var(--border)", opacity: 0.4, marginBottom: "16px" }} />
            <div style={{ width: "60%", height: "40px", borderRadius: "10px", background: "var(--border)", opacity: 0.5, marginBottom: "16px" }} />
            <div style={{ width: "80%", height: "18px", borderRadius: "6px", background: "var(--border)", opacity: 0.3, marginBottom: "8px" }} />
            <div style={{ width: "70%", height: "18px", borderRadius: "6px", background: "var(--border)", opacity: 0.3 }} />
          </div>
        </div>
      </section>

      {/* Story skeleton */}
      <section className="section container">
        <div className={styles.storyGrid}>
          <div className={styles.storyText}>
            <div style={{ width: "80px", height: "24px", borderRadius: "20px", background: "var(--border)", opacity: 0.4, marginBottom: "16px" }} />
            <div style={{ width: "70%", height: "30px", borderRadius: "8px", background: "var(--border)", opacity: 0.5, marginBottom: "16px" }} />
            <div style={{ width: "100%", height: "14px", borderRadius: "4px", background: "var(--border)", opacity: 0.3, marginBottom: "8px" }} />
            <div style={{ width: "90%", height: "14px", borderRadius: "4px", background: "var(--border)", opacity: 0.3, marginBottom: "8px" }} />
            <div style={{ width: "60%", height: "14px", borderRadius: "4px", background: "var(--border)", opacity: 0.3 }} />
          </div>
          <div className={styles.storyImageWrapper}>
            <div style={{ width: "100%", height: "100%", borderRadius: "24px", background: "var(--border)", opacity: 0.3, minHeight: "350px" }} />
          </div>
        </div>
      </section>

      {/* Values skeleton */}
      <section className={`${styles.valuesSection} container`}>
        <div style={{ width: "200px", height: "30px", borderRadius: "8px", background: "var(--border)", opacity: 0.5, margin: "0 auto 2rem" }} />
        <div className={styles.valuesGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="nm-card" style={{ padding: "2rem", borderRadius: "20px" }}>
              <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "var(--border)", opacity: 0.3, margin: "0 auto 16px" }} />
              <div style={{ width: "60%", height: "20px", borderRadius: "6px", background: "var(--border)", opacity: 0.4, margin: "0 auto 10px" }} />
              <div style={{ width: "80%", height: "14px", borderRadius: "4px", background: "var(--border)", opacity: 0.3, margin: "0 auto" }} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
