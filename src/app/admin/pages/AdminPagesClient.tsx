"use client";

import { useState } from "react";
import { 
  Save, 
  Home, 
  BookOpen, 
  Mail, 
  Layout, 
  Globe, 
  CheckCircle,
  FileText
} from "lucide-react";
import styles from "../admin.module.css";
import ImageUpload from "@/components/admin/ImageUpload";

// Define types for CMS sections
interface Field {
  key: string;
  label: string;
  type: string;
  placeholder?: string;
}

interface Section {
  section: string;
  label: string;
  fields: Field[];
}

interface PageGroup {
  page: string;
  label: string;
  sections: Section[];
}

// Define all editable sections of the website
const PAGE_SECTIONS: PageGroup[] = [
  {
    page: "home",
    label: "Home Page",
    sections: [
      {
        section: "hero",
        label: "Hero Section",
        fields: [
          { key: "badge", label: "Badge Text", type: "text", placeholder: "e.g. New Collection 2026" },
          { key: "title", label: "Main Title", type: "text", placeholder: "e.g. Reveal Your" },
          { key: "title_span", label: "Title Italic Part", type: "text", placeholder: "e.g. Radiance" },
          { key: "subtitle", label: "Subtitle", type: "textarea", placeholder: "e.g. Experience the purest essence of Japanese skincare..." },
          { key: "card_icon", label: "Floating Card Icon", type: "text", placeholder: "e.g. 🌸" },
          { key: "card_title", label: "Floating Card Title", type: "text", placeholder: "e.g. Sakura Essence" },
          { key: "card_price", label: "Floating Card Price", type: "text", placeholder: "e.g. ৳ ১২৫০" },
          { key: "image", label: "Hero Main Image", type: "image" },
        ],
      },
      {
        section: "trust",
        label: "Trust Badges",
        fields: [
          { key: "pure_title", label: "Purity Title", type: "text", placeholder: "e.g. 100% Pure" },
          { key: "pure_desc", label: "Purity Description", type: "textarea", placeholder: "e.g. Authentic Japanese ingredients." },
          { key: "hydration_title", label: "Hydration Title", type: "text", placeholder: "e.g. Deep Hydration" },
          { key: "hydration_desc", label: "Hydration Description", type: "textarea", placeholder: "e.g. Locks in moisture for 24h." },
          { key: "cruelty_title", label: "Cruelty Free Title", type: "text", placeholder: "e.g. Cruelty Free" },
          { key: "cruelty_desc", label: "Cruelty Free Description", type: "textarea", placeholder: "e.g. Never tested on animals." },
          { key: "shipping_title", label: "Shipping Title", type: "text", placeholder: "e.g. Fast Shipping" },
          { key: "shipping_desc", label: "Shipping Description", type: "textarea", placeholder: "e.g. Free delivery nationwide." },
        ],
      },
      {
        section: "categories",
        label: "Category Strip",
        fields: [
          { key: "title", label: "Section Title", type: "text", placeholder: "e.g. Curated Collections" },
          { key: "subtitle", label: "Section Subtitle", type: "text", placeholder: "e.g. Discover the perfect regimen..." },
          { key: "serums", label: "Serums Label", type: "text", placeholder: "e.g. Radiance Serums" },
          { key: "serums_img", label: "Serums Image", type: "image" },
          { key: "creams", label: "Creams Label", type: "text", placeholder: "e.g. Hydration Creams" },
          { key: "creams_img", label: "Creams Image", type: "image" },
          { key: "uv", label: "UV Label", type: "text", placeholder: "e.g. UV Protection" },
          { key: "uv_img", label: "UV Image", type: "image" },
          { key: "essentials", label: "Essentials Label", type: "text", placeholder: "e.g. Skin Essentials" },
          { key: "essentials_img", label: "Essentials Image", type: "image" },
        ],
      },
      {
        section: "new_arrivals",
        label: "New Arrivals Section",
        fields: [
          { key: "title", label: "Title", type: "text", placeholder: "e.g. New Arrivals" },
          { key: "subtitle", label: "Subtitle", type: "text", placeholder: "e.g. Experience the latest..." },
          { key: "view_all", label: "Button Text", type: "text", placeholder: "e.g. View All Products" },
        ],
      },
      {
        section: "promo",
        label: "Promotional Banner",
        fields: [
          { key: "tag", label: "Tag", type: "text", placeholder: "e.g. Limited Edition" },
          { key: "title", label: "Promo Title", type: "text", placeholder: "e.g. Sakura 5pcs Skincare Set" },
          { key: "desc", label: "Description", type: "textarea", placeholder: "e.g. Get the complete routine..." },
          { key: "cta", label: "Button Text", type: "text", placeholder: "e.g. Shop Now" },
        ],
      },
      {
        section: "best_sellers",
        label: "Best Sellers Section",
        fields: [
          { key: "title", label: "Title", type: "text", placeholder: "e.g. Best Sellers" },
          { key: "subtitle", label: "Subtitle", type: "text", placeholder: "e.g. Our most loved products." },
        ],
      },
    ],
  },
  {
    page: "about",
    label: "About Page",
    sections: [
      {
        section: "hero",
        label: "About Hero",
        fields: [
          { key: "title", label: "Page Title", type: "text", placeholder: "e.g. Crafting Radiance" },
          { key: "description", label: "Page Description", type: "textarea", placeholder: "e.g. We believe in the power of nature..." },
        ],
      },
      {
        section: "story",
        label: "Brand Story",
        fields: [
          { key: "title", label: "Story Title", type: "text", placeholder: "e.g. Bridging Science and Nature" },
          { key: "paragraph1", label: "Paragraph 1", type: "textarea", placeholder: "e.g. Aurea BD was founded with..." },
          { key: "paragraph2", label: "Paragraph 2", type: "textarea", placeholder: "e.g. Today, we continue to..." },
        ],
      },
      {
        section: "values",
        label: "Core Values",
        fields: [
          { key: "title", label: "Values Section Title", type: "text", placeholder: "e.g. Our Core Values" },
          { key: "v1_title", label: "Value 1 Title", type: "text", placeholder: "e.g. Purity" },
          { key: "v1_desc", label: "Value 1 Desc", type: "textarea", placeholder: "e.g. Only the finest ingredients." },
          { key: "v2_title", label: "Value 2 Title", type: "text", placeholder: "e.g. Efficacy" },
          { key: "v2_desc", label: "Value 2 Desc", type: "textarea", placeholder: "e.g. Proven results you can see." },
          { key: "v3_title", label: "Value 3 Title", type: "text", placeholder: "e.g. Sustainability" },
          { key: "v3_desc", label: "Value 3 Desc", type: "textarea", placeholder: "e.g. Eco-friendly packaging." },
          { key: "v4_title", label: "Value 4 Title", type: "text", placeholder: "e.g. Transparency" },
          { key: "v4_desc", label: "Value 4 Desc", type: "textarea", placeholder: "e.g. Honest about our process." },
        ],
      },
    ],
  },
  {
    page: "contact",
    label: "Contact Page",
    sections: [
      {
        section: "hero",
        label: "Contact Hero",
        fields: [
          { key: "title", label: "Title", type: "text", placeholder: "e.g. Get in Touch" },
          { key: "subtitle", label: "Subtitle", type: "text", placeholder: "e.g. We'd love to hear from you." },
        ],
      },
      {
        section: "form",
        label: "Contact Form",
        fields: [
          { key: "title", label: "Form Title", type: "text", placeholder: "e.g. Send us a message" },
        ],
      },
      {
        section: "info",
        label: "Contact Information",
        fields: [
          { key: "phone", label: "Phone Number", type: "text", placeholder: "e.g. +880 1XXX-XXXXXX" },
          { key: "email", label: "Email Address", type: "text", placeholder: "e.g. official.aureabd@gmail.com" },
          { key: "address", label: "Address", type: "text", placeholder: "e.g. Dhaka, Bangladesh" },
        ],
      },
      {
        section: "social",
        label: "Social Section",
        fields: [
          { key: "title", label: "Social Title", type: "text", placeholder: "e.g. Follow Us" },
        ],
      },
    ],
  },
  {
    page: "footer",
    label: "Footer",
    sections: [
      {
        section: "general",
        label: "Footer Content",
        fields: [
          { key: "description", label: "Footer Description", type: "textarea", placeholder: "e.g. Premium skincare curated for you." },
          { key: "newsletter_text", label: "Newsletter Text", type: "text", placeholder: "e.g. Subscribe to our newsletter..." },
        ],
      },
    ],
  },
];

export default function AdminPagesClient({ initialContent }: { initialContent: any[] }) {
  const [content, setContent] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    initialContent.forEach((item) => {
      const k = `${item.page}__${item.section}__${item.key}__${item.language || "en"}`;
      map[k] = item.value;
    });
    return map;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeLang, setActiveLang] = useState<"en" | "bn">("en");
  const [selectedPage, setSelectedPage] = useState("home");

  const getKey = (page: string, section: string, key: string) => {
    return `${page}__${section}__${key}__${activeLang}`;
  };

  const getValue = (page: string, section: string, key: string) => {
    return content[getKey(page, section, key)] || "";
  };

  const setValue = (page: string, section: string, key: string, value: string) => {
    setContent({ ...content, [getKey(page, section, key)]: value });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    const items = Object.entries(content).map(([compositeKey, value]) => {
      const [page, section, key, language] = compositeKey.split("__");
      return { page, section, key, value, language };
    });

    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert("Failed to save content.");
      }
    } catch (error) {
      alert("An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const filteredPages = PAGE_SECTIONS.filter(p => p.page === selectedPage);

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Pages (CMS)</h2>
          <p className={styles.pageSubtitle}>Edit your website content directly</p>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {/* Professional Language Toggle */}
          <div className={styles.tabGroup} style={{ marginBottom: 0, padding: "4px" }}>
            <button
              type="button"
              className={`${styles.tabItem} ${activeLang === "en" ? styles.tabItemActive : ""}`}
              onClick={() => setActiveLang("en")}
              style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem" }}
            >
              <Globe size={14} /> EN
            </button>
            <button
              type="button"
              className={`${styles.tabItem} ${activeLang === "bn" ? styles.tabItemActive : ""}`}
              onClick={() => setActiveLang("bn")}
              style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem" }}
            >
              <Globe size={14} /> BN
            </button>
          </div>

          <button 
            type="button"
            className={styles.btnPrimary} 
            onClick={handleSave} 
            disabled={saving}
            style={{ minWidth: "180px" }}
          >
            {saving ? "Saving..." : saved ? <><CheckCircle size={18} /> Saved!</> : <><Save size={18} /> Save All Changes</>}
          </button>
        </div>
      </div>

      {/* Premium Page Tabs */}
      <div className={styles.tabGroup} style={{ width: "100%", maxWidth: "none", justifyContent: "flex-start", marginBottom: "2rem" }}>
        {[
          { id: "home", label: "Home Page", icon: <Home size={18} /> },
          { id: "about", label: "About Page", icon: <BookOpen size={18} /> },
          { id: "contact", label: "Contact Page", icon: <Mail size={18} /> },
          { id: "footer", label: "Footer", icon: <Layout size={18} /> },
        ].map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelectedPage(p.id)}
            className={`${styles.tabItem} ${selectedPage === p.id ? styles.tabItemActive : ""}`}
            style={{ flex: 1, justifyContent: "center" }}
          >
            {p.icon} {p.label}
          </button>
        ))}
      </div>

      {filteredPages.map((pageGroup) => (
        <div key={pageGroup.page} className="animate-fade-in">
          {pageGroup.sections.map((sec) => (
            <div key={sec.section} className={styles.contentSection}>
              <div className={styles.contentSectionHeader}>
                <FileText size={18} style={{ color: "var(--primary)" }} />
                <h3>{sec.label}</h3>
              </div>
              <div className={styles.contentSectionBody}>
                {sec.fields.map((field) => (
                  <div key={field.key} className={styles.contentField}>
                    <div className={styles.contentFieldLabel}>{field.label}</div>
                    {field.type === "textarea" ? (
                      <textarea
                        value={getValue(pageGroup.page, sec.section, field.key)}
                        onChange={(e) => setValue(pageGroup.page, sec.section, field.key, e.target.value)}
                        className={styles.formInput}
                        rows={4}
                        placeholder={field.placeholder}
                        style={{ resize: "vertical" }}
                      />
                    ) : field.type === "image" ? (
                      <div style={{ marginTop: "0.5rem" }}>
                        <ImageUpload
                          label={""}
                          images={getValue(pageGroup.page, sec.section, field.key) ? [getValue(pageGroup.page, sec.section, field.key)] : []}
                          onChange={(images) => setValue(pageGroup.page, sec.section, field.key, images[0] || "")}
                          maxImages={1}
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={getValue(pageGroup.page, sec.section, field.key)}
                        onChange={(e) => setValue(pageGroup.page, sec.section, field.key, e.target.value)}
                        className={styles.formInput}
                        placeholder={field.placeholder}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
