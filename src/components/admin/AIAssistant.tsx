"use client";

import { useState } from "react";
import { Sparkles, Loader2, Wand2 } from "lucide-react";
import { toast } from "react-toastify";

interface AIAssistantProps {
  productName: string;
  category: string;
  field: "description" | "ingredients" | "howToUse";
  existingContent?: string;
  onGenerate: (text: string) => void;
}

export default function AIAssistant({ productName, category, field, existingContent, onGenerate }: AIAssistantProps) {
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
          customPrompt,
          existingContent
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
    <div className="w-full mb-6 animate-fade-in group">
      <div className="flex items-center gap-3 p-1.5 px-4 rounded-xl transition-all border border-[var(--border)]" 
           style={{ 
             background: 'var(--bg-color)', 
             boxShadow: 'var(--nm-inner-pressed-sm)' 
           }}>
        
        {/* Pro Icon */}
        <div className="flex items-center gap-2 pr-2 border-r border-[var(--border)] opacity-60">
          <Sparkles className="w-4 h-4" style={{ color: 'var(--primary)' }} />
          <span className="text-[9px] font-black uppercase tracking-widest hidden sm:block" style={{ color: 'var(--text-dark)' }}>AI</span>
        </div>
        
        {/* High-Contrast Input */}
        <input
          type="text"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder={`Add custom instructions for ${fieldLabels[field].toLowerCase()}...`}
          className="flex-1 bg-transparent py-2 text-sm outline-none border-none placeholder:text-gray-400 font-medium"
          style={{ 
            color: 'var(--text-dark)', 
            fontSize: '0.85rem' 
          }}
        />

        {/* Premium Brand Button */}
        <button
          type="button"
          onClick={generateContent}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          style={{ 
            color: 'white',
            background: 'var(--primary)',
            boxShadow: 'var(--nm-outer-raised-sm)'
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
      
      {/* Dynamic Feedback Footer */}
      <div className="mt-1.5 px-2 flex items-center gap-2 opacity-40">
        <div className="w-1 h-1 rounded-full bg-[var(--primary)] animate-pulse"></div>
        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-light)' }}>
          {loading ? 'Aurea Intelligence is crafting your content...' : 'Aurea AI Assistant v2.1 • High Precision Mode'}
        </span>
      </div>
    </div>
  );
}
