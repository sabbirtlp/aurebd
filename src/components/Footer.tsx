import Image from "next/image";
import Link from "next/link";
import styles from "@/app/page.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerGrid}`}>
        <div className={styles.footerCol}>
          <Image src="/images/logo-cropped.png" alt="Aurea BD" width={120} height={34} style={{ marginBottom: "var(--sp-3)" }} />
          <p>Your premium destination for authentic Japanese skincare in Bangladesh. Elevate your beauty routine with nature's finest ingredients.</p>
        </div>
        <div className={styles.footerCol}>
          <h4>Explore</h4>
          <ul>
            <li><Link href="/shop">New Arrivals</Link></li>
            <li><Link href="/shop">Best Sellers</Link></li>
            <li><Link href="/about">Our Story</Link></li>
            <li><Link href="/contact">Beauty Blog</Link></li>
          </ul>
        </div>
        <div className={styles.footerCol}>
          <h4>Support</h4>
          <ul>
            <li><Link href="/contact">Shipping Policy</Link></li>
            <li><Link href="/contact">Returns & Refunds</Link></li>
            <li><Link href="/contact">Contact Us</Link></li>
            <li><Link href="/contact">FAQ</Link></li>
          </ul>
        </div>
        <div className={styles.footerCol}>
          <h4>Connect</h4>
          <div style={{ display: "flex", gap: "var(--sp-2)", marginTop: "var(--sp-2)" }}>
            <button className="btn-nm" style={{ width: "40px", height: "40px", padding: 0 }} aria-label="Facebook"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></button>
            <button className="btn-nm" style={{ width: "40px", height: "40px", padding: 0 }} aria-label="Instagram"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></button>
          </div>
          <button className="btn-nm" style={{ marginTop: "var(--sp-4)", backgroundColor: "#25D366", color: "white", border: "none" }}>WhatsApp Chat</button>
        </div>
      </div>
      <div className={`container ${styles.footerBottom}`}>
        <p>&copy; {new Date().getFullYear()} Aurea BD. Designed for Radiance.</p>
        <div style={{ display: "flex", gap: "var(--sp-4)" }}>
          <Link href="#">Privacy Policy</Link>
          <Link href="#">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
