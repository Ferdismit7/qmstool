'use client';

import Link from 'next/link';

const navigationCards = [
  {
    title: 'Document Registry',
    description: 'Manage and track all business documents',
    href: '/documents',
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    title: 'Quality Objectives',
    description: 'Set and monitor quality objectives',
    href: '/business-quality-objectives',
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    title: 'Business Processes',
    description: 'View and manage business processes',
    href: '/processes',
    color: 'bg-purple-500 hover:bg-purple-600'
  },
  {
    title: 'Risks Management',
    description: 'Identify and manage business risks',
    href: '/risk-management',
    color: 'bg-red-500 hover:bg-red-600'
  },
  {
    title: 'Performance Monitoring',
    description: 'Track and manage business performance monitoring',
    href: '/performance-monitoring',
    color: 'bg-yellow-500 hover:bg-yellow-600'
  },
  {
    title: 'Business Improvements',
    description: 'Monitor and implement improvements',
    href: '/business-improvements',
    color: 'bg-indigo-500 hover:bg-indigo-600'
  },
  {
    title: 'Business Complaints',
    description: 'Handle and track customer complaints',
    href: '/business-complaints',
    color: 'bg-pink-500 hover:bg-pink-600'
  },
  {
    title: 'Business Nonconformities',
    description: 'Manage and resolve nonconformities',
    href: '/business-nonconformities',
    color: 'bg-orange-500 hover:bg-orange-600'
  },
  {
    title: 'Business Audits',
    description: 'Schedule and track business audits',
    href: '/business-audits',
    color: 'bg-teal-500 hover:bg-teal-600'
  },
  {
    title: 'Management Review',
    description: 'Conduct and document management reviews',
    href: '/business-management-review',
    color: 'bg-cyan-500 hover:bg-cyan-600'
  }
];

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-brand-white mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {navigationCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="block transform transition-all duration-200 hover:scale-105"
          >
            <div className={`${card.color} rounded-lg shadow-lg p-6 h-full`}>
              <h2 className="text-xl font-bold text-white mb-2">{card.title}</h2>
              <p className="text-white/90">{card.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 