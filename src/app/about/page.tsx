"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./about.module.css";
import { useLanguageStore } from "@/store/languageStore";
import { useState, useEffect } from "react";

import Editable from "@/components/cms/Editable";

export default function AboutPage() {
  const { t, language } = useLanguageStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tr = (key: string) => mounted ? t(key) : key;

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
              <Link href="/">{tr('nav.home')}</Link> <span>/</span> <span>{tr('nav.about')}</span>
            </div>
            <h1><Editable page="about" section="hero" field="title" defaultText={language === 'bn' ? 'সৌন্দর্যের কারিগর' : 'Crafting Radiance'} /></h1>
            <p>
              <Editable 
                page="about" 
                section="hero" 
                field="description" 
                defaultText={language === 'bn' 
                  ? 'আমাদের যাত্রা শুরু হয়েছিল একটি সহজ বিশ্বাস থেকে: যে প্রত্যেকের নিজের ত্বকে আত্মবিশ্বাসী বোধ করার অধিকার রয়েছে। আমরা আপনার জন্য নিয়ে এসেছি জাপানি সৌন্দর্যের নির্যাস।' 
                  : 'Our journey began with a simple belief: that everyone deserves to feel confident in their own skin. We bring you the essence of Japanese beauty, distilled into pure, effective skincare.'} 
                multiline 
              />
            </p>
          </div>
        </div>
      </section>

      {/* BRAND STORY */}
      <section className="section container">
        <div className={styles.storyGrid}>
          <div className={styles.storyText}>
            <span className={styles.badge}>{tr('nav.about')}</span>
            <h2><Editable page="about" section="story" field="title" defaultText={language === 'bn' ? 'বিজ্ঞান এবং প্রকৃতির মেলবন্ধন' : 'Bridging Science and Nature'} /></h2>
            <p>
              <Editable 
                page="about" 
                section="story" 
                field="paragraph1" 
                defaultText={language === 'bn'
                  ? 'ঐতিহ্যবাহী জাপানিজ স্কিনকেয়ার জ্ঞান এবং আধুনিক চর্মরোগ বিজ্ঞানের মধ্যে যোগসূত্র স্থাপন করার জন্য অরিয়া বিডি প্রতিষ্ঠিত হয়েছিল। আমাদের প্রতিটি পণ্য বিশুদ্ধতা এবং কার্যকারিতার জন্য যত্ন সহকারে নির্বাচন করা হয়।'
                  : 'Aurea BD was founded to bridge the gap between traditional Japanese skincare wisdom and modern dermatological science. Every product in our collection is carefully selected for its purity and performance.'} 
                multiline 
              />
            </p>
            <p>
              <Editable 
                page="about" 
                section="story" 
                field="paragraph2" 
                defaultText={language === 'bn'
                  ? 'আমরা সরাসরি জাপান থেকে আমাদের উপাদানগুলো সংগ্রহ করি, যাতে আপনি প্রতিটি বোতলে আসল সাকুরা অভিজ্ঞতা পান।'
                  : 'We source our ingredients directly from Japan, ensuring that you receive the authentic Sakura experience in every bottle.'} 
                multiline 
              />
            </p>
          </div>
          <div className={`${styles.storyImage} nm-card`}>
            <Image src="/images/sakura-set.png" alt="Our Process" width={500} height={500} style={{ objectFit: "contain" }} />
          </div>
        </div>
      </section>

      {/* VALUES SECTION */}
      <section className="section container">
        <h2 className="section-title"><Editable page="about" section="values" field="title" defaultText={language === 'bn' ? 'আমাদের মূল আদর্শ' : 'Our Core Values'} /></h2>
        <div className={styles.valuesGrid}>
          <div className={`${styles.valueCard} nm-card`}>
            <div className={styles.valueIcon}>✨</div>
            <h3><Editable page="about" section="values" field="v1_title" defaultText={language === 'bn' ? "বিশুদ্ধতা প্রথম" : "Purity First"} /></h3>
            <p><Editable page="about" section="values" field="v1_desc" defaultText={language === 'bn' ? "কোনো ক্ষতিকারক রাসায়নিক নেই, শুধুমাত্র ত্বকের জন্য উপকারী প্রাকৃতিক উপাদান।" : "No harsh chemicals, only skin-loving natural ingredients."} multiline /></p>
          </div>
          <div className={`${styles.valueCard} nm-card`}>
            <div className={styles.valueIcon}>🌸</div>
            <h3><Editable page="about" section="values" field="v2_title" defaultText={language === 'bn' ? "নির্ভরযোগ্যতা" : "Authenticity"} /></h3>
            <p><Editable page="about" section="values" field="v2_desc" defaultText={language === 'bn' ? "১০০% খাঁটি জাপানিজ আমদানিকৃত পণ্যের নিশ্চয়তা।" : "100% genuine Japanese imports, guaranteed."} multiline /></p>
          </div>
          <div className={`${styles.valueCard} nm-card`}>
            <div className={styles.valueIcon}>🌍</div>
            <h3><Editable page="about" section="values" field="v3_title" defaultText={language === 'bn' ? "পরিবেশ বান্ধব" : "Eco-Conscious"} /></h3>
            <p><Editable page="about" section="values" field="v3_desc" defaultText={language === 'bn' ? "টেকসই উৎস এবং পরিবেশের ক্ষতি না করে এমন প্যাকেজিং।" : "Sustainable sourcing and minimal waste packaging."} multiline /></p>
          </div>
          <div className={`${styles.valueCard} nm-card`}>
            <div className={styles.valueIcon}>💝</div>
            <h3><Editable page="about" section="values" field="v4_title" defaultText={language === 'bn' ? "স্ব-যত্ন" : "Self-Care"} /></h3>
            <p><Editable page="about" section="values" field="v4_desc" defaultText={language === 'bn' ? "আপনার প্রতিদিনের রূপচর্চাকে একটি আরামদায়ক অভ্যাসে পরিণত করা।" : "Turning your daily routine into a ritual of relaxation."} multiline /></p>
          </div>
        </div>
      </section>
    </main>
  );
}
