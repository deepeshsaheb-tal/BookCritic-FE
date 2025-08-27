import React from 'react';
import { OptimizedImage } from './optimized-image';

interface BookCoverProps {
  imageUrl: string;
  title: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  onClick?: () => void;
}

/**
 * BookCover component for displaying optimized book cover images
 * Uses the OptimizedImage component with appropriate sizing based on the size prop
 */
export const BookCover: React.FC<BookCoverProps> = ({
  imageUrl,
  title,
  size = 'medium',
  className = '',
  onClick,
}) => {
  // Define dimensions based on size
  const dimensions = {
    small: { width: 100, height: 150 },
    medium: { width: 150, height: 225 },
    large: { width: 200, height: 300 },
  };

  const { width, height } = dimensions[size];
  
  // Define responsive sizes for different viewports
  const sizes = {
    small: '(max-width: 640px) 80px, 100px',
    medium: '(max-width: 640px) 120px, 150px',
    large: '(max-width: 640px) 160px, 200px',
  };

  return (
    <div 
      className={`relative rounded overflow-hidden shadow-lg ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <OptimizedImage
        src={imageUrl}
        alt={`${title} book cover`}
        width={width}
        height={height}
        sizes={sizes[size]}
        objectFit="cover"
        className="transition-transform duration-300 hover:scale-105"
      />
    </div>
  );
};
