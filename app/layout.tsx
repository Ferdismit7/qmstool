import './globals.css';
import React from 'react';
import SidebarNav from './components/SidebarNav';

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
          <SidebarNav />
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
