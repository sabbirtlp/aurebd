import Image from "next/image";
import styles from "./about.module.css";

export default function AboutPage() {
  return (
    <main className="animate-fade-in">
      {/* HERO SECTION */}
      <section className={styles.aboutHero}>
        <div className={styles.heroImage}>
          <Image src="/images/sakura-set.png" alt="About Aurea" fill style={{ objectFit: "cover", opacity: 0.4, filter: "blur(10px) brightness(1.2)" }} />
        </div>
        <div className="container" style={{ position: "relative", zIndex: 10, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <div className={styles.heroContent}>
            <div className={styles.breadcrumb}>
              <a href="/">Home</a> <span>/</span> <span>About Us</span>
            </div>
            <h1>Crafting Radiance</h1>
            <p>Our journey began with a simple belief: that everyone deserves to feel confident in their own skin. We bring you the essence of Japanese beauty, distilled into pure, effective skincare.</p>
          </div>
        </div>
      </section>

      {/* BRAND STORY */}
      <section className="section container">
        <div className={styles.storyGrid}>
          <div className={styles.storyText}>
            <span className={styles.badge}>Our Story</span>
            <h2>Bridging Science and Nature</h2>
            <p>Aurea BD was founded to bridge the gap between traditional Japanese skincare wisdom and modern dermatological science. Every product in our collection is carefully selected for its purity and performance.</p>
            <p>We source our ingredients directly from Japan, ensuring that you receive the authentic Sakura experience in every bottle.</p>
          </div>
          <div className={`${styles.storyImage} nm-card`}>
            <Image src="/images/sakura-set.png" alt="Our Process" width={500} height={500} style={{ objectFit: "contain" }} />
          </div>
        </div>
      </section>

      {/* VALUES SECTION */}
      <section className="section container">
        <h2 className="section-title">Our Core Values</h2>
        <div className={styles.valuesGrid}>
          {[
            { icon: "✨", title: "Purity First", desc: "No harsh chemicals, only skin-loving natural ingredients." },
            { icon: "🌸", title: "Authenticity", desc: "100% genuine Japanese imports, guaranteed." },
            { icon: "🌍", title: "Eco-Conscious", desc: "Sustainable sourcing and minimal waste packaging." },
            { icon: "💝", title: "Self-Care", desc: "Turning your daily routine into a ritual of relaxation." }
          ].map((val, i) => (
            <div key={i} className={`${styles.valueCard} nm-card`}>
              <div className={styles.valueIcon}>{val.icon}</div>
              <h3>{val.title}</h3>
              <p>{val.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
