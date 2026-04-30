"use client";

import { useState } from "react";
import styles from "../admin.module.css";

// Define all editable sections of the website
const PAGE_SECTIONS = [
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
        section: "promo",
        label: "Promotional Banner",
        fields: [
          { key: "tag", label: "Tag", type: "text", placeholder: "e.g. Limited Edition" },
          { key: "title", label: "Promo Title", type: "text", placeholder: "e.g. Sakura 5pcs Skincare Set" },
          { key: "desc", label: "Description", type: "textarea", placeholder: "Promo description..." },
          { key: "cta", label: "Button Text", type: "text", placeholder: "e.g. Shop Now" },
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
    ],
  },
  {
    page: "contact",
    label: "📞 Contact Page",
    sections: [
      {
        section: "info",
        label: "Contact Information",
        fields: [
          { key: "phone", label: "Phone Number", type: "text", placeholder: "+880 1XXX-XXXXXX" },
          { key: "email", label: "Email Address", type: "text", placeholder: "official.aureabd@gmail.com" },
          { key: "address", label: "Address", type: "text", placeholder: "Dhaka, Bangladesh" },
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

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Pages (CMS)</h2>
          <p className={styles.pageSubtitle}>Edit your website content directly</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {/* Language Toggle */}
          <button
            className={activeLang === "en" ? styles.btnPrimary : styles.btnSecondary}
            onClick={() => setActiveLang("en")}
            style={{ fontSize: "0.8rem", padding: "0.4rem 0.9rem" }}
          >
            🇬🇧 English
          </button>
          <button
            className={activeLang === "bn" ? styles.btnPrimary : styles.btnSecondary}
            onClick={() => setActiveLang("bn")}
            style={{ fontSize: "0.8rem", padding: "0.4rem 0.9rem" }}
          >
            🇧🇩 বাংলা
          </button>

          <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : saved ? "✓ Saved!" : "💾 Save All Changes"}
          </button>
        </div>
      </div>

      {PAGE_SECTIONS.map((pageGroup) => (
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
