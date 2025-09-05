'use client';

import { useState, useEffect } from 'react';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';

interface ProgressEntry {
  id: number;
  month: number;
  year: number;
  percentage: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface ProgressChartProps {
  progressEntries: ProgressEntry[];
  objectiveName?: string;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export default function ProgressChart({ progressEntries }: ProgressChartProps) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [chartData, setChartData] = useState<{ month: string; percentage: number; fullDate: string; hasData: boolean }[]>([]);

  // Get available years
  const availableYears = Array.from(new Set(progressEntries.map(entry => entry.year))).sort((a, b) => b - a);

  useEffect(() => {
    if (availableYears.length > 0 && !selectedYear) {
      setSelectedYear(availableYears[0]); // Default to most recent year
    }
  }, [availableYears, selectedYear]);

  useEffect(() => {
    if (selectedYear) {
      const yearData = progressEntries
        .filter(entry => entry.year === selectedYear)
        .sort((a, b) => a.month - b.month);

      // Create data for all 12 months, filling in missing months with null
      const fullYearData = Array.from({ length: 12 }, (_, index) => {
        const monthData = yearData.find(entry => entry.month === index + 1);
        return {
          month: MONTHS[index],
          percentage: monthData ? monthData.percentage : 0,
          fullDate: monthData ? `${MONTHS[index]} ${selectedYear}` : `${MONTHS[index]} ${selectedYear} (No data)`,
          hasData: !!monthData
        };
      });

      setChartData(fullYearData);
    }
  }, [selectedYear, progressEntries]);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    if (percentage >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getBarColor = (percentage: number, hasData: boolean) => {
    if (!hasData) return 'bg-brand-gray2';
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Calculate trend
  const calculateTrend = () => {
    if (chartData.length < 2) return { direction: 'stable', change: 0 };
    
    const dataPoints = chartData.filter(d => d.percentage > 0);
    if (dataPoints.length < 2) return { direction: 'stable', change: 0 };
    
    const first = dataPoints[0].percentage;
    const last = dataPoints[dataPoints.length - 1].percentage;
    const change = last - first;
    
    if (change > 5) return { direction: 'up', change: change.toFixed(1) };
    if (change < -5) return { direction: 'down', change: Math.abs(change).toFixed(1) };
    return { direction: 'stable', change: change.toFixed(1) };
  };

  const trend = calculateTrend();

  if (progressEntries.length === 0) {
    return (
      <div className="bg-brand-gray2/50 rounded-lg border border-brand-gray1 p-6">
        <h3 className="text-lg font-semibold text-brand-white mb-4 flex items-center gap-2">
          <FiTrendingUp className="text-brand-primary" />
          Progress Chart
        </h3>
        <div className="text-center py-8">
          <p className="text-brand-gray3">No progress data available to display chart.</p>
        </div>
      </div>
    );
  }

  const maxPercentage = Math.max(...chartData.map(d => d.percentage), 100);

  return (
    <div className="bg-brand-gray2/50 rounded-lg border border-brand-gray1 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-brand-white flex items-center gap-2">
          <FiTrendingUp className="text-brand-primary" />
          Progress Chart
        </h3>
        
        {availableYears.length > 1 && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-brand-gray3">Year:</label>
            <select
              value={selectedYear || ''}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-1 rounded border border-brand-gray2 bg-brand-black1/30 text-brand-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Trend Indicator */}
      <div className="mb-6 p-4 bg-brand-gray1 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-brand-gray3">Overall Trend</h4>
            <div className="flex items-center gap-2 mt-1">
              {trend.direction === 'up' && <FiTrendingUp className="text-green-400" size={20} />}
              {trend.direction === 'down' && <FiTrendingDown className="text-red-400" size={20} />}
              {trend.direction === 'stable' && <FiMinus className="text-yellow-400" size={20} />}
              <span className={`font-semibold ${
                trend.direction === 'up' ? 'text-green-400' :
                trend.direction === 'down' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {trend.direction === 'up' ? `+${trend.change}%` :
                 trend.direction === 'down' ? `-${trend.change}%` : `${trend.change}%`}
              </span>
              <span className="text-brand-gray3 text-sm">
                {trend.direction === 'up' ? 'Improving' :
                 trend.direction === 'down' ? 'Declining' : 'Stable'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-brand-gray3">Data Points</div>
            <div className="text-lg font-semibold text-brand-white">
              {chartData.filter(d => d.percentage > 0).length}/12
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-4">
        {chartData.map((data, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="w-12 text-sm text-brand-gray3 text-right">
              {data.month}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 bg-brand-gray2 rounded-full h-3 relative">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${getBarColor(data.percentage, data.hasData)}`}
                    style={{ width: `${(data.percentage / maxPercentage) * 100}%` }}
                  ></div>
                </div>
                <div className={`w-16 text-right text-sm font-medium ${getProgressColor(data.percentage)}`}>
                  {data.hasData ? `${data.percentage}%` : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Legend */}
      <div className="mt-6 pt-4 border-t border-brand-gray1">
        <div className="flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-brand-gray3">80-100%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-brand-gray3">60-79%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span className="text-brand-gray3">40-59%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-brand-gray3">0-39%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-brand-gray2 rounded"></div>
            <span className="text-brand-gray3">No Data</span>
          </div>
        </div>
      </div>
    </div>
  );
}
