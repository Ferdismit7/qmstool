import './globals.css';
import React from 'react';
import Link from 'next/link';
import { FiLayers } from 'react-icons/fi';

// Set the app's metadata, including the browser tab title
export const metadata = {
  title: 'QMS Tool', // This will show in the browser tab
  description: 'Business Process Registry and QMS Management Tool',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen bg-gradient-to-br from-brand-dark via-brand-gray1 to-brand-primary text-brand-white">
          {/* Sidebar */}
          <aside className="w-56 h-screen sticky top-0 left-0 z-30 flex flex-col bg-brand-black1/50 backdrop-blur-xl border-r border-brand-gray1 shadow-xl">
            <div className="h-20 flex items-center px-6 border-b border-brand-dark">
              <span className="text-2xl font-bold tracking-wide flex items-center gap-3">
                <FiLayers className="text-brand-primary" size={32} /> QMS Tool
              </span>
            </div>
            <nav className="flex-1 py-8 px-2">
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="flex items-center gap-4 px-4 py-3 rounded-xl bg-brand-primary/60 text-brand-white font-semibold shadow hover:bg-brand-primary hover:text-brand-white transition-all text-lg">
                    <FiLayers size={22} />
                    Business Process Registry
                  </Link>
                </li>
              </ul>
            </nav>
            <div className="px-6 py-6 border-t border-brand-dark text-xs text-brand-gray3">
              &copy; {new Date().getFullYear()} Ferdinand Smit
            </div>
          </aside>
          {/* Main Content */}
          <main className="flex-1 min-h-screen p-0 bg-gradient-to-br from-brand-black1/50 to-brand-black1/80">
            <div className="max-w-[2000px] mx-auto py-10 px-2 lg:px-6">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}
