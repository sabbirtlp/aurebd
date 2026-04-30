"use client";

import { useEditable } from "@/context/EditableContext";
import { Edit, Eye, Save, Settings } from "lucide-react";

export default function AdminEditToolbar() {
  const { isEditMode, setIsEditMode, isAdmin } = useEditable();

  if (!isAdmin) return null;

  return (
    <div 
      style={{
        position: "fixed",
        bottom: "100px",
        right: "30px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}
    >
      <button
        onClick={() => setIsEditMode(!isEditMode)}
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: isEditMode ? "var(--primary)" : "var(--bg-color)",
          color: isEditMode ? "white" : "var(--primary)",
          boxShadow: "var(--nm-outer-raised)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          border: isEditMode ? "none" : "1px solid var(--border)"
        }}
        title={isEditMode ? "Exit Edit Mode" : "Enter Edit Mode (Visual Builder)"}
      >
        {isEditMode ? <Eye size={24} /> : <Edit size={24} />}
      </button>

      {isEditMode && (
        <div 
          style={{
            background: "var(--bg-color)",
            padding: "8px 16px",
            borderRadius: "99px",
            boxShadow: "var(--nm-outer-raised-sm)",
            fontSize: "0.75rem",
            fontWeight: "700",
            color: "var(--primary)",
            border: "1px solid var(--border)",
            textAlign: "center",
            animation: "fadeIn 0.3s ease"
          }}
        >
          EDIT MODE ACTIVE
        </div>
      )}
    </div>
  );
}
