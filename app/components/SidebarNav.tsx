'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiLayers, FiFileText } from 'react-icons/fi';

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="w-56 h-screen sticky top-0 left-0 z-30 flex flex-col bg-brand-black1/50 backdrop-blur-xl border-r border-brand-gray1 shadow-xl">
      <div className="h-20 flex items-center px-6 border-b border-brand-dark">
        <span className="text-2xl font-bold tracking-wide flex items-center gap-3">
          <FiLayers className="text-brand-primary" size={32} /> QMS Tool
        </span>
      </div>
      <nav className="flex-1 py-8 px-2">
        <ul className="space-y-2">
          <li>
            <Link href="/" className={`flex items-center gap-4 px-4 py-3 rounded-xl font-semibold shadow text-lg transition-all
              ${pathname === '/' ? 'bg-brand-primary/60 text-brand-white' : 'hover:bg-brand-primary/60 text-brand-white'}`}
            >
              <FiLayers size={22} />
              Business Process Registry
            </Link>
          </li>
          <li>
            <Link href="/documents" className={`flex items-center gap-4 px-4 py-3 rounded-xl font-semibold shadow text-lg transition-all
              ${pathname === '/documents' ? 'bg-brand-primary/60 text-brand-white' : 'hover:bg-brand-primary/60 text-brand-white'}`}
            >
              <FiFileText size={22} />
              Business Document Registry
            </Link>
          </li>
        </ul>
      </nav>
      <div className="px-6 py-6 border-t border-brand-dark text-xs text-brand-gray3">
        &copy; {new Date().getFullYear()} Ferdinand Smit
      </div>
    </aside>
  );
} 