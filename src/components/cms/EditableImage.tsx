"use client";

import Image from "next/image";
import { useEditable } from "@/context/EditableContext";
import { useLanguageStore } from "@/store/languageStore";

interface EditableImageProps {
  page: string;
  section: string;
  field: string;
  defaultSrc: string;
  alt: string;
  fill?: boolean;
  className?: string;
  priority?: boolean;
}

export default function EditableImage({ page, section, field, defaultSrc, alt, fill, className, priority }: EditableImageProps) {
  const { content } = useEditable();
  const { language } = useLanguageStore();

  const compositeKey = `${page}__${section}__${field}__${language}`;
  // Fallback to English if not found in current language, then defaultSrc
  const fallbackKey = `${page}__${section}__${field}__en`;
  
  const src = content[compositeKey] || content[fallbackKey] || defaultSrc;

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      priority={priority}
      {...(!fill ? { width: 500, height: 500 } : {})} // Provide default dimensions if not fill
      style={!fill ? { width: "100%", height: "auto" } : {}}
    />
  );
}
