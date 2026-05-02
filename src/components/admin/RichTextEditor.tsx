"use client";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => (
    <div style={{
      height: "200px",
      background: "var(--bg-color)",
      borderRadius: "12px",
      border: "1px solid var(--border)",
      opacity: 0.5,
    }} />
  ),
});

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({ label, value, onChange }: RichTextEditorProps) {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
  ];

  return (
    <div className="rich-text-editor" style={{ marginBottom: "1rem" }} suppressHydrationWarning>
      <style>{`
        /* --- Premium Quill Theme Override --- */
        .rich-text-editor .ql-container {
          border: none !important;
          font-family: inherit;
        }
        .rich-text-editor .ql-toolbar {
          border: none !important;
          border-bottom: 1px solid var(--border) !important;
          background: var(--bg-color) !important;
          padding: 8px 12px !important;
          border-radius: 12px 12px 0 0 !important;
        }
        .rich-text-editor .ql-toolbar .ql-picker-label {
          color: var(--text-dark) !important;
          border: 1px solid var(--border) !important;
          border-radius: 6px !important;
          padding: 2px 8px !important;
        }
        .rich-text-editor .ql-toolbar .ql-picker-options {
          background: var(--bg-color) !important;
          border: 1px solid var(--border) !important;
          border-radius: 8px !important;
          box-shadow: var(--nm-outer-raised) !important;
          padding: 4px !important;
        }
        .rich-text-editor .ql-toolbar .ql-picker-item {
          color: var(--text-dark) !important;
          padding: 4px 8px !important;
          border-radius: 4px !important;
        }
        .rich-text-editor .ql-toolbar .ql-picker-item:hover {
          background: rgba(203, 163, 148, 0.1) !important;
          color: var(--primary) !important;
        }
        .rich-text-editor .ql-toolbar button {
          width: 30px !important;
          height: 30px !important;
          border-radius: 6px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.2s ease !important;
        }
        .rich-text-editor .ql-toolbar button:hover {
          background: rgba(203, 163, 148, 0.12) !important;
        }
        .rich-text-editor .ql-toolbar button.ql-active {
          background: rgba(203, 163, 148, 0.15) !important;
          border-radius: 6px !important;
        }
        .rich-text-editor .ql-snow .ql-stroke {
          stroke: var(--text-dark) !important;
        }
        .rich-text-editor .ql-snow .ql-fill {
          fill: var(--text-dark) !important;
        }
        .rich-text-editor .ql-snow .ql-picker {
          color: var(--text-dark) !important;
        }
        .rich-text-editor .ql-toolbar button:hover .ql-stroke,
        .rich-text-editor .ql-toolbar button.ql-active .ql-stroke {
          stroke: var(--primary) !important;
        }
        .rich-text-editor .ql-toolbar button:hover .ql-fill,
        .rich-text-editor .ql-toolbar button.ql-active .ql-fill {
          fill: var(--primary) !important;
        }
        .rich-text-editor .ql-editor {
          min-height: 180px;
          max-height: 400px;
          overflow-y: auto;
          color: var(--text-dark) !important;
          font-size: 0.9rem;
          line-height: 1.7;
          padding: 16px !important;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: var(--text-light) !important;
          opacity: 0.4;
          font-style: normal !important;
        }
        .rich-text-editor .ql-editor ul, 
        .rich-text-editor .ql-editor ol {
          padding-left: 1.5em;
        }
        .rich-text-editor .ql-editor li {
          margin-bottom: 4px;
        }
      `}</style>
      {label && (
        <label style={{
          display: "block",
          marginBottom: "0.5rem",
          fontWeight: 600,
          color: "var(--text-dark)",
          fontSize: "0.85rem",
        }}>
          {label}
        </label>
      )}
      <div style={{
        background: "var(--bg-color)",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid var(--border)",
        boxShadow: "var(--nm-inner-pressed-sm)",
      }}>
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
        />
      </div>
    </div>
  );
}
