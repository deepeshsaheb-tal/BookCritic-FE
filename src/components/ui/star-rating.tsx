import React, { useState } from 'react';

export interface StarRatingProps {
  rating?: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  readOnly?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

/**
 * Star rating component for displaying and selecting ratings
 */
export const StarRating: React.FC<StarRatingProps> = ({
  rating = 0,
  maxRating = 5,
  size = 'md',
  color = 'text-yellow-400',
  readOnly = false,
  onChange,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState<number>(0);
  
  // Size classes
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };
  
  // Handle mouse enter on star
  const handleMouseEnter = (index: number): void => {
    if (!readOnly) {
      setHoverRating(index);
    }
  };
  
  // Handle mouse leave on star container
  const handleMouseLeave = (): void => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };
  
  // Handle click on star
  const handleClick = (index: number): void => {
    if (!readOnly && onChange) {
      onChange(index);
    }
  };
  
  // Render stars
  const renderStars = (): JSX.Element[] => {
    return Array.from({ length: maxRating }, (_, i) => {
      const starIndex = i + 1;
      const isFilled = hoverRating ? starIndex <= hoverRating : starIndex <= rating;
      
      return (
        <span
          key={i}
          className={`${readOnly ? '' : 'cursor-pointer'}`}
          onMouseEnter={() => handleMouseEnter(starIndex)}
          onClick={() => handleClick(starIndex)}
          role={readOnly ? undefined : 'button'}
          tabIndex={readOnly ? undefined : 0}
          aria-label={readOnly ? `Rating: ${starIndex} of ${maxRating}` : `Rate ${starIndex} of ${maxRating}`}
        >
          {isFilled ? (
            <svg
              className={`${sizeClasses[size]} ${color}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
          ) : (
            <svg
              className={`${sizeClasses[size]} text-gray-300`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          )}
        </span>
      );
    });
  };
  
  return (
    <div
      className={`flex ${className}`}
      onMouseLeave={handleMouseLeave}
      aria-label={`Rating: ${rating} out of ${maxRating}`}
    >
      {renderStars()}
    </div>
  );
};
