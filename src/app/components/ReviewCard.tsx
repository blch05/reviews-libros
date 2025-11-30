import React from "react";
import StarRating from "./StarRating";
import { Review } from "../../types";

interface ReviewCardProps {
  review: Review;
  type?: "best" | "worst" | "default";
  className?: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, type = "default", className = "" }) => {
  const typeStyles = {
    best: {
      label: "Mejor Reseña",
      labelColor: "text-green-900"
    },
    worst: {
      label: "Peor Reseña", 
      labelColor: "text-red-900"
    },
    default: {
      label: "Reseña",
      labelColor: "text-gray-900"
    }
  };

  const style = typeStyles[type];

  return (
    <div className={`bg-white border border-black rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`font-sans font-semibold ${style.labelColor}`}>
          {style.label}
        </span>
        <StarRating 
          rating={review.rating} 
          size="sm" 
          showValue={false}
          color="text-black"
        />
      </div>
      <p className="text-gray-700 text-sm italic">&ldquo;{review.content}&rdquo;</p>
    </div>
  );
};

export default ReviewCard;
