"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2 } from "lucide-react";
import styles from "./ImageUpload.module.css";

interface ImageUploadProps {
  label: string;
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({ label, images, onChange, maxImages = 1 }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFiles(e.target.files);
    }
  };

  const uploadFiles = async (files: FileList) => {
    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      alert(`You can only upload up to ${maxImages} image(s).`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setIsUploading(true);

    try {
      const newImages = [...images];
      
      for (const file of filesToUpload) {
        if (!file.type.startsWith('image/')) {
          alert('Please upload only image files.');
          continue;
        }

        // Professional Base64 Conversion with Canvas Compression (Works everywhere, including Vercel)
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (event) => {
            const img = new (window as any).Image();
            img.src = event.target?.result as string;
            img.onload = () => {
              const canvas = document.createElement("canvas");
              const MAX_WIDTH = 1200;
              let width = img.width;
              let height = img.height;

              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              ctx?.drawImage(img, 0, 0, width, height);
              
              // Compress to 70% quality to save space
              const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
              resolve(dataUrl);
            };
          };
          reader.onerror = error => reject(error);
        });

        newImages.push(base64);
      }
      
      onChange(newImages);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error processing image. Try a smaller file.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (indexToRemove: number) => {
    onChange(images.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className={styles.uploadContainer}>
      <label className={styles.label}>
        {label} {maxImages > 1 && `(${images.length}/${maxImages})`}
      </label>
      
      {images.length < maxImages && (
        <div 
          className={`${styles.dropZone} ${isDragging ? styles.dragging : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            multiple={maxImages > 1}
            className={styles.fileInput}
          />
          
          <div className={styles.dropContent}>
            {isUploading ? (
              <>
                <Loader2 className={styles.spinner} size={32} />
                <p>Uploading...</p>
              </>
            ) : (
              <>
                <UploadCloud size={32} className={styles.uploadIcon} />
                <p className={styles.dropText}>
                  <strong>Click to upload</strong> or drag and drop
                </p>
                <p className={styles.dropHint}>SVG, PNG, JPG or GIF (max. 5MB)</p>
              </>
            )}
          </div>
        </div>
      )}

      {images.length > 0 && (
        <div className={styles.previewGrid}>
          {images.map((url, index) => (
            <div key={`${url}-${index}`} className={styles.previewItem}>
              <div className={styles.imageWrapper}>
                <Image 
                  src={url} 
                  alt={`Preview ${index}`} 
                  fill 
                  style={{ objectFit: "cover" }} 
                />
              </div>
              <button 
                type="button" 
                onClick={() => removeImage(index)}
                className={styles.removeBtn}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
