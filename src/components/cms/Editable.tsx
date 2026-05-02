"use client";

import { useState, useEffect, useRef } from "react";
import { useEditable } from "@/context/EditableContext";
import { useLanguageStore } from "@/store/languageStore";
import { Edit2, Check, X, Link as LinkIcon } from "lucide-react";
import LinkAutocomplete from "@/components/admin/LinkAutocomplete";

interface EditableProps {
  page: string;
  section: string;
  field: string;
  defaultText: string;
  className?: string;
  multiline?: boolean;
  isLink?: boolean;
}

export default function Editable({ page, section, field, defaultText, className = "", multiline = false, isLink = false }: EditableProps) {
  const { isEditMode, content, updateContent, isAdmin } = useEditable();
  const { language } = useLanguageStore();
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  const compositeKey = `${page}__${section}__${field}__${language}`;
  const currentValue = content[compositeKey] || defaultText;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleStartEdit = (e: React.MouseEvent) => {
    if (!isEditMode || !isAdmin) return;
    e.preventDefault();
    e.stopPropagation();
    setTempValue(currentValue);
    setIsEditing(true);
  };

  const handleSave = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (tempValue !== currentValue) {
      await updateContent(page, section, field, tempValue, language);
    }
    setIsEditing(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(false);
  };

  if (!isEditMode || !isAdmin) {
    return isLink && !currentValue ? null : <span className={className}>{currentValue}</span>;
  }

  if (isEditing) {
    return (
      <div className="editable-input-container" style={{ position: "relative", display: "inline-block", width: "100%", zIndex: 50, minWidth: isLink ? "300px" : "auto" }}>
        {isLink ? (
          <LinkAutocomplete 
            value={tempValue} 
            onChange={(val) => setTempValue(val)} 
            placeholder="Search for internal link..."
          />
        ) : multiline ? (
          <textarea
            ref={inputRef as any}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "8px",
              border: "2px solid var(--primary)",
              background: "var(--bg-color)",
              color: "var(--text-dark)",
              font: "inherit",
              minHeight: "100px"
            }}
          />
        ) : (
          <input
            ref={inputRef as any}
            type="text"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            style={{
              width: "100%",
              padding: "0.25rem 0.5rem",
              borderRadius: "6px",
              border: "2px solid var(--primary)",
              background: "var(--bg-color)",
              color: "var(--text-dark)",
              font: "inherit"
            }}
          />
        )}
        <div style={{ position: "absolute", top: "100%", right: 0, display: "flex", gap: "4px", marginTop: "4px", zIndex: 100 }}>
          <button onClick={handleSave} style={{ background: "var(--primary)", color: "white", border: "none", borderRadius: "4px", padding: "4px", cursor: "pointer" }}><Check size={14} /></button>
          <button onClick={handleCancel} style={{ background: "#ff4d4d", color: "white", border: "none", borderRadius: "4px", padding: "4px", cursor: "pointer" }}><X size={14} /></button>
        </div>
      </div>
    );
  }

  const displayValue = isLink ? (currentValue || "Add Link") : currentValue;

  return (
    <span 
      className={`${className} editable-highlight`}
      onClick={handleStartEdit}
      style={{ 
        cursor: "pointer", 
        position: "relative",
        border: isLink ? "1px solid var(--primary)" : "1px dashed var(--primary)",
        borderRadius: "4px",
        padding: "2px 8px",
        display: "inline-block",
        transition: "all 0.2s",
        background: isLink ? "rgba(203, 163, 148, 0.1)" : "transparent",
        fontSize: isLink ? "0.8em" : "inherit"
      }}
    >
      {isLink && <LinkIcon size={10} className="inline mr-1 opacity-60" />}
      {displayValue}
      <span style={{ position: "absolute", top: "-10px", right: "-10px", background: "var(--primary)", color: "white", borderRadius: "50%", padding: "2px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <Edit2 size={8} />
      </span>
    </span>
  );
}
