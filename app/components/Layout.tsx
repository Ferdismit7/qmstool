'use client';

import { usePathname } from 'next/navigation';
import SidebarNav from './SidebarNav';
import LogoutButton from './LogoutButton';
import Link from 'next/link';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-brand-dark/20">
      <header className="bg-brand-gray1/90 p-1">
        <div className="container mx-full px-5 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-brand-white">Quality Management Systems</h1>
          <div className="flex items-center gap-4">
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
            <LogoutButton />
          </div>
        </div>
      </header>
      <div className="flex min-h-screen bg-gradient-to-br from-brand-dark via-brand-gray1 to-brand-primary text-brand-white">
        {/* Sidebar: only show if not on /dashboard */}
        {pathname !== '/dashboard' && <SidebarNav />}
        {/* Main Content */}
        <main className="flex-1 min-h-screen p-0 bg-gradient-to-br from-brand-black1/50 to-brand-black1/80">
          <div className="w-full py-10 px-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 