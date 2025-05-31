'use client';

import React from 'react';
import BusinessQualityObjectiveForm from '@/app/components/BusinessQualityObjectiveForm';

export default function NewBusinessQualityObjectivePage() {
  return (
    <div className="w-full px-2 py-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-white mb-2">New Business Quality Objective</h1>
        <p className="text-brand-gray2">Create a new business quality objective</p>
      </div>
      <BusinessQualityObjectiveForm mode="create" />
    </div>
  );
} 