'use client';

import React from 'react';
import RiskManagementForm from '@/app/components/RiskManagementForm';

export default function NewRiskManagementPage() {
  return (
    <div className="w-full px-2 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-white mb-2">Add New Risk Control</h1>
        <p className="text-brand-gray3">Create a new risk assessment and control matrix entry</p>
      </div>

      <RiskManagementForm />
    </div>
  );
} 