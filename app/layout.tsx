import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Layout from './components/Layout';

const inter = Inter({ subsets: ['latin'] });

// Set the app's metadata, including the browser tab title
export const metadata: Metadata = {
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
      <body className={inter.className}>
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}