"use client";

import { useState } from "react";
import styles from "./contact.module.css";
import { toast } from "react-toastify";

import Editable from "@/components/cms/Editable";
import { useLanguageStore } from "@/store/languageStore";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { t } = useLanguageStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("https://formsubmit.co/ajax/official.aureabd@gmail.com", {
        method: "POST",
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      });

      if (response.ok) {
        setSuccess(true);
        form.reset();
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="animate-fade-in">
      <section className="section container">
        <div className={styles.header}>
          <h1><Editable page="contact" section="hero" field="title" defaultText="Get in Touch" /></h1>
          <p><Editable page="contact" section="hero" field="subtitle" defaultText="Have questions about our products or your order? We're here to help." /></p>
        </div>

        <div className={styles.contactGrid}>
          {/* CONTACT FORM */}
          <div className={`${styles.formCard} nm-card`}>
            <h2 className={styles.cardTitle}><Editable page="contact" section="form" field="title" defaultText="Send us a Message" /></h2>
            {success ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-dark)" }} className="animate-fade-in">
                <div style={{ width: "80px", height: "80px", background: "var(--bg-color)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", boxShadow: "var(--nm-outer-raised-sm)", color: "var(--primary)" }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem", color: "var(--primary)" }}>{t('contact.success_title')}</h3>
                <p style={{ color: "var(--text-light)", marginBottom: "2rem" }}>{t('contact.success_text')}</p>
                <button className="btn-nm btn-nm-primary" onClick={() => setSuccess(false)}>
                  {t('contact.send_another')}
                </button>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_subject" value="Aureabd Contact Form - New Message!" />
                
                <div className={styles.inputField}>
                  <label>{t('contact.your_name')}</label>
                  <input type="text" name="name" placeholder={t('contact.full_name')} className={styles.nmInput} required disabled={loading} />
                </div>
                <div className={styles.inputField}>
                  <label>{t('contact.email')}</label>
                  <input type="email" name="email" placeholder="email@example.com" className={styles.nmInput} required disabled={loading} />
                </div>
                <div className={styles.inputField}>
                  <label>{t('contact.message')}</label>
                  <textarea name="message" placeholder={t('contact.message_placeholder')} rows={6} className={styles.nmInput} required disabled={loading}></textarea>
                </div>
                <button type="submit" className="btn-nm btn-nm-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
                  {loading ? t('contact.sending') : t('contact.send_btn')}
                </button>
              </form>
            )}
          </div>

          {/* CONTACT INFO */}
          <div className={styles.infoWrapper}>
            <div className={`${styles.infoCard} nm-card`}>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>📞</span>
                <div>
                  <h4>{t('contact.phone')}</h4>
                  <p><Editable page="contact" section="info" field="phone" defaultText="+880 1XXX-XXXXXX" /></p>
                </div>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>✉️</span>
                <div>
                  <h4>{t('contact.email_label')}</h4>
                  <p><Editable page="contact" section="info" field="email" defaultText="official.aureabd@gmail.com" /></p>
                </div>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>📍</span>
                <div>
                  <h4>{t('contact.address')}</h4>
                  <p><Editable page="contact" section="info" field="address" defaultText="Dhaka, Bangladesh" /></p>
                </div>
              </div>
            </div>

            <div className={`${styles.socialCard} nm-card`}>
              <h4><Editable page="contact" section="social" field="title" defaultText="Follow Our Glow" /></h4>
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
