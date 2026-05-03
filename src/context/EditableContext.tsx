"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

interface EditableContextType {
  isEditMode: boolean;
  setIsEditMode: (val: boolean) => void;
  content: Record<string, string>;
  updateContent: (page: string, section: string, key: string, value: string, language: string) => Promise<void>;
  isAdmin: boolean;
}

const EditableContext = createContext<EditableContextType | undefined>(undefined);

export function EditableProvider({ 
  children, 
  initialContent = {} 
}: { 
  children: React.ReactNode, 
  initialContent?: Record<string, string> 
}) {
  const { data: session } = useSession();
  const [isEditMode, setIsEditMode] = useState(false);
  const [content, setContent] = useState<Record<string, string>>(initialContent);
  const isAdmin = session?.user?.role === "admin";

  // Fetch CMS content client-side only if not provided by server
  useEffect(() => {
    if (initialContent && Object.keys(initialContent).length > 0) return;
    
    let cancelled = false;
    async function fetchContent() {
      try {
        const res = await fetch("/api/admin/content");
        const data = await res.json();
        if (!cancelled && data.content) {
          const map: Record<string, string> = {};
          data.content.forEach((item: any) => {
            const compositeKey = `${item.page}__${item.section}__${item.key}__${item.language || "en"}`;
            map[compositeKey] = item.value;
          });
          setContent(map);
        }
      } catch (err) {
        console.error("Failed to fetch CMS content", err);
      }
    }
    fetchContent();
    return () => { cancelled = true; };
  }, [initialContent]);

  const updateContent = async (page: string, section: string, key: string, value: string, language: string) => {
    const compositeKey = `${page}__${section}__${key}__${language}`;
    
    // Optimistic update
    const oldContent = { ...content };
    setContent(prev => ({ ...prev, [compositeKey]: value }));

    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          items: [{ page, section, key, value, language }] 
        }),
      });

      if (!res.ok) {
        let errorMessage = "Failed to save";
        try {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errData = await res.json();
            errorMessage = errData.message || errorMessage;
            if (errData.error) errorMessage += ` (${errData.error})`;
          } else {
            // Non-JSON response (e.g. HTML error page or 413 Payload Too Large)
            errorMessage = `Server Error: ${res.status} ${res.statusText}`;
            if (res.status === 413) errorMessage = "Payload too large. Please try a smaller image.";
          }
        } catch (e) {
          console.error("Error parsing error response:", e);
        }
        
        throw new Error(errorMessage);
      }
      toast.success("Content updated!", { autoClose: 1000 });
    } catch (err: any) {
      console.error("Save Error:", err);
      setContent(oldContent);
      toast.error(err.message || "Failed to save changes");
    }
  };

  return (
    <EditableContext.Provider value={{ isEditMode, setIsEditMode, content, updateContent, isAdmin }}>
      {children}
    </EditableContext.Provider>
  );
}

export function useEditable() {
  const context = useContext(EditableContext);
  if (context === undefined) {
    throw new Error("useEditable must be used within an EditableProvider");
  }
  return context;
}
