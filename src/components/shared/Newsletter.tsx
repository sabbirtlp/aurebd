"use client";

import styles from "./newsletter.module.css";

export default function Newsletter() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for subscribing! We will keep you updated.');
  };

  return (
    <section className={styles.newsletterSection}>
      <div className="container">
        <div className={styles.newsletterCard}>
          <div className={styles.contentWrapper}>
            <h2 className={styles.title}>Join Our Inner Circle</h2>
            <p className={styles.subtitle}>
              Subscribe to receive exclusive access to new arrivals, personalized skincare advice, and member-only privileges.
            </p>
            <form className={styles.form} onSubmit={handleSubmit}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                required 
                className={styles.input}
              />
              <button type="submit" className={styles.button}>Subscribe</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
