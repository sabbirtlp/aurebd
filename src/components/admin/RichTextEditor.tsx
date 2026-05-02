"use client";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <div style={{ height: "200px", background: "#f0f0f0", borderRadius: "8px", opacity: 0.6 }} />
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
    <div className="rich-text-editor" style={{ marginBottom: "1.5rem" }} suppressHydrationWarning>
      <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--text-dark)" }}>
        {label}
      </label>
      <div style={{ background: "white", borderRadius: "8px", overflow: "hidden", border: "1px solid #ddd" }}>
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          style={{ height: "250px", marginBottom: "45px" }}
        />
      </div>
    </div>
  );
}
