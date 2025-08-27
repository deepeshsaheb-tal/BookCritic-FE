import React, { ReactNode } from 'react';
import { Navbar } from './navbar.tsx';
import { Footer } from './footer.tsx';

export interface LayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

/**
 * Main layout component that wraps all pages
 */
export const Layout: React.FC<LayoutProps> = ({ children, hideFooter = true }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};
