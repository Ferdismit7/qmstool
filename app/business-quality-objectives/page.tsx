'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaPlus } from 'react-icons/fa';
import BusinessQualityObjectivesTable from '@/app/components/BusinessQualityObjectivesTable';

export default function BusinessQualityObjectivesPage() {
  const router = useRouter();

  return (
    <div className="w-full px-2 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-white mb-2">Business Quality Objectives</h1>
            <p className="text-brand-gray2">Manage and track your business quality objectives and KPIs</p>
          </div>
          <button
            onClick={() => router.push('/business-quality-objectives/new')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-blue text-brand-white hover:bg-brand-blue/90 transition-colors"
          >
            <FaPlus /> Add Objective
          </button>
        </div>
      </div>
      <BusinessQualityObjectivesTable />
    </div>
  );
} 