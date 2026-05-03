"use client";

import { useState } from "react";
import { Sparkles, Loader2, Wand2 } from "lucide-react";
import { toast } from "react-toastify";

interface AIAssistantProps {
  productName: string;
  category?: string;
  field: string;
  existingContent?: string;
  language?: string;
  onGenerate: (text: string) => void;
}

export default function AIAssistant({ productName, category, field, existingContent, language: initialLanguage = "en", onGenerate }: AIAssistantProps) {
  const [loading, setLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedLang, setSelectedLang] = useState<string>(initialLanguage);

  const generateContent = async () => {
    if (!productName) {
      toast.warn("Please enter a product name first");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: productName,
          category: category || "Skincare",
          features: "Luxury, Organic, Effective",
          field,
          customPrompt,
          existingContent,
          language: selectedLang
        })
      });

      const data = await res.json();
      if (res.ok) {
        onGenerate(data.text);
        toast.success(`AI ${field} generated in ${selectedLang === 'bn' ? 'Bangla' : 'English'}!`);
      } else {
        toast.error(data.message || "Failed to generate content");
      }
    } catch (error) {
      toast.error("AI Assistant is currently unavailable");
    } finally {
      setLoading(false);
    }
  };

  const fieldLabels: Record<string, string> = {
    description: "description",
    ingredients: "ingredients",
    howToUse: "usage guide"
  };

  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 6px 6px 14px',
        borderRadius: '12px',
        background: 'var(--bg-color)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--nm-inner-pressed-sm)',
        transition: 'all 0.3s ease',
      }}>
        {/* Language Selection Toggle */}
        <div style={{
          display: 'flex',
          gap: '2px',
          padding: '2px',
          background: 'var(--bg-color)',
          borderRadius: '8px',
          boxShadow: 'var(--nm-inner-pressed-sm)',
          marginRight: '8px',
          borderRight: '1px solid var(--border)',
          paddingRight: '8px'
        }}>
          <button
            type="button"
            onClick={() => setSelectedLang("en")}
            style={{
              padding: '4px 8px',
              fontSize: '0.65rem',
              fontWeight: 800,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: selectedLang === "en" ? 'var(--primary)' : 'transparent',
              color: selectedLang === "en" ? 'white' : 'var(--text-light)',
              transition: 'all 0.2s ease'
            }}
          >EN</button>
          <button
            type="button"
            onClick={() => setSelectedLang("bn")}
            style={{
              padding: '4px 8px',
              fontSize: '0.65rem',
              fontWeight: 800,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: selectedLang === "bn" ? 'var(--primary)' : 'transparent',
              color: selectedLang === "bn" ? 'white' : 'var(--text-light)',
              transition: 'all 0.2s ease'
            }}
          >BN</button>
        </div>

        {/* AI Icon */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          paddingRight: '10px',
          flexShrink: 0,
        }}>
          <Sparkles style={{ width: '14px', height: '14px', color: 'var(--primary)' }} />
          <span style={{
            fontSize: '0.6rem',
            fontWeight: 800,
            textTransform: 'uppercase' as const,
            letterSpacing: '1.5px',
            color: 'var(--primary)',
          }}>AI</span>
        </div>

        {/* Input */}
        <input
          type="text"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder={`Custom instructions for ${fieldLabels[field] || field}...`}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            padding: '8px 0',
            fontSize: '0.82rem',
            color: 'var(--text-dark)',
            fontWeight: 500,
            minWidth: 0,
          }}
        />

        {/* Generate Button */}
        <button
          type="button"
          onClick={generateContent}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            fontSize: '0.65rem',
            fontWeight: 800,
            textTransform: 'uppercase' as const,
            letterSpacing: '1px',
            color: 'white',
            background: loading ? 'var(--text-light)' : 'var(--primary)',
            borderRadius: '8px',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: 'var(--nm-outer-raised-sm)',
            flexShrink: 0,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <Loader2 style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} />
          ) : (
            <Wand2 style={{ width: '12px', height: '12px' }} />
          )}
          {loading ? "Writing..." : "Generate"}
        </button>
      </div>

      {/* Status Line */}
      <div style={{
        marginTop: '6px',
        paddingLeft: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        opacity: 0.35,
      }}>
        <div style={{
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          background: loading ? '#4ade80' : 'var(--primary)',
          animation: loading ? 'pulse 1.5s infinite' : 'none',
        }}></div>
        <span style={{
          fontSize: '0.6rem',
          fontWeight: 700,
          textTransform: 'uppercase' as const,
          letterSpacing: '1px',
          color: 'var(--text-light)',
        }}>
          {loading ? 'Generating content...' : 'Aurea AI • Ready'}
        </span>
      </div>
    </div>
  );
}
