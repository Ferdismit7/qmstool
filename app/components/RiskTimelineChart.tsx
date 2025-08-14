'use client';

import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface RiskHistoryData {
  id: number;
  racm_matrix_id: number;
  inherent_risk_score: number | null;
  change_date: string;
  change_type: 'insert' | 'update';
  created_at: string;
}

interface RiskCreationData {
  inherent_risk_score: number | null;
  created_at: string;
}

interface TimelineData {
  month_start: string;
  month_end: string;
  inherent_risk_score: number | null;
  last_change_date: string;
  last_change_type: string;
  month_key: string;
  month_label: string;
}

interface RiskTimelineResponse {
  creation: RiskCreationData;
  history: RiskHistoryData[];
  timeline: TimelineData[];
}

interface RiskTimelineChartProps {
  riskId: number;
  processName: string;
}

export default function RiskTimelineChart({ riskId, processName }: RiskTimelineChartProps) {
  const [timelineData, setTimelineData] = useState<RiskTimelineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        const response = await fetch(`/api/risk-management/${riskId}/history`);
        if (!response.ok) {
          throw new Error('Failed to fetch timeline data');
        }
        const data = await response.json();
        setTimelineData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load timeline');
      } finally {
        setLoading(false);
      }
    };

    fetchTimelineData();
  }, [riskId]);

  const generateTimelineData = () => {
    if (!timelineData || !timelineData.timeline || timelineData.timeline.length === 0) {
      console.log('No timeline data available');
      return { labels: [], datasets: [] };
    }

    // Use the timeline data directly from the database
    const labels = timelineData.timeline.map(item => item.month_label);
    const inherentScores = timelineData.timeline.map(item => item.inherent_risk_score);

    const chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Inherent Risk Score',
          data: inherentScores,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.1,
          pointRadius: 6,
          pointHoverRadius: 8,
          fill: false,
        }
      ]
    };
    
    return chartData;
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#ffffff',
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: `Risk Score Timeline - ${processName}`,
        color: '#ffffff',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#ffffff',
        borderWidth: 1,
        callbacks: {
          title: function(context) {
            return context[0].label;
          },
          label: function(context) {
            const dataIndex = context.dataIndex;
            const timelineItem = timelineData?.timeline[dataIndex];
            if (timelineItem) {
              const changeDate = new Date(timelineItem.last_change_date).toLocaleDateString();
              const changeType = timelineItem.last_change_type === 'insert' ? 'Created' : 'Updated';
              return [
                `Risk Score: ${context.parsed.y}`,
                `${changeType}: ${changeDate}`
              ];
            }
            return `Risk Score: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Change Date',
          color: '#ffffff',
          font: {
            size: 14
          }
        },
        ticks: {
          color: '#ffffff',
          maxRotation: 45,
          minRotation: 45
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Risk Score',
          color: '#ffffff',
          font: {
            size: 14
          }
        },
        ticks: {
          color: '#ffffff',
          stepSize: 2
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        min: 0,
        max: 25
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-800 rounded-lg">
        <div className="text-white">Loading timeline data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-800 rounded-lg">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  if (!timelineData || !timelineData.timeline || timelineData.timeline.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-800 rounded-lg">
        <div className="text-gray-400">No timeline data available</div>
      </div>
    );
  }

  const chartData = generateTimelineData();

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="h-96">
        <Line data={chartData} options={chartOptions} />
      </div>
      <div className="mt-4 text-sm text-gray-400">
        <p>• Inherent Risk Score: Risk level before controls are applied</p>
        <p>• Timeline shows actual change points from database</p>
        <p>• Each point represents when the risk score was created or updated</p>
        <p>• Hover over points to see when the score was changed</p>
      </div>
    </div>
  );
} 