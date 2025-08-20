import React from "react";

interface CarouselButtonProps {
  direction: "prev" | "next";
  onClick: () => void;
  className?: string;
}

const CarouselButton: React.FC<CarouselButtonProps> = ({ direction, onClick, className = "" }) => {
  const isNext = direction === "next";
  const arrow = isNext ? "→" : "←";
  const position = isNext ? "right-4" : "left-4";
  const ariaLabel = isNext ? "Siguiente" : "Anterior";

  return (
    <button
      className={`absolute ${position} top-1/2 -translate-y-1/2 bg-[#4b2e22] text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-600 ${className}`}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {arrow}
    </button>
  );
};

export default CarouselButton;
