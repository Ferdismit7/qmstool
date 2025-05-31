'use client';

import React from 'react';
import BusinessQualityObjectivesTable from '@/app/components/BusinessQualityObjectivesTable';

export default function BusinessQualityObjectivesPage() {
  return (
    <div className="w-full px-2 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-white mb-2">Business Quality Objectives</h1>
        <p className="text-brand-gray2">Manage and track your business quality objectives and KPIs</p>
      </div>
      <BusinessQualityObjectivesTable />
    </div>
  );
} 