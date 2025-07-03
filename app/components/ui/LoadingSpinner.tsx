import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-brand-gray3 border-t-brand-primary`}></div>
    </div>
  );
}

// Full screen loading spinner
export function FullScreenLoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-brand-gray1/80 flex items-center justify-center z-50">
      <div className="bg-brand-gray2 p-8 rounded-lg shadow-xl">
        <LoadingSpinner size="lg" />
        <p className="text-brand-white text-center mt-4">Loading...</p>
      </div>
    </div>
  );
}

// Centered loading spinner for page content
export function CenteredLoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <LoadingSpinner size="lg" />
    </div>
  );
} 