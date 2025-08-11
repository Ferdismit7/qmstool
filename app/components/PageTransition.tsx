'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    // Start transition
    setIsLoading(true);
    setIsVisible(false);
    
    // Update key to force re-render
    setKey(prev => prev + 1);
    
    // Fade out quickly
    const fadeOutTimer = setTimeout(() => {
      setIsLoading(false);
    }, 200);

    // Fade in with a longer delay for smoother transition
    const fadeInTimer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(fadeInTimer);
    };
  }, [pathname]);

  return (
    <div key={key} className="relative min-h-full">
      {/* Loading overlay for smoother transitions */}
      {isLoading && (
        <div className="absolute inset-0 bg-brand-gray1/60 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-10 h-10 border-3 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="text-brand-white text-sm font-medium animate-pulse">
              Loading...
            </div>
          </div>
        </div>
      )}
      
      {/* Main content with enhanced fade transition */}
      <div
        className={`transition-all duration-700 ease-out transform ${
          isVisible 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-4 scale-95'
        }`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {children}
      </div>
    </div>
  );
}
