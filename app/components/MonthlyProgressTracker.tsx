'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiTrendingUp, FiCalendar } from 'react-icons/fi';
import ProgressChart from './ProgressChart';

interface ProgressEntry {
  id: number;
  month: number;
  year: number;
  percentage: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  createdBy?: {
    id: number;
    username: string;
    email: string;
  };
}

interface MonthlyProgressTrackerProps {
  objectiveId: number;
  objectiveName: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function MonthlyProgressTracker({ objectiveId, objectiveName }: MonthlyProgressTrackerProps) {
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ProgressEntry | null>(null);
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    percentage: 0,
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProgressEntries = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/business-quality-objectives/${objectiveId}/progress`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch progress entries');
      }
      
      const data = await response.json();
      if (data.success) {
        setProgressEntries(data.progressEntries || []);
      } else {
        throw new Error(data.error || 'Failed to fetch progress entries');
      }
    } catch (err) {
      console.error('Error fetching progress entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch progress entries');
    } finally {
      setIsLoading(false);
    }
  }, [objectiveId]);

  useEffect(() => {
    fetchProgressEntries();
  }, [objectiveId, fetchProgressEntries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.percentage < 0 || formData.percentage > 100) {
      setError('Percentage must be between 0 and 100');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`/api/business-quality-objectives/${objectiveId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          month: formData.month,
          year: formData.year,
          percentage: formData.percentage,
          notes: formData.notes || undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save progress entry');
      }

      const data = await response.json();
      if (data.success) {
        await fetchProgressEntries(); // Refresh the list
        setShowAddForm(false);
        setEditingEntry(null);
        setFormData({
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          percentage: 0,
          notes: ''
        });
      } else {
        throw new Error(data.error || 'Failed to save progress entry');
      }
    } catch (err) {
      console.error('Error saving progress entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to save progress entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (entry: ProgressEntry) => {
    if (!confirm(`Are you sure you want to delete the progress entry for ${MONTHS[entry.month - 1]} ${entry.year}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/business-quality-objectives/${objectiveId}/progress?month=${entry.month}&year=${entry.year}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete progress entry');
      }

      await fetchProgressEntries(); // Refresh the list
    } catch (err) {
      console.error('Error deleting progress entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete progress entry');
    }
  };

  const handleEdit = (entry: ProgressEntry) => {
    setEditingEntry(entry);
    setFormData({
      month: entry.month,
      year: entry.year,
      percentage: entry.percentage,
      notes: entry.notes || ''
    });
    setShowAddForm(true);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    if (percentage >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Sort entries by year and month (newest first)
  const sortedEntries = [...progressEntries].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  // Calculate average progress
  const averageProgress = progressEntries.length > 0 
    ? progressEntries.reduce((sum, entry) => sum + entry.percentage, 0) / progressEntries.length 
    : 0;

  // Get latest progress
  const latestProgress = sortedEntries[0];

  if (isLoading) {
    return (
      <div className="bg-brand-gray2/50 rounded-lg border border-brand-gray1 p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-gray2/50 rounded-lg border border-brand-gray1 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-brand-white flex items-center gap-2">
            <FiTrendingUp className="text-brand-primary" />
            Monthly Progress Tracking
          </h3>
          <p className="text-brand-gray3 text-sm mt-1">
            Track monthly progress for: {objectiveName}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/60 text-gray-200 text-xs rounded-md hover:bg-gray-800/80 transition-colors shadow-sm border border-gray-700/50"
        >
          <FiPlus size={12} />
          Add Progress
        </button>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-brand-gray1 rounded-lg p-4">
          <div className="text-sm text-brand-gray3">Total Entries</div>
          <div className="text-2xl font-bold text-brand-white">{progressEntries.length}</div>
        </div>
        <div className="bg-brand-gray1 rounded-lg p-4">
          <div className="text-sm text-brand-gray3">Average Progress</div>
          <div className={`text-2xl font-bold ${getProgressColor(averageProgress)}`}>
            {averageProgress.toFixed(1)}%
          </div>
        </div>
        <div className="bg-brand-gray1 rounded-lg p-4">
          <div className="text-sm text-brand-gray3">Latest Progress</div>
          <div className={`text-2xl font-bold ${getProgressColor(latestProgress?.percentage || 0)}`}>
            {latestProgress ? `${latestProgress.percentage}%` : 'N/A'}
          </div>
          {latestProgress && (
            <div className="text-xs text-brand-gray3 mt-1">
              {MONTHS[latestProgress.month - 1]} {latestProgress.year}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-brand-gray1 rounded-lg p-4 mb-6">
          <h4 className="text-md font-semibold text-brand-white mb-4">
            {editingEntry ? 'Edit Progress Entry' : 'Add New Progress Entry'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-gray3 mb-2">
                  Month
                </label>
                <select
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  required
                >
                  {MONTHS.map((month, index) => (
                    <option key={index} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-gray3 mb-2">
                  Year
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  min="2020"
                  max="2030"
                  className="w-full px-3 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-gray3 mb-2">
                  Percentage
                </label>
                <input
                  type="number"
                  value={formData.percentage}
                  onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) })}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-3 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-gray3 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Add any notes about this progress entry..."
                className="w-full px-3 py-2 rounded-lg border border-brand-gray2 bg-brand-black1/30 text-brand-white placeholder:text-brand-gray3 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : (editingEntry ? 'Update' : 'Add')} Progress
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingEntry(null);
                  setFormData({
                    month: new Date().getMonth() + 1,
                    year: new Date().getFullYear(),
                    percentage: 0,
                    notes: ''
                  });
                }}
                className="px-4 py-2 text-brand-gray3 hover:text-brand-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Progress Chart */}
      <div className="mb-6">
        <ProgressChart 
          progressEntries={progressEntries} 
          objectiveName={objectiveName}
        />
      </div>

      {/* Progress Entries List */}
      <div>
        <h4 className="text-md font-semibold text-brand-white mb-4 flex items-center gap-2">
          <FiCalendar className="text-brand-primary" />
          Progress History
        </h4>
        
        {sortedEntries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-brand-gray3">No progress entries yet. Add your first entry to start tracking!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedEntries.map((entry) => (
              <div key={entry.id} className="bg-brand-gray1 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h5 className="font-medium text-brand-white">
                        {MONTHS[entry.month - 1]} {entry.year}
                      </h5>
                      <span className={`text-lg font-bold ${getProgressColor(entry.percentage)}`}>
                        {entry.percentage}%
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-brand-gray2 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full ${getProgressBarColor(entry.percentage)}`}
                        style={{ width: `${Math.min(entry.percentage, 100)}%` }}
                      ></div>
                    </div>
                    
                    {entry.notes && (
                      <p className="text-sm text-brand-gray3 mt-2">{entry.notes}</p>
                    )}
                    
                    <div className="text-xs text-brand-gray3 mt-2">
                      Created by {entry.createdBy?.username || 'Unknown'} on{' '}
                      {new Date(entry.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="p-2 text-brand-gray3 hover:text-brand-primary transition-colors"
                      title="Edit entry"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(entry)}
                      className="p-2 text-brand-gray3 hover:text-red-400 transition-colors"
                      title="Delete entry"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
