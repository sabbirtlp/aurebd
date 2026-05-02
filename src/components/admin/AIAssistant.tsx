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
    <div className="flex flex-col gap-3 mb-6 w-full animate-fade-in">
      <div className="flex items-center gap-3 w-full">
        {/* NM Inset Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder={`Special instructions (e.g. "Focus on Vitamin C", "Tone: Energetic")`}
            className="w-full px-4 py-3 text-sm rounded-2xl nm-inset outline-none transition-all placeholder:text-gray-400"
            style={{ 
              background: 'var(--bg-color)', 
              color: 'var(--text-dark)',
              border: '1px solid var(--border)'
            }}
          />
          <Wand2 className="absolute right-4 top-3.5 w-4 h-4" style={{ color: 'var(--primary)' }} />
        </div>
        
        {/* NM Primary Button */}
        <button
          type="button"
          onClick={generateContent}
          disabled={loading}
          className="btn-nm btn-nm-primary"
          style={{ 
            height: "46px", 
            borderRadius: "16px",
            padding: "0 24px",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span style={{ fontWeight: 700 }}>
            {loading ? "CRAFTING..." : `GENERATE ${fieldLabels[field].toUpperCase()}`}
          </span>
        </button>
      </div>
      
      {/* Subtle Label */}
      <div className="flex items-center gap-2 px-2">
        <div className="w-1 h-1 rounded-full" style={{ background: 'var(--primary)' }}></div>
        <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--text-light)' }}>
          Powered by Aurea Intelligence
        </span>
      </div>
    </div>
  );
}
