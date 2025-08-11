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
            className="p-2 text-brand-gray3 hover:text-brand-white transition-colors"
            title="Back to performance monitoring"
          >
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-white">New Performance Monitoring Control</h1>
            <p className="text-brand-gray3 mt-1">Create a new performance monitoring control</p>
          </div>
        </div>
        <Link
          href="/performance-monitoring"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-gray1 text-brand-white rounded-lg hover:bg-brand-gray1/80 transition-colors"
        >
          <FiX size={16} />
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