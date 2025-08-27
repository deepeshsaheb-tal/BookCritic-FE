import React, { ReactNode } from 'react';

export interface ContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
}

/**
 * Container component for consistent spacing and responsive layouts
 */
export const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  maxWidth = 'xl',
  padding = true,
}) => {
  // Max width classes
  const maxWidthClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  };

  return (
    <div
      className={`w-full mx-auto ${maxWidthClasses[maxWidth]} ${
        padding ? 'px-4 sm:px-6 lg:px-8' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
