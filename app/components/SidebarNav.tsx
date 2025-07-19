'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FiLayers, FiFileText, FiTarget, FiActivity, FiAlertTriangle, FiBarChart2, FiList, FiMenu, FiX } from 'react-icons/fi';

interface SidebarNavProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function SidebarNav({ isOpen = false, onClose }: SidebarNavProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Debug logging
  console.log('SidebarNav props:', { isOpen, onClose: !!onClose });
  console.log('SidebarNav state:', { isMobile, isHydrated });

  // Check if we're on mobile and handle hydration - run immediately
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
    };

    // Set initial state immediately and mark as hydrated
    checkMobile();
    setIsHydrated(true);

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navigationItems = [
    {
      href: '/processes',
      icon: FiLayers,
      label: 'Business Process Registry'
    },
    {
      href: '/documents',
      icon: FiFileText,
      label: 'Business Document Registry'
    },
    {
      href: '/business-quality-objectives',
      icon: FiTarget,
      label: 'Business Quality Objectives'
    },
    {
      href: '/performance-monitoring',
      icon: FiActivity,
      label: 'Performance Monitoring'
    },
    {
      href: '/risk-management',
      icon: FiAlertTriangle,
      label: 'Risk Management'
    },
    {
      href: '/qms-status-overview',
      icon: FiBarChart2,
      label: 'QMS Status Overview'
    },
    {
      href: '/qms-assessments',
      icon: FiList,
      label: 'View Assessments'
    },
    {
      href: '/operations-summary',
      icon: FiBarChart2,
      label: 'Operations Summary'
    }
  ];

  // Don't render anything until hydration is complete
  if (!isHydrated) {
    return null;
  }

  // Desktop Sidebar - Always visible on desktop
  if (!isMobile) {
    return (
      <aside className="w-56 h-full sticky top-0 left-0 z-30 flex flex-col bg-brand-black1/40 backdrop-blur-xl border-r border-brand-gray1 shadow-xl">
        {/* Desktop Header */}
        <div className="h-40 flex items-center px-6">
          <span className="text-2xl font-bold tracking-wide flex items-center gap-3">
            <FiLayers className="text-brand-primary" size={32} />
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 px-2">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <li key={item.href}>
                  <Link 
                    href={item.href} 
                    className={`
                      flex items-start gap-3 px-3 py-2 rounded-lg font-medium shadow text-sm transition-all
                      ${isActive 
                        ? 'bg-brand-primary/60 text-brand-white' 
                        : 'hover:bg-brand-primary/60 text-brand-white'
                      }
                    `}
                  >
                    <Icon size={18} className="flex-shrink-0 mt-0.5" />
                    <span className="leading-tight break-words">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-brand-gray1 text-xs text-brand-gray3">
          &copy; {new Date().getFullYear()} Ailura
        </div>
      </aside>
    );
  }

  // Mobile Sidebar - Only render when mobile is detected
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] 
        flex flex-col bg-brand-black1/40 backdrop-blur-xl border-r border-brand-gray1 shadow-xl
        transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
      `}>
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-brand-gray1">
          <div className="flex items-center gap-3">
            <FiLayers className="text-brand-primary" size={24} />
            <span className="text-lg font-bold text-brand-white">QMS</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-brand-gray3 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 px-2">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <li key={item.href}>
                  <Link 
                    href={item.href} 
                    className={`
                      flex items-start gap-3 px-3 py-3 rounded-lg font-medium shadow text-sm transition-all
                      ${isActive 
                        ? 'bg-brand-primary/60 text-brand-white' 
                        : 'hover:bg-brand-primary/60 text-brand-white'
                      }
                    `}
                    onClick={onClose}
                  >
                    <Icon size={20} className="flex-shrink-0 mt-0.5" />
                    <span className="leading-tight break-words">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-brand-gray1 text-xs text-brand-gray3">
          &copy; {new Date().getFullYear()} Ailura
        </div>
      </aside>
    </>
  );
}

// Mobile Menu Button Component
export function MobileMenuButton({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 text-brand-gray3 hover:text-brand-white transition-colors"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
    </button>
  );
} 