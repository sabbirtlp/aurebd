"use client";

import { useState } from "react";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";

interface AIAssistantProps {
  productName: string;
  category: string;
  field: "description" | "ingredients" | "howToUse";
  onGenerate: (text: string) => void;
}

export default function AIAssistant({ productName, category, field, onGenerate }: AIAssistantProps) {
  const [loading, setLoading] = useState(false);

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
          features: "Luxury, Organic, Effective", // Default features
          field
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

  const label = {
    description: "Description",
    ingredients: "Ingredients",
    howToUse: "Usage"
  }[field];

  return (
    <button
      type="button"
      onClick={generateContent}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed mb-2"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Sparkles className="w-3.5 h-3.5" />
      )}
      {loading ? "Generating..." : `AI Generate ${label}`}
    </button>
  );
}
