import styles from "./contact.module.css";

export default function ContactPage() {
  return (
    <main className="animate-fade-in">
      <section className="section container">
        <div className={styles.header}>
          <h1>Get in Touch</h1>
          <p>Have questions about our products or your order? We&apos;re here to help.</p>
        </div>

        <div className={styles.contactGrid}>
          {/* CONTACT FORM */}
          <div className={`${styles.formCard} nm-card`}>
            <h2 className={styles.cardTitle}>Send us a Message</h2>
            <form className={styles.form} action="https://formsubmit.co/official.aureabd@gmail.com" method="POST">
              <input type="hidden" name="_captcha" value="false" />
              {/* Note: Change _next URL to your deployed domain if you want it to redirect back automatically */}
              <input type="hidden" name="_next" value="https://aurea-bd.vercel.app/contact" />
              
              <div className={styles.inputField}>
                <label>Your Name</label>
                <input type="text" name="name" placeholder="Full Name" className={styles.nmInput} required />
              </div>
              <div className={styles.inputField}>
                <label>Email Address</label>
                <input type="email" name="email" placeholder="email@example.com" className={styles.nmInput} required />
              </div>
              <div className={styles.inputField}>
                <label>Message</label>
                <textarea name="message" placeholder="How can we help you?" rows={6} className={styles.nmInput} required></textarea>
              </div>
              <button type="submit" className="btn-nm btn-nm-primary" style={{ width: "100%", justifyContent: "center" }}>
                Send Message
              </button>
            </form>
          </div>

          {/* CONTACT INFO */}
          <div className={styles.infoWrapper}>
            <div className={`${styles.infoCard} nm-card`}>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>📞</span>
                <div>
                  <h4>Phone</h4>
                  <p>+880 1XXX-XXXXXX</p>
                </div>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>✉️</span>
                <div>
                  <h4>Email</h4>
                  <p>official.aureabd@gmail.com</p>
                </div>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>📍</span>
                <div>
                  <h4>Address</h4>
                  <p>Dhaka, Bangladesh</p>
                </div>
              </div>
            </div>

            <div className={`${styles.socialCard} nm-card`}>
              <h4>Follow Our Glow</h4>
              <div className={styles.socialIcons}>
                <button className={styles.socialBtn}>FB</button>
                <button className={styles.socialBtn}>IG</button>
                <button className={styles.socialBtn}>WA</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
