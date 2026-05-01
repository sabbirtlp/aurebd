import styles from "./contact.module.css";

export default function ContactLoading() {
  return (
    <main className="animate-fade-in">
      <section className="section container">
        <div className={styles.header}>
          <div style={{ width: "200px", height: "36px", borderRadius: "10px", background: "var(--border)", opacity: 0.5, margin: "0 auto 12px" }} />
          <div style={{ width: "60%", height: "18px", borderRadius: "6px", background: "var(--border)", opacity: 0.3, margin: "0 auto" }} />
        </div>

        <div className={styles.contactGrid}>
          {/* Form card skeleton */}
          <div className="nm-card" style={{ padding: "2rem", borderRadius: "20px" }}>
            <div style={{ width: "180px", height: "24px", borderRadius: "8px", background: "var(--border)", opacity: 0.5, marginBottom: "24px" }} />
            {[1, 2].map((i) => (
              <div key={i} style={{ marginBottom: "20px" }}>
                <div style={{ width: "90px", height: "14px", borderRadius: "4px", background: "var(--border)", opacity: 0.3, marginBottom: "8px" }} />
                <div style={{ width: "100%", height: "48px", borderRadius: "12px", background: "var(--border)", opacity: 0.25 }} />
              </div>
            ))}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ width: "70px", height: "14px", borderRadius: "4px", background: "var(--border)", opacity: 0.3, marginBottom: "8px" }} />
              <div style={{ width: "100%", height: "140px", borderRadius: "12px", background: "var(--border)", opacity: 0.25 }} />
            </div>
            <div style={{ width: "100%", height: "52px", borderRadius: "14px", background: "var(--border)", opacity: 0.4 }} />
          </div>

          {/* Info card skeleton */}
          <div className={styles.infoWrapper}>
            <div className="nm-card" style={{ padding: "2rem", borderRadius: "20px" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: i < 3 ? "20px" : 0 }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--border)", opacity: 0.3, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ width: "60px", height: "14px", borderRadius: "4px", background: "var(--border)", opacity: 0.4, marginBottom: "6px" }} />
                    <div style={{ width: "140px", height: "14px", borderRadius: "4px", background: "var(--border)", opacity: 0.3 }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="nm-card" style={{ padding: "2rem", borderRadius: "20px", marginTop: "1.5rem" }}>
              <div style={{ width: "140px", height: "20px", borderRadius: "6px", background: "var(--border)", opacity: 0.4, marginBottom: "16px" }} />
              <div style={{ display: "flex", gap: "12px" }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ width: "44px", height: "44px", borderRadius: "12px", background: "var(--border)", opacity: 0.3 }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
