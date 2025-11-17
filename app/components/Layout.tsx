'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import SidebarNav, { MobileMenuButton } from './SidebarNav';
import LogoutButton from './LogoutButton';
import PageTransition from './PageTransition';
import Link from 'next/link';
import { clientTokenUtils } from '@/lib/auth';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if we should show the sidebar (exclude dashboard and auth pages)
  const shouldShowSidebar = pathname !== '/dashboard' && pathname !== '/auth';

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    console.log('Sidebar toggle clicked, current state:', sidebarOpen);
    setSidebarOpen(prev => {
      const newState = !prev;
      console.log('Setting sidebar state to:', newState);
      return newState;
    });
  };

  // Handle sidebar close
  const handleSidebarClose = () => {
    console.log('Sidebar close called, current state:', sidebarOpen);
    setSidebarOpen(false);
  };

  const fetchUserData = useCallback(async (token: string) => {
    setIsLoading(true);
    try {
      console.log('Attempting to fetch user data with token:', token);
      
      // Check if token is expired before making request
      if (clientTokenUtils.isTokenExpired(token)) {
        console.log('Token is expired, clearing tokens');
        clientTokenUtils.clearTokens();
        setUser(null);
        return false;
      }
      
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include', // Include cookies for better compatibility
      });
      
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
        } else {
          console.log('API error but keeping token - might be temporary issue');
          const tokenData = clientTokenUtils.decodeToken(token);
          if (tokenData && tokenData.username) {
            console.log('Creating temporary user state from token:', tokenData);
            setUser({ username: tokenData.username });
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
        setUser({ username: tokenData.username });
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      const token = clientTokenUtils.getToken();
      console.log('Initial token check:', token ? 'Token found' : 'No token');
      
      if (token) {
        // Check if token is expired
        if (clientTokenUtils.isTokenExpired(token)) {
          console.log('Token is expired during initialization, clearing tokens');
          clientTokenUtils.clearTokens();
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        // First, try to create a temporary user state from the token
        const tokenData = clientTokenUtils.decodeToken(token);
        if (tokenData && tokenData.username) {
          console.log('Setting temporary user state from token:', tokenData);
          setUser({ username: tokenData.username });
        }
        
        // Then try to fetch the full user data
        const success = await fetchUserData(token);
        if (!success && tokenData && tokenData.username) {
          // If fetch failed but we have token data, keep the temporary user state
          console.log('Keeping temporary user state after failed fetch');
        }
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    };

    const timer = setTimeout(initializeAuth, 200);
    
    return () => clearTimeout(timer);
  }, [fetchUserData]);

  // Listen for storage changes (when authToken is updated)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        console.log('Auth token changed, refetching user data');
        const token = clientTokenUtils.getToken();
        if (token) {
          fetchUserData(token);
        } else {
          setUser(null);
        }
      }
    };

    // Also listen for custom events when token changes in the same window
    const handleTokenChange = () => {
      console.log('Custom token change event detected');
      const token = clientTokenUtils.getToken();
      if (token) {
        fetchUserData(token);
      } else {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('tokenChange', handleTokenChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tokenChange', handleTokenChange);
    };
  }, [fetchUserData]);

  useEffect(() => {
    if (!isLoading && !user && pathname !== '/auth') {
      const timer = setTimeout(() => {
        const token = clientTokenUtils.getToken();
        if (!token) {
          console.log('No token found, redirecting to auth');
          router.replace('/auth');
        } else if (clientTokenUtils.isTokenExpired(token)) {
          console.log('Token is expired, clearing tokens and redirecting to auth');
          clientTokenUtils.clearTokens();
          router.replace('/auth');
        } else {
          console.log('Token found but no user, attempting to fetch user data');
          fetchUserData(token);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, user, pathname, router, fetchUserData]);

  // Clear tokens when window is closed
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('Window closing, clearing authentication tokens');
      clientTokenUtils.clearTokens();
      
      // Call logout API to clear server-side cookies
      // Use fetch with keepalive for reliable delivery during page unload
      fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        keepalive: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(() => {
        // Ignore errors - window is closing
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const getInitials = (username: string) => {
    const initial = username.charAt(0).toUpperCase();
    console.log('Getting initial for username:', username, 'Initial:', initial);
    return initial;
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-full bg-brand-gray1">
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="relative z-10 flex-shrink-0 border-b border-brand-gray2/50 bg-brand-gray1">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 sm:py-3">
                <div className="flex items-center mb-4 sm:mb-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-brand-white truncate">Quality Management Systems</h1>
                </div>
                <div className="flex items-center gap-4">
                  <div className="animate-pulse bg-brand-gray2 h-6 w-6 rounded"></div>
                  <div className="animate-pulse bg-brand-gray2 h-8 w-8 rounded-full"></div>
                  <LogoutButton />
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto bg-brand-gray1 p-4">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Show auth page if no user and not on auth page
  if (!user && pathname !== '/auth') {
    return (
      <div className="flex h-full bg-brand-gray1">
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="relative z-10 flex-shrink-0 border-b border-brand-gray2/50 bg-brand-gray1">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 sm:py-3">
                <div className="flex items-center mb-4 sm:mb-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-brand-white truncate">Quality Management Systems</h1>
                </div>
                <div className="flex items-center gap-4">
                  <div className="animate-pulse bg-brand-gray2 h-6 w-6 rounded"></div>
                  <div className="animate-pulse bg-brand-gray2 h-8 w-8 rounded-full"></div>
                  <LogoutButton />
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto bg-brand-gray1 p-4">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Main layout with sidebar
  return (
    <div className="flex h-full bg-brand-gray1">
      {shouldShowSidebar && (
        <SidebarNav 
          isOpen={sidebarOpen} 
          onClose={handleSidebarClose}
        />
      )}
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="relative z-10 flex-shrink-0 border-b border-brand-gray2/50 bg-brand-gray1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 sm:py-3">
              {/* Logo/Title Section */}
              <div className="flex items-center mb-4 sm:mb-0">
                {shouldShowSidebar && (
                  <MobileMenuButton onClick={handleSidebarToggle} isOpen={sidebarOpen} />
                )}
                <h1 className="text-xl sm:text-2xl font-bold text-brand-white truncate">
                  Quality Management Systems
                </h1>
              </div>

              {/* Navigation Buttons */}
              {user && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  {/* Home and Business Areas - Stack on mobile, inline on desktop */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Link
                      href="/dashboard"
                      className="flex items-center justify-center w-10 h-10 sm:w-8 sm:h-8 rounded-lg sm:rounded-full bg-brand-gray2/50 hover:bg-brand-gray2 text-white hover:text-blue-400 transition-colors"
                      aria-label="Go to home page"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 sm:w-6 sm:h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                        />
                      </svg>
                    </Link>
                    <Link
                      href="/management-report"
                      className="px-3 py-2 sm:px-3 sm:py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium text-sm transition-colors whitespace-nowrap"
                      aria-label="View Management Report"
                    >
                      Management Report
                    </Link>
                  </div>

                  {/* Profile and Logout - Always on the right */}
                  <div className="flex items-center gap-2 sm:gap-3 ml-auto sm:ml-0">
                    <Link
                      href="/profile/edit"
                      className="flex items-center justify-center w-10 h-10 sm:w-8 sm:h-8 rounded-lg sm:rounded-full bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
                      aria-label="Edit user profile"
                    >
                      {getInitials(user.username)}
                    </Link>
                    <LogoutButton />
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto bg-brand-gray1 p-4">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
} 