'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { clientTokenUtils } from '@/lib/auth';

const LogoutButton = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      console.log('Logging out...');
      
      // Call logout API to clear server-side cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Clear client-side tokens
      clientTokenUtils.clearTokens();
      
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('tokenChange'));
      
      console.log('Logout successful, redirecting to auth');
      router.push('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear client-side tokens and redirect
      clientTokenUtils.clearTokens();
      window.dispatchEvent(new Event('tokenChange'));
      router.push('/auth');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors"
      aria-label="Logout"
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
          />
        </svg>
      )}
    </button>
  );
};

export default LogoutButton; 