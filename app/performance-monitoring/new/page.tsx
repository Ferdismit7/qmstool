'use client';

import React from 'react';
import PerformanceMonitoringForm from '@/app/components/PerformanceMonitoringForm';

export default function NewPerformanceMonitoringPage() {
  return (
    <div className="w-full px-2 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-white mb-2">New Performance Monitoring Control</h1>
        <p className="text-brand-gray3">Create a new performance monitoring control</p>
      </div>
      <PerformanceMonitoringForm mode="create" />
    </div>
  );
} 