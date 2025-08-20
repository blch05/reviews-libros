import React, { useState } from "react";

interface TruncatedTextProps {
  text: string;
  maxLength: number;
  className?: string;
  expandable?: boolean;
  expandText?: string;
  collapseText?: string;
  onExpand?: () => void;
}

const TruncatedText: React.FC<TruncatedTextProps> = ({ 
  text, 
  maxLength, 
  className,
  expandable = false,
  expandText = "ver más",
  collapseText = "ver menos",
  onExpand
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!text) return null;
  
  const shouldTruncate = text.length > maxLength;
  const displayText = isExpanded || !shouldTruncate ? text : text.slice(0, maxLength) + "...";

  const handleToggle = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (!isExpanded && onExpand) {
      onExpand();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={className}>
      <span>{displayText}</span>
      {expandable && shouldTruncate && (
        <button
          onClick={handleToggle}
          className="text-white hover:text-gray-400 underline ml-1 text-sm"
        >
          {isExpanded ? collapseText : expandText}
        </button>
      )}
    </div>
  );
};

export default TruncatedText;
