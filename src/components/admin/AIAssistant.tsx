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
    <div className="nm-card p-5 mb-8 w-full animate-fade-in" style={{ border: '1px dashed var(--primary)', background: 'rgba(203, 163, 148, 0.05)' }}>
      <div className="flex flex-col gap-4">
        {/* Header with Label */}
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: 'var(--primary)' }} />
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
            AI Smart Content Assistant
          </span>
        </div>

        {/* Input & Button Row */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <label className="absolute -top-2 left-3 px-1 text-[10px] font-bold bg-white" style={{ color: 'var(--text-light)', background: 'var(--bg-color)' }}>
              SPECIAL INSTRUCTIONS
            </label>
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={`e.g. "Focus on hydration", "Style: Scientific but catchy"`}
              className="w-full px-4 py-4 text-sm transition-all outline-none"
              style={{ 
                background: 'var(--bg-color)', 
                color: 'var(--text-dark)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                fontSize: '0.95rem'
              }}
            />
          </div>
          
          <button
            type="button"
            onClick={generateContent}
            disabled={loading}
            className="btn-nm btn-nm-primary"
            style={{ 
              height: "56px", 
              borderRadius: "12px",
              padding: "0 28px",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              whiteSpace: "nowrap",
              boxShadow: 'var(--nm-outer-raised-sm)'
            }}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Wand2 className="w-5 h-5" />
            )}
            <span style={{ fontWeight: 800, letterSpacing: '0.5px' }}>
              {loading ? "CRAFTING..." : `CREATE ${fieldLabels[field].toUpperCase()}`}
            </span>
          </button>
        </div>

        {/* Dynamic Tip */}
        <p className="text-[11px] opacity-70 italic" style={{ color: 'var(--text-light)', paddingLeft: '4px' }}>
          Tip: Adding specific details about ingredients or benefits will result in much better content.
        </p>
      </div>
    </div>
  );
}
