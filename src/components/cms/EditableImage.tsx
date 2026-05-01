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
  sizes?: string;
  style?: React.CSSProperties;
}

export default function EditableImage({ page, section, field, defaultSrc, alt, fill, className, priority, sizes, style }: EditableImageProps) {
  const { content } = useEditable();
  const { language } = useLanguageStore();

  const compositeKey = `${page}__${section}__${field}__${language}`;
  const fallbackKey = `${page}__${section}__${field}__en`;
  
  // If the field exists in content and is exactly an empty string, the user wants to hide it.
  // Otherwise, use the value, or the fallback, or the defaultSrc.
  let src = defaultSrc;
  
  if (content[compositeKey] !== undefined) {
    src = content[compositeKey];
  } else if (content[fallbackKey] !== undefined) {
    src = content[fallbackKey];
  }

  // If the user explicitly cleared the image, don't render anything
  if (!src) return null;

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      priority={priority}
      sizes={sizes}
      {...(!fill ? { width: 500, height: 500 } : {})} 
      style={!fill ? { width: "100%", height: "auto", ...style } : { ...style }}
    />
  );
}

