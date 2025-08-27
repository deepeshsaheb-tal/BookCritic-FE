import React, { useEffect, useRef, useState } from 'react';

interface LazyLoadProps {
  /** The component or element to render when in viewport */
  children: React.ReactNode;
  /** Optional placeholder to show while loading */
  placeholder?: React.ReactNode;
  /** Root margin for Intersection Observer */
  rootMargin?: string;
  /** Whether to keep the component mounted after it has been loaded */
  keepMounted?: boolean;
  /** Optional callback when component enters viewport */
  onVisible?: () => void;
  /** Optional className for the container */
  className?: string;
}

/**
 * LazyLoad component that renders children only when they enter the viewport
 * Useful for performance optimization by deferring the rendering of off-screen components
 */
export const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  placeholder,
  rootMargin = '0px',
  keepMounted = true,
  onVisible,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [hasBeenVisible, setHasBeenVisible] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasBeenVisible(true);
          onVisible?.();
          
          // If we don't need to keep observing after it becomes visible
          if (keepMounted) {
            observer.unobserve(currentRef);
          }
        } else {
          // Only update visibility if we're not keeping mounted
          if (!keepMounted) {
            setIsVisible(false);
          }
        }
      },
      { rootMargin }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [keepMounted, onVisible, rootMargin]);

  // Determine what to render
  const shouldRender = isVisible || (keepMounted && hasBeenVisible);

  return (
    <div ref={ref} className={className}>
      {shouldRender ? children : placeholder || null}
    </div>
  );
};
