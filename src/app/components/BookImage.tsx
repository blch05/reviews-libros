import React from "react";
import Image from "next/image";

interface BookImageProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const BookImage: React.FC<BookImageProps> = ({ src, alt, size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-20 h-28",
    md: "w-32 h-auto",
    lg: "w-40 h-60",
    xl: "w-48 h-72"
  };

  const imageSize = sizeClasses[size];

  if (!src) return null;

  // Usar img regular para imágenes externas que pueden tener problemas con Next.js Image
  return (
    <img 
      src={src} 
      alt={alt} 
      className={`${imageSize} object-cover rounded shadow-lg ${className}`}
    />
  );
};

export default BookImage;
