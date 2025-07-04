'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiLayers, FiFileText, FiTarget, FiActivity, FiAlertTriangle, FiBarChart2, FiList } from 'react-icons/fi';

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="w-56 h-full sticky top-0 left-0 z-30 flex flex-col bg-brand-black1/40 backdrop-blur-xl border-r border-brand-gray1 shadow-xl">
      <div className="h-40 flex items-center px-6">
        <span className="text-2xl font-bold tracking-wide flex items-center gap-3">
          <FiLayers className="text-brand-primary" size={32} />
        </span>
      </div>
      <nav className="flex-1 py-8 px-2">
        <ul className="space-y-2">
          <li>
            <Link href="/processes" className={`flex items-center gap-4 px-4 py-3 rounded-xl font-semibold shadow text-lg transition-all
              ${pathname === '/processes' ? 'bg-brand-primary/60 text-brand-white' : 'hover:bg-brand-primary/60 text-brand-white'}`}
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
          <li>
            <Link href="/business-quality-objectives" className={`flex items-center gap-4 px-4 py-3 rounded-xl font-semibold shadow text-lg transition-all
              ${pathname === '/business-quality-objectives' ? 'bg-brand-primary/60 text-brand-white' : 'hover:bg-brand-primary/60 text-brand-white'}`}
            >
              <FiTarget size={22} />
              Business Quality Objectives
            </Link>
          </li>
          <li>
            <Link href="/performance-monitoring" className={`flex items-center gap-4 px-4 py-3 rounded-xl font-semibold shadow text-lg transition-all
              ${pathname === '/performance-monitoring' ? 'bg-brand-primary/60 text-brand-white' : 'hover:bg-brand-primary/60 text-brand-white'}`}
            >
              <FiActivity size={22} />
              Performance Monitoring
            </Link>
          </li>
          <li>
            <Link href="/risk-management" className={`flex items-center gap-4 px-4 py-3 rounded-xl font-semibold shadow text-lg transition-all
              ${pathname === '/risk-management' ? 'bg-brand-primary/60 text-brand-white' : 'hover:bg-brand-primary/60 text-brand-white'}`}
            >
              <FiAlertTriangle size={22} />
              Risk Management
            </Link>
          </li>
          <li>
            <Link href="/qms-status-overview" className={`flex items-center gap-4 px-4 py-3 rounded-xl font-semibold shadow text-lg transition-all
              ${pathname === '/qms-status-overview' ? 'bg-brand-primary/60 text-brand-white' : 'hover:bg-brand-primary/60 text-brand-white'}`}
            >
              <FiBarChart2 size={22} />
              QMS Status Overview
            </Link>
          </li>
          <li>
            <Link href="/qms-assessments" className={`flex items-center gap-4 px-4 py-3 rounded-xl font-semibold shadow text-lg transition-all
              ${pathname === '/qms-assessments' ? 'bg-brand-primary/60 text-brand-white' : 'hover:bg-brand-primary/60 text-brand-white'}`}
            >
              <FiList size={22} />
              View Assessments
            </Link>
          </li>
          <li>
            <Link href="/operations-summary" className={`flex items-center gap-4 px-4 py-3 rounded-xl font-semibold shadow text-lg transition-all
              ${pathname === '/operations-summary' ? 'bg-brand-primary/60 text-brand-white' : 'hover:bg-brand-primary/60 text-brand-white'}`}
            >
              <FiBarChart2 size={22} />
              Operations Summary
            </Link>
          </li>
        </ul>
      </nav>
      <div className="px-6 py-3 border-t border-brand-gray1 text-xs text-brand-gray3">
        &copy; {new Date().getFullYear()} Ailura
      </div>
    </aside>
  );
} 