"use client";

import styles from "@/app/page.module.css";

export default function Newsletter() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for subscribing! We will keep you updated.');
  };

  return (
    <section className={styles.sectionNewsletter}>
      <div className="container">
        <div className={styles.newsletterCard}>
          <h2 style={{ fontSize: "2.5rem", marginBottom: "var(--sp-2)" }}>Join the Glow Club</h2>
          <p>Subscribe to receive skincare tips, personalized offers, and exclusive access to new arrivals.</p>
          <form className={styles.newsletterForm} onSubmit={handleSubmit}>
            <input type="email" placeholder="Enter your email" required />
            <button type="submit" className="btn-nm btn-nm-primary">Subscribe</button>
          </form>
        </div>
      </div>
    </section>
  );
}
