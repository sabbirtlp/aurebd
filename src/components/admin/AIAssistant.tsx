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
    <div className="nm-card p-6 mb-8 w-full animate-fade-in" style={{ border: '1px dashed var(--primary)', background: 'rgba(203, 163, 148, 0.05)', borderRadius: '20px' }}>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" style={{ color: 'var(--primary)' }} />
          <span className="text-sm font-black uppercase tracking-widest" style={{ color: 'var(--text-dark)' }}>
            Aurea AI Command Center
          </span>
        </div>

        {/* Instruction Field (Dedicated Row) */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-widest px-1 opacity-60" style={{ color: 'var(--text-dark)' }}>
            Step 1: Specific Instructions (Optional)
          </label>
          <div className="relative w-full">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={`e.g. "Focus on Vitamin C benefits", "Tone: Luxury & Professional"`}
              className="w-full px-5 py-4 text-sm transition-all outline-none"
              style={{ 
                background: 'var(--bg-color)', 
                color: 'var(--text-dark)',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                boxShadow: 'var(--nm-inner-pressed-sm)',
                fontSize: '0.95rem'
              }}
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 opacity-30">
              <Wand2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-tighter opacity-40">Intelligence Model</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]">Llama 3.1 GA</span>
          </div>
          
          <button
            type="button"
            onClick={generateContent}
            disabled={loading}
            className="btn-nm btn-nm-primary"
            style={{ 
              height: "50px", 
              borderRadius: "12px",
              padding: "0 28px",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              boxShadow: 'var(--nm-outer-raised-sm)',
              marginLeft: 'auto'
            }}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            <span style={{ fontWeight: 800 }}>
              {loading ? "CRAFTING..." : `GENERATE ${fieldLabels[field].toUpperCase()}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
