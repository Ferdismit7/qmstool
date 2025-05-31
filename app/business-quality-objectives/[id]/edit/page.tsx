'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BusinessQualityObjectiveForm from '@/app/components/BusinessQualityObjectiveForm';

interface BusinessQualityObjective {
  id: number;
  category: string;
  business_area: string;
  sub_business_area: string;
  qms_main_objectives: string;
  qms_objective_description: string;
  kpi_or_sla_targets: string;
  performance_monitoring: string;
  proof_of_measuring: string;
  proof_of_reporting: string;
  frequency: string;
  responsible_person_team: string;
  review_date: string;
  progress: string;
  status_percentage: number;
}

export default function EditBusinessQualityObjectivePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [objective, setObjective] = useState<BusinessQualityObjective | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchObjective = async () => {
      try {
        const response = await fetch(`/api/business-quality-objectives/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch objective');
        const data = await response.json();
        setObjective(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchObjective();
  }, [params.id]);

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;
  if (!objective) return <div className="text-center py-4">Objective not found</div>;

  return (
    <div className="w-full px-2 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-white mb-2">Edit Business Quality Objective</h1>
        <p className="text-brand-gray2">Update the business quality objective details</p>
      </div>
      <BusinessQualityObjectiveForm mode="edit" objective={objective} />
    </div>
  );
} 