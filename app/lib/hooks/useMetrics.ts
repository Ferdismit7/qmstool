import { useState, useEffect } from 'react';

interface Metrics {
  businessQuality: {
    totalObjectives: number;
    byCategory: Record<string, number>;
    byProgress: Record<string, number>;
    byFrequency: Record<string, number>;
    overallProgress: number;
    statusDistribution: Record<string, number>;
    kpiMetrics: {
      totalKPIs: number;
      completedKPIs: number;
      inProgressKPIs: number;
      notStartedKPIs: number;
      averageProgress: number;
    };
  };
  performance: {
    totalReports: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
    byStatus: Record<string, number>;
    overallProgress: number;
    statusDistribution: Record<string, number>;
    complianceMetrics: {
      totalReports: number;
      compliant: number;
      nonCompliant: number;
      inProgress: number;
      complianceRate: number;
    };
  };
  risk: {
    totalRisks: number;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
    byStatus: Record<string, number>;
    overallProgress: number;
    statusDistribution: Record<string, number>;
    riskMetrics: {
      totalRisks: number;
      highRisk: number;
      mediumRisk: number;
      lowRisk: number;
      mitigated: number;
      inProgress: number;
    };
  };
}

export function useMetrics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/metrics/calculate');
        if (!response.ok) {
          throw new Error('Failed to fetch metrics');
        }
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return { metrics, loading, error };
} 