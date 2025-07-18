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
  residual_risk_overall_score: number | null;
  change_date: string;
  change_type: 'created' | 'updated';
  created_at: string;
}

interface RiskCreationData {
  inherent_risk_score: number | null;
  residual_risk_overall_score: number | null;
  created_at: string;
}

interface RiskTimelineResponse {
  creation: RiskCreationData;
  history: RiskHistoryData[];
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
    if (!timelineData) {
      console.log('No timeline data available');
      return { labels: [], datasets: [] };
    }

    console.log('Timeline data:', timelineData);
    
    // Create the creation point
    const creationPoint = {
      change_date: timelineData.creation.created_at,
      inherent_risk_score: timelineData.creation.inherent_risk_score,
      residual_risk_overall_score: timelineData.creation.residual_risk_overall_score,
      change_type: 'created'
    };

    // Combine creation point with history updates
    const allData = [creationPoint, ...timelineData.history];
    
    // Sort by change date
    const sortedData = allData.sort((a, b) => 
      new Date(a.change_date).getTime() - new Date(b.change_date).getTime()
    );
    console.log('Sorted data:', sortedData);

    // Get all unique dates from the data
    const allDates = sortedData.map(record => new Date(record.change_date));
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    
    console.log('Date range:', { minDate, maxDate });

    // Create labels for each month from min date to max date
    const labels: string[] = [];
    const currentDate = new Date(minDate);
    currentDate.setDate(1); // Start from first day of month
    
    while (currentDate <= maxDate) {
      labels.push(currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    console.log('Generated labels:', labels);

    // Generate scores for each month - only show data points where changes actually occurred
    const inherentScores: (number | null)[] = [];
    const residualScores: (number | null)[] = [];

    for (let i = 0; i < labels.length; i++) {
      let inherentScore: number | null = null;
      let residualScore: number | null = null;

      // Check if there's a record for this specific month
      const currentMonthDate = new Date(minDate);
      currentMonthDate.setMonth(currentMonthDate.getMonth() + i);
      
      const recordsForThisMonth = sortedData.filter(record => {
        const recordDate = new Date(record.change_date);
        const recordMonth = recordDate.getMonth();
        const recordYear = recordDate.getFullYear();
        const currentMonth = currentMonthDate.getMonth();
        const currentYear = currentMonthDate.getFullYear();
        return recordMonth === currentMonth && recordYear === currentYear;
      });

      if (recordsForThisMonth.length > 0) {
        // Use the most recent record for this month
        const mostRecentRecord = recordsForThisMonth[recordsForThisMonth.length - 1];
        inherentScore = mostRecentRecord.inherent_risk_score;
        residualScore = mostRecentRecord.residual_risk_overall_score;
      }

      inherentScores.push(inherentScore);
      residualScores.push(residualScore);
    }
    
    console.log('Generated inherent scores:', inherentScores);
    console.log('Generated residual scores:', residualScores);

    const chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Inherent Risk Score',
          data: inherentScores,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.1,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'Residual Risk Score',
          data: residualScores,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          tension: 0.1,
          pointRadius: 4,
          pointHoverRadius: 6,
        }
      ]
    };
    
    console.log('Generated chart data:', chartData);
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
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Month',
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
          stepSize: 5
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
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

  if (!timelineData) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-800 rounded-lg">
        <div className="text-gray-400">No timeline data available</div>
      </div>
    );
  }

  const chartData = generateTimelineData();
  
  console.log('Rendering chart with data:', chartData);

  // Create a simple test chart data to verify Chart.js is working
  const testChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Test Data',
        data: [10, 15, 20, 25, 30, 35],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1,
      }
    ]
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="mb-4 text-white">
        <h3 className="text-lg font-semibold mb-2">Debug Info:</h3>
        <p>History data length: {timelineData?.history.length || 0}</p>
        <p>Chart data labels: {chartData.labels.length}</p>
        <p>Chart data datasets: {chartData.datasets.length}</p>
      </div>
      
      <div className="h-80">
        {chartData.labels.length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <p>No chart data available</p>
              <p className="text-sm mt-2">Testing with sample data...</p>
              <div className="mt-4">
                <Line data={testChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 text-sm text-gray-400">
        <p>• Inherent Risk Score: Risk level before controls are applied</p>
        <p>• Residual Risk Score: Risk level after controls are implemented</p>
        <p>• Timeline shows monthly progression of risk scores</p>
      </div>
    </div>
  );
} 