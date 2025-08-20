import React from "react";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
  color?: string;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  maxStars = 5, 
  size = "md", 
  showValue = true, 
  className = "",
  color = "text-yellow-400"
}) => {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg", 
    lg: "text-xl"
  };

  const starSize = sizeClasses[size];

  if (rating <= 0) return null;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex">
        {[...Array(maxStars)].map((_, i) => (
          <span 
            key={i} 
            className={`${starSize} ${i < rating ? color : "text-gray-300"}`}
          >
            ★
          </span>
        ))}
      </div>
      {showValue && (
        <span className={`${starSize} font-semibold font-serif text-white`}>
          {rating.toFixed(1)}/{maxStars}.0
        </span>
      )}
    </div>
  );
};

export default StarRating;
