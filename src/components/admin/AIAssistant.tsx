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
    <div className="w-full mb-4 animate-fade-in">
      {/* Sleek Minimalist AI Bar */}
      <div className="flex items-center gap-3 p-1 px-3 rounded-2xl bg-white/50 backdrop-blur-sm border border-[var(--border)] shadow-sm hover:shadow-md transition-all">
        {/* AI Icon & Placeholder */}
        <Sparkles className="w-4 h-4 opacity-50" style={{ color: 'var(--primary)' }} />
        
        {/* Minimalist Input */}
        <input
          type="text"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder={`Add instructions for ${fieldLabels[field]} (optional)...`}
          className="flex-1 bg-transparent py-2 text-sm outline-none border-none placeholder:text-gray-400"
          style={{ color: 'var(--text-dark)', fontSize: '0.85rem' }}
        />

        {/* Vertical Divider */}
        <div className="w-[1px] h-6 bg-[var(--border)] opacity-50"></div>

        {/* Compact Pro Button */}
        <button
          type="button"
          onClick={generateContent}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all hover:opacity-80 active:scale-95 disabled:opacity-50"
          style={{ 
            color: 'var(--primary)',
            background: 'transparent',
            borderRadius: '10px'
          }}
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Wand2 className="w-3.5 h-3.5" />
          )}
          {loading ? "WIRTING..." : "GENERATE"}
        </button>
      </div>
      
      {/* Very Subtle Footer */}
      <div className="mt-1 px-3 flex items-center justify-between opacity-40">
        <span className="text-[9px] font-bold uppercase tracking-tighter">AI Assistant v2.0</span>
        {customPrompt && (
          <span className="text-[9px] italic">Using custom instructions</span>
        )}
      </div>
    </div>
  );
}
