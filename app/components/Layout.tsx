'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import SidebarNav from './SidebarNav';
import LogoutButton from './LogoutButton';
import Link from 'next/link';

const SIDEBAR_WIDTH = 'w-56'; // 14rem
const HEADER_HEIGHT = 'h-16'; // 4rem

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ username: string } | null>(null);

  const isAssessmentPage =
    pathname.startsWith('/qms-assessments') ||
    pathname === '/qms-internal-assessment';

  // Check if we should show the sidebar (exclude dashboard and auth pages)
  const shouldShowSidebar = pathname !== '/dashboard' && pathname !== '/auth';

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (token) {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const userData = await response.json();
            console.log('Fetched user data:', userData); // Debug log
            setUser(userData);
          } else {
            console.log('Failed to fetch user data, response not ok'); // Debug log
            setUser(null);
          }
        } else {
          console.log('No token found'); // Debug log
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setUser(null);
      }
    };

    fetchUser();
  }, []); // Remove pathname dependency to avoid unnecessary re-fetches

  // Listen for storage changes (when authToken is updated)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        console.log('Auth token changed, refetching user data'); // Debug log
        // Refetch user data when authToken changes
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (token) {
          fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })
          .then(response => response.ok ? response.json() : null)
          .then(userData => {
            console.log('Refetched user data:', userData); // Debug log
            setUser(userData);
          })
          .catch(() => setUser(null));
        } else {
          setUser(null);
        }
      }
    };

    // Also listen for custom events when token changes in the same window
    const handleTokenChange = () => {
      console.log('Custom token change event detected'); // Debug log
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (token) {
        fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        .then(response => response.ok ? response.json() : null)
        .then(userData => {
          console.log('Refetched user data from custom event:', userData); // Debug log
          setUser(userData);
        })
        .catch(() => setUser(null));
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
  }, []);

  const getInitials = (username: string) => {
    const initial = username.charAt(0).toUpperCase();
    console.log('Getting initial for username:', username, 'Initial:', initial); // Debug log
    return initial;
  };

  return (
    <div className="flex h-full bg-brand-gray1">
      {/* Fixed-width Sidebar */}
      {shouldShowSidebar && (
        <aside className={`h-full ${SIDEBAR_WIDTH} flex-shrink-0`}>
          <SidebarNav />
        </aside>
      )}

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header
          className={`relative z-10 flex h-16 flex-shrink-0 items-center justify-between border-b border-brand-gray2/50 bg-brand-gray1 px-4 sm:px-6 lg:px-8`}
        >
          <h1 className="text-2xl font-bold text-brand-white">Quality Management Systems</h1>
          <div className="flex items-center gap-4">
            {user && (
              <Link
                href="/dashboard"
                className="text-white hover:text-blue-400 transition-colors"
                aria-label="Go to home page"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                  />
                </svg>
              </Link>
            )}
            {user && (
              <Link
                href="/profile/edit"
                className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
                aria-label="Edit user profile"
              >
                {getInitials(user.username)}
              </Link>
            )}
            <LogoutButton />
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