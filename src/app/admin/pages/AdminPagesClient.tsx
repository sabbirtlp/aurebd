"use client";

import { useState } from "react";
import styles from "../admin.module.css";

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
    label: "🏠 Home Page",
    sections: [
      {
        section: "hero",
        label: "Hero Section",
        fields: [
          { key: "badge", label: "Badge Text", type: "text", placeholder: "e.g. New Collection 2026" },
          { key: "title", label: "Main Title", type: "text", placeholder: "e.g. Discover Your" },
          { key: "title_span", label: "Title Italic Part", type: "text", placeholder: "e.g. Natural Glow" },
          { key: "subtitle", label: "Subtitle", type: "textarea", placeholder: "Hero description text..." },
        ],
      },
      {
        section: "trust",
        label: "Trust Badges",
        fields: [
          { key: "pure_title", label: "Purity Title", type: "text" },
          { key: "pure_desc", label: "Purity Description", type: "textarea" },
          { key: "hydration_title", label: "Hydration Title", type: "text" },
          { key: "hydration_desc", label: "Hydration Description", type: "textarea" },
          { key: "cruelty_title", label: "Cruelty Free Title", type: "text" },
          { key: "cruelty_desc", label: "Cruelty Free Description", type: "textarea" },
          { key: "shipping_title", label: "Shipping Title", type: "text" },
          { key: "shipping_desc", label: "Shipping Description", type: "textarea" },
        ],
      },
      {
        section: "categories",
        label: "Category Strip",
        fields: [
          { key: "title", label: "Section Title", type: "text" },
          { key: "subtitle", label: "Section Subtitle", type: "text" },
          { key: "serums", label: "Serums Label", type: "text" },
          { key: "creams", label: "Creams Label", type: "text" },
          { key: "uv", label: "UV Label", type: "text" },
          { key: "essentials", label: "Essentials Label", type: "text" },
        ],
      },
      {
        section: "new_arrivals",
        label: "New Arrivals Section",
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "subtitle", label: "Subtitle", type: "text" },
          { key: "view_all", label: "Button Text", type: "text" },
        ],
      },
      {
        section: "promo",
        label: "Promotional Banner",
        fields: [
          { key: "tag", label: "Tag", type: "text", placeholder: "e.g. Limited Edition" },
          { key: "title", label: "Promo Title", type: "text", placeholder: "e.g. Sakura 5pcs Skincare Set" },
          { key: "desc", label: "Description", type: "textarea", placeholder: "Promo description..." },
          { key: "cta", label: "Button Text", type: "text", placeholder: "e.g. Shop Now" },
        ],
      },
      {
        section: "best_sellers",
        label: "Best Sellers Section",
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "subtitle", label: "Subtitle", type: "text" },
        ],
      },
    ],
  },
  {
    page: "about",
    label: "📖 About Page",
    sections: [
      {
        section: "hero",
        label: "About Hero",
        fields: [
          { key: "title", label: "Page Title", type: "text", placeholder: "e.g. Crafting Radiance" },
          { key: "description", label: "Page Description", type: "textarea", placeholder: "About us text..." },
        ],
      },
      {
        section: "story",
        label: "Brand Story",
        fields: [
          { key: "title", label: "Story Title", type: "text", placeholder: "e.g. Bridging Science and Nature" },
          { key: "paragraph1", label: "Paragraph 1", type: "textarea", placeholder: "First paragraph..." },
          { key: "paragraph2", label: "Paragraph 2", type: "textarea", placeholder: "Second paragraph..." },
        ],
      },
      {
        section: "values",
        label: "Core Values",
        fields: [
          { key: "title", label: "Values Section Title", type: "text" },
          { key: "v1_title", label: "Value 1 Title", type: "text" },
          { key: "v1_desc", label: "Value 1 Desc", type: "textarea" },
          { key: "v2_title", label: "Value 2 Title", type: "text" },
          { key: "v2_desc", label: "Value 2 Desc", type: "textarea" },
          { key: "v3_title", label: "Value 3 Title", type: "text" },
          { key: "v3_desc", label: "Value 3 Desc", type: "textarea" },
          { key: "v4_title", label: "Value 4 Title", type: "text" },
          { key: "v4_desc", label: "Value 4 Desc", type: "textarea" },
        ],
      },
    ],
  },
  {
    page: "contact",
    label: "📞 Contact Page",
    sections: [
      {
        section: "hero",
        label: "Contact Hero",
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "subtitle", label: "Subtitle", type: "text" },
        ],
      },
      {
        section: "form",
        label: "Contact Form",
        fields: [
          { key: "title", label: "Form Title", type: "text" },
        ],
      },
      {
        section: "info",
        label: "Contact Information",
        fields: [
          { key: "phone", label: "Phone Number", type: "text", placeholder: "+880 1XXX-XXXXXX" },
          { key: "email", label: "Email Address", type: "text", placeholder: "official.aureabd@gmail.com" },
          { key: "address", label: "Address", type: "text", placeholder: "Dhaka, Bangladesh" },
        ],
      },
      {
        section: "social",
        label: "Social Section",
        fields: [
          { key: "title", label: "Social Title", type: "text" },
        ],
      },
    ],
  },
  {
    page: "footer",
    label: "🦶 Footer",
    sections: [
      {
        section: "general",
        label: "Footer Content",
        fields: [
          { key: "description", label: "Footer Description", type: "textarea", placeholder: "Brand footer text..." },
          { key: "newsletter_text", label: "Newsletter Text", type: "text", placeholder: "Subscribe for updates..." },
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
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {/* Language Toggle */}
          <div style={{ display: "flex", gap: "4px", background: "#f0f0f0", padding: "4px", borderRadius: "8px", marginRight: "1rem" }}>
            <button
              className={activeLang === "en" ? styles.btnPrimary : ""}
              onClick={() => setActiveLang("en")}
              style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem", border: "none", borderRadius: "6px", cursor: "pointer", background: activeLang === "en" ? "var(--primary)" : "transparent", color: activeLang === "en" ? "white" : "#666" }}
            >
              EN
            </button>
            <button
              className={activeLang === "bn" ? styles.btnPrimary : ""}
              onClick={() => setActiveLang("bn")}
              style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem", border: "none", borderRadius: "6px", cursor: "pointer", background: activeLang === "bn" ? "var(--primary)" : "transparent", color: activeLang === "bn" ? "white" : "#666" }}
            >
              BN
            </button>
          </div>

          <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : saved ? "✓ Saved!" : "💾 Save All Changes"}
          </button>
        </div>
      </div>

      {/* Page Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "2rem", borderBottom: "1px solid #eee", paddingBottom: "10px", overflowX: "auto" }}>
        {PAGE_SECTIONS.map(p => (
          <button
            key={p.page}
            onClick={() => setSelectedPage(p.page)}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid",
              borderColor: selectedPage === p.page ? "var(--primary)" : "#ddd",
              background: selectedPage === p.page ? "var(--primary)" : "white",
              color: selectedPage === p.page ? "white" : "#666",
              cursor: "pointer",
              fontWeight: 600,
              whiteSpace: "nowrap",
              transition: "all 0.2s"
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {filteredPages.map((pageGroup) => (
        <div key={pageGroup.page} style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1a1a2e", marginBottom: "0.75rem" }}>
            {pageGroup.label}
          </h3>

          {pageGroup.sections.map((sec) => (
            <div key={sec.section} className={styles.contentSection}>
              <div className={styles.contentSectionHeader}>
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
                        rows={3}
                        placeholder={field.placeholder}
                        style={{ resize: "vertical" }}
                      />
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
