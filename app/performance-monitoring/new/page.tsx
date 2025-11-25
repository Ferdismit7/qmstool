'use client';

import React from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiX } from 'react-icons/fi';
import PerformanceMonitoringForm from '@/app/components/PerformanceMonitoringForm';

export default function NewPerformanceMonitoringPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/performance-monitoring"
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/60 text-gray-200 text-xs rounded-md hover:bg-gray-800/80 transition-colors shadow-sm border border-gray-700/50"
            title="Back to performance monitoring"
          >
            <FiArrowLeft size={12} />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-white">New Performance Monitoring Control</h1>
            <p className="text-brand-gray3 mt-1">Create a new performance monitoring control</p>
          </div>
        </div>
        <Link
          href="/performance-monitoring"
          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/60 text-gray-200 text-xs rounded-md hover:bg-gray-800/80 transition-colors shadow-sm border border-gray-700/50"
        >
          <FiX size={12} />
          Cancel
        </Link>
      </div>

      {/* Performance Monitoring Form */}
      <div className="bg-brand-gray2/50 rounded-lg border border-brand-gray1 p-6">
        <PerformanceMonitoringForm mode="create" />
      </div>
    </div>
  );
} 