'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import SidebarNav, { MobileMenuButton } from './SidebarNav';
import LogoutButton from './LogoutButton';
import Link from 'next/link';



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

  // Helper function to get token from all possible sources
  const getAuthToken = () => {
    // Check sessionStorage first (default for non-remembered logins)
    let token = sessionStorage.getItem('authToken');
    console.log('sessionStorage token:', token ? 'Found' : 'Not found');
    // If not in sessionStorage, check localStorage (for remembered logins)
    if (!token) {
      token = localStorage.getItem('authToken');
      console.log('localStorage token:', token ? 'Found' : 'Not found');
    }
    // If still no token, check cookies (for server-side compatibility)
    if (!token) {
      const cookies = document.cookie.split(';');
      const authCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='));
      if (authCookie) {
        token = authCookie.split('=')[1];
        console.log('Cookie token: Found');
      } else {
        console.log('Cookie token: Not found');
      }
    }
    console.log('Final token result:', token ? 'Token available' : 'No token found');
    return token;
  };

  // Helper function to decode JWT token (client-side, for display purposes only)
  const decodeToken = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  };

  const fetchUserData = useCallback(async (token: string) => {
    setIsLoading(true);
    try {
      console.log('Attempting to fetch user data with token:', token);
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          setUser(null);
        } else {
          console.log('API error but keeping token - might be temporary issue');
          const tokenData = decodeToken(token);
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
      const tokenData = decodeToken(token);
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
      
      const token = getAuthToken();
      console.log('Initial token check:', token ? 'Token found' : 'No token');
      
      if (token) {
        // First, try to create a temporary user state from the token
        const tokenData = decodeToken(token);
        if (tokenData && tokenData.username) {
          console.log('Setting temporary user state from token:', tokenData);
          setUser({ username: tokenData.username });
        }
        
        // Then try to fetch the full user data
        await fetchUserData(token);
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    };

    // Add a small delay to ensure DOM is ready and cookies are accessible
    // Use a shorter delay for better user experience
    const timer = setTimeout(initializeAuth, 50);
    
    return () => clearTimeout(timer);
  }, [fetchUserData]); // Add fetchUserData to dependencies

  // Listen for storage changes (when authToken is updated)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        console.log('Auth token changed, refetching user data');
        const token = getAuthToken();
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
      const token = getAuthToken();
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
  }, [fetchUserData]); // Add fetchUserData to dependencies

  useEffect(() => {
    if (!isLoading && !user && pathname !== '/auth') {
      router.replace('/auth');
    }
  }, [isLoading, user, pathname, router]); // Add router to dependencies

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

  // Redirect to auth if no user and not on auth page
  if (!user && pathname !== '/auth') {
    router.replace('/auth');
    return (
      <div className="flex h-full bg-brand-gray1">
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="relative z-10 flex-shrink-0 border-b border-brand-gray2/50 bg-brand-gray1">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 sm:py-3">
                <div className="flex items-center mb-4 sm:mb-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-brand-white truncate">Quality Management Systems</h1>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto bg-brand-gray1 p-4">
            <div className="flex items-center justify-center h-full">
              <div className="text-brand-white">Redirecting to login...</div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-brand-gray1">
      {/* Responsive Sidebar - Always render but control visibility */}
      <SidebarNav 
        isOpen={shouldShowSidebar ? sidebarOpen : false} 
        onClose={handleSidebarClose} 
      />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Responsive Header Banner */}
        <header className="relative z-10 flex-shrink-0 border-b border-brand-gray2/50 bg-brand-gray1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 sm:py-3">
              {/* Logo/Title Section */}
              <div className="flex items-center mb-4 sm:mb-0">
                <h1 className="text-xl sm:text-2xl font-bold text-brand-white truncate">
                  Quality Management Systems
                </h1>
              </div>

              {/* Navigation Buttons */}
              {user && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  {/* Mobile Menu Button */}
                  {shouldShowSidebar && (
                    <MobileMenuButton 
                      onClick={handleSidebarToggle} 
                      isOpen={sidebarOpen} 
                    />
                  )}

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
                      href="/operational-report/business-areas"
                      className="px-3 py-2 sm:px-3 sm:py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium text-sm transition-colors whitespace-nowrap"
                      aria-label="View Business Areas"
                    >
                      Business Areas
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
          {children}
        </main>
      </div>
    </div>
  );
} 