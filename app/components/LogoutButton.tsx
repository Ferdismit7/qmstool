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
      router.refresh(); // Force a refresh to clear any cached state
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear client-side tokens and redirect
      clientTokenUtils.clearTokens();
      window.dispatchEvent(new Event('tokenChange'));
      router.push('/auth');
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="flex flex-col items-center justify-center px-2 py-1 rounded-md bg-gradient-to-r from-red-900/80 to-orange-900/80 hover:from-red-800/90 hover:to-orange-800/90 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all shadow-sm border border-red-800/50"
      aria-label="Logout"
    >
      {isLoading ? (
        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mb-0.5"></div>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-3.5 h-3.5 mb-0.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
            />
          </svg>
          <span className="text-[10px] font-medium leading-tight">Logout</span>
        </>
      )}
    </button>
  );
};

export default LogoutButton; 