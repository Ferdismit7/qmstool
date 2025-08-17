'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import SidebarNav from './SidebarNav';
import { clientTokenUtils, apiClient } from '@/lib/auth';

interface User {
  userId?: number;
  email?: string;
  username: string;
  businessArea?: string;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const fetchUserData = useCallback(async (token: string) => {
    setIsLoading(true);
    try {
      console.log('Attempting to fetch user data with token:', token);
      
      // Use the new apiClient for consistent token handling
      const response = await apiClient.get('/api/auth/me');
      
      console.log('API response status:', response.status);
      const responseBody = await response.clone().text();
      console.log('API response body:', responseBody);
      
      if (response.ok) {
        const userData = JSON.parse(responseBody);
        console.log('Fetched user data successfully:', userData);
        setUser(userData);
        return true;
      } else {
        console.log('Failed to fetch user data, response not ok:', response.status);
        if (response.status === 401) {
          console.log('Token is invalid (401), clearing tokens');
          clientTokenUtils.clearTokens();
          setUser(null);
          router.push('/auth');
        } else {
          console.log('API error but keeping token - might be temporary issue');
          const tokenData = clientTokenUtils.decodeToken(token);
          if (tokenData && tokenData.username) {
            console.log('Creating temporary user state from token:', tokenData);
            setUser({ 
              userId: tokenData.userId,
              email: tokenData.email,
              username: tokenData.username,
              businessArea: tokenData.businessArea
            });
          }
        }
        return false;
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      console.log('Network error, keeping existing user state');
      const tokenData = clientTokenUtils.decodeToken(token);
      if (tokenData && tokenData.username) {
        console.log('Creating temporary user state from token after network error:', tokenData);
        setUser({ 
          userId: tokenData.userId,
          email: tokenData.email,
          username: tokenData.username,
          businessArea: tokenData.businessArea
        });
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const initializeAuth = useCallback(async () => {
    setIsLoading(true);
    
    // Use the new getValidToken method that checks expiration
    const token = clientTokenUtils.getValidToken();
    console.log('Initial token check:', token ? 'Valid token found' : 'No valid token');
    
    if (token) {
      // First, try to create a temporary user state from the token
      const tokenData = clientTokenUtils.decodeToken(token);
      if (tokenData && tokenData.username) {
        console.log('Setting temporary user state from token:', tokenData);
        setUser({ 
          userId: tokenData.userId,
          email: tokenData.email,
          username: tokenData.username,
          businessArea: tokenData.businessArea
        });
      }
      
      // Then try to fetch the full user data
      const success = await fetchUserData(token);
      if (!success && tokenData && tokenData.username) {
        // If fetch failed but we have token data, keep the temporary user state
        console.log('Keeping temporary user state after failed fetch');
      }
    } else {
      setUser(null);
      // Only redirect if we're not already on auth page
      if (window.location.pathname !== '/auth') {
        console.log('No valid token, redirecting to auth');
        router.push('/auth');
      }
    }
    
    setIsLoading(false);
  }, [fetchUserData, router]);

  useEffect(() => {
    // Add a longer delay to ensure DOM is ready and cookies are accessible
    const timer = setTimeout(initializeAuth, 100);
    
    return () => clearTimeout(timer);
  }, [initializeAuth]);

  // Listen for storage changes (when authToken is updated)
  useEffect(() => {
    const handleTokenChange = () => {
      console.log('Token change detected, re-initializing auth');
      initializeAuth();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        console.log('Storage change detected for authToken');
        handleTokenChange();
      }
    };

    window.addEventListener('tokenChange', handleTokenChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('tokenChange', handleTokenChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [initializeAuth]);

  const handleLogout = () => {
    clientTokenUtils.clearTokens();
    setUser(null);
    router.push('/auth');
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If no user and not on auth page, show loading (will redirect)
  if (!user && window.location.pathname !== '/auth') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If on auth page, just render children without layout
  if (window.location.pathname === '/auth') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarNav
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
      />
      
      <div className="lg:pl-64">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {user && (
                <div className="flex items-center gap-x-2">
                  <span className="text-sm font-medium text-gray-700">
                    Welcome, {user.username}
                  </span>
                  {user.businessArea && (
                    <span className="text-xs text-gray-500">
                      ({user.businessArea})
                    </span>
                  )}
                </div>
              )}
              {user && (
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 