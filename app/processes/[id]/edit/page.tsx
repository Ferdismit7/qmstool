'use client';

import React, { useEffect, useState } from 'react';
import BusinessProcessForm from '@/app/components/BusinessProcessForm';

interface BusinessProcess {
  id: number;
  business_area: string;
  sub_business_area: string;
  process_name: string;
  document_name: string;
  version: string;
  progress: string;
  doc_status: string;
  status_percentage: number;
  priority: string;
  target_date: string;
  process_owner: string;
  remarks: string;
  review_date: string;
}

export default function EditBusinessProcessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [process, setProcess] = useState<BusinessProcess | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProcess = async () => {
      try {
        const { id } = await params;
        const response = await fetch(`/api/business-processes/${id}`);
        if (!response.ok) throw new Error('Failed to fetch process');
        const data = await response.json();
        
        // Transform the API response to match the form component's expected format
        const mapProgressValue = (progress: string) => {
          switch (progress?.toLowerCase()) {
            case 'not started':
              return 'Not Started';
            case 'on-track':
            case 'on track':
              return 'On-Track';
            case 'completed':
              return 'Completed';
            case 'minor challenges':
              return 'Minor Challenges';
            case 'major challenges':
              return 'Major Challenges';
            default:
              return progress || '';
          }
        };

        const mapDocStatusValue = (status: string) => {
          switch (status?.toLowerCase()) {
            case 'to be reviewed':
              return 'To be reviewed';
            case 'in progress':
              return 'In progress';
            case 'new':
              return 'New';
            case 'completed':
              return 'Completed';
            default:
              return status || '';
          }
        };

        const mapPriorityValue = (priority: string) => {
          switch (priority?.toLowerCase()) {
            case 'low':
              return 'Low';
            case 'medium':
              return 'Medium';
            case 'high':
              return 'High';
            case 'critical':
              return 'Critical';
            default:
              return priority || 'Medium';
          }
        };

        const transformedData = {
          id: data.id,
          business_area: data.businessArea || '',
          sub_business_area: data.subBusinessArea || '',
          process_name: data.processName || '',
          document_name: data.documentName || '',
          version: data.version || '1.0',
          progress: mapProgressValue(data.progress),
          doc_status: mapDocStatusValue(data.docStatus),
          status_percentage: data.statusPercentage || 0,
          priority: mapPriorityValue(data.priority),
          target_date: data.targetDate ? new Date(data.targetDate).toISOString().split('T')[0] : '',
          process_owner: data.processOwner || '',
          remarks: data.remarks || '',
          review_date: data.reviewDate ? new Date(data.reviewDate).toISOString().split('T')[0] : ''
        };
        
        setProcess(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProcess();
  }, [params]);

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;
  if (!process) return <div className="text-center py-4">Process not found</div>;

  return (
    <div className="w-full px-2 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-white mb-2">Edit Business Process</h1>
        <p className="text-brand-gray2">Update the business process details</p>
      </div>
      <BusinessProcessForm mode="edit" process={process} />
    </div>
  );
} 