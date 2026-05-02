"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Link as LinkIcon, Loader2 } from "lucide-react";

interface LinkAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function LinkAutocomplete({ value, onChange, placeholder = "Search for a page or link..." }: LinkAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<{name: string, url: string}[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchLinks = async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/links/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
      setIsOpen(data.length > 0);
    } catch (error) {
      console.error("Link search failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    searchLinks(val);
  };

  const selectLink = (url: string) => {
    setQuery(url);
    onChange(url);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 rounded-xl border border-white/10 bg-black/20 focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-color)] border border-white/10 rounded-2xl shadow-2xl z-[9999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-64 overflow-y-auto p-2">
            {results.map((result, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => selectLink(result.url)}
                className="w-full text-left p-3 hover:bg-white/5 rounded-xl transition-colors group flex flex-col gap-0.5"
              >
                <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">{result.name}</span>
                <span className="text-[10px] opacity-40 font-mono">{result.url}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
