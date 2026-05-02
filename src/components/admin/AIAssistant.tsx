"use client";

import { useState } from "react";
import { Sparkles, Loader2, Wand2 } from "lucide-react";
import { toast } from "react-toastify";

interface AIAssistantProps {
  productName: string;
  category: string;
  field: "description" | "ingredients" | "howToUse";
  onGenerate: (text: string) => void;
}

export default function AIAssistant({ productName, category, field, onGenerate }: AIAssistantProps) {
  const [loading, setLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

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
          customPrompt
        })
      });

      const data = await res.json();
      if (res.ok) {
        onGenerate(data.text);
        toast.success(`AI ${field} generated!`);
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
    description: "Description",
    ingredients: "Ingredients",
    howToUse: "Usage Guide"
  };

  return (
    <div className="flex flex-col gap-3 mb-8 w-full animate-fade-in">
      <div className="flex items-center gap-3 w-full">
        {/* Refined NM Inset Prompt Field */}
        <div className="relative flex-1 group">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder={`Custom instructions (e.g. "Focus on luxury", "Tone: Scientific")`}
            className="w-full pl-4 pr-10 py-3 text-sm transition-all outline-none"
            style={{ 
              background: 'var(--bg-color)', 
              color: 'var(--text-dark)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              boxShadow: 'var(--nm-inner-pressed-sm)',
              fontSize: '0.9rem'
            }}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:opacity-100 transition-opacity">
            <Wand2 className="w-4 h-4" style={{ color: 'var(--primary)' }} />
          </div>
        </div>
        
        {/* NM Primary Button */}
        <button
          type="button"
          onClick={generateContent}
          disabled={loading}
          className="btn-nm btn-nm-primary"
          style={{ 
            height: "46px", 
            borderRadius: "12px",
            padding: "0 20px",
            fontSize: "0.8rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            whiteSpace: "nowrap"
          }}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span style={{ fontWeight: 700, letterSpacing: '0.5px' }}>
            {loading ? "GENERATING..." : `WRITE ${fieldLabels[field].toUpperCase()}`}
          </span>
        </button>
      </div>
      
      {/* Brand Identity Footer */}
      <div className="flex items-center gap-3 px-1">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent opacity-50"></div>
        <div className="flex items-center gap-1.5 px-2">
          <Sparkles className="w-2.5 h-2.5" style={{ color: 'var(--primary)' }} />
          <span className="text-[9px] uppercase tracking-[0.2em] font-black opacity-60" style={{ color: 'var(--text-light)' }}>
            Aurea AI Merchandising
          </span>
        </div>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent opacity-50"></div>
      </div>
    </div>
  );
}
