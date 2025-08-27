import React, { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * OptimizedImage component for better performance
 * Features:
 * - Lazy loading
 * - Responsive sizing
 * - Loading placeholder
 * - Error handling
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  sizes = '100vw',
  priority = false,
  objectFit = 'cover',
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [imageSrc, setImageSrc] = useState<string>(src);

  // Reset states when src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setImageSrc(src);
  }, [src]);

  // Handle image load event
  const handleLoad = (): void => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  // Handle image error event
  const handleError = (): void => {
    setHasError(true);
    setImageSrc('/images/placeholder.jpg'); // Fallback image
    if (onError) onError();
  };

  // Generate srcset for responsive images
  const generateSrcSet = (): string => {
    if (!width) return '';
    
    const breakpoints = [320, 480, 640, 768, 1024, 1280, 1536];
    return breakpoints
      .filter(bp => bp <= (width * 2)) // Don't go beyond 2x the specified width
      .map(bp => {
        // Use a service like Imgix, Cloudinary, or your own resizing service
        const resizedUrl = `${imageSrc}?width=${bp}`;
        return `${resizedUrl} ${bp}w`;
      })
      .join(', ');
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ width: width ? `${width}px` : '100%', height: height ? `${height}px` : 'auto' }}
    >
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleLoad}
        onError={handleError}
        srcSet={generateSrcSet()}
        sizes={sizes}
        className={`w-full h-full transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ objectFit }}
      />
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="text-gray-500 text-sm">Image not available</span>
        </div>
      )}
    </div>
  );
};
