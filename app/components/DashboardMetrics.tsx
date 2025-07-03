'use client';

import React from 'react';
import { useMetrics } from '@/app/lib/hooks/useMetrics';
import { CenteredLoadingSpinner } from './ui/LoadingSpinner';

export default function DashboardMetrics() {
  const { metrics, loading, error } = useMetrics();

  if (loading) return <CenteredLoadingSpinner />;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;
  if (!metrics) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Business Quality Objectives Metrics */}
      <div className="bg-gray-800/40 backdrop-blur-sm p-6 rounded-lg border border-brand-dark/20">
        <h3 className="text-lg font-semibold text-brand-white mb-4">Business Quality Objectives</h3>
        <div className="space-y-4">
          <div>
            <p className="text-brand-gray2">Total Objectives</p>
            <p className="text-2xl font-bold text-brand-white">{metrics.businessQuality.totalObjectives}</p>
          </div>
          <div>
            <p className="text-brand-gray2">Overall Progress</p>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-blue-500 h-2.5 rounded-full" 
                style={{ width: `${metrics.businessQuality.overallProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-brand-white mt-1">{metrics.businessQuality.overallProgress}%</p>
          </div>
          <div>
            <p className="text-brand-gray2">KPI Status</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-brand-white">Completed</p>
                <p className="text-lg font-semibold text-green-500">{metrics.businessQuality.kpiMetrics.completedKPIs}</p>
              </div>
              <div>
                <p className="text-sm text-brand-white">In Progress</p>
                <p className="text-lg font-semibold text-blue-500">{metrics.businessQuality.kpiMetrics.inProgressKPIs}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Monitoring Metrics */}
      <div className="bg-gray-800/40 backdrop-blur-sm p-6 rounded-lg border border-brand-dark/20">
        <h3 className="text-lg font-semibold text-brand-white mb-4">Performance Monitoring</h3>
        <div className="space-y-4">
          <div>
            <p className="text-brand-gray2">Total Reports</p>
            <p className="text-2xl font-bold text-brand-white">{metrics.performance.totalReports}</p>
          </div>
          <div>
            <p className="text-brand-gray2">Compliance Rate</p>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-green-500 h-2.5 rounded-full" 
                style={{ width: `${metrics.performance.complianceMetrics.complianceRate}%` }}
              ></div>
            </div>
            <p className="text-sm text-brand-white mt-1">{metrics.performance.complianceMetrics.complianceRate}%</p>
          </div>
          <div>
            <p className="text-brand-gray2">Status Distribution</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-brand-white">Compliant</p>
                <p className="text-lg font-semibold text-green-500">{metrics.performance.complianceMetrics.compliant}</p>
              </div>
              <div>
                <p className="text-sm text-brand-white">Non-Compliant</p>
                <p className="text-lg font-semibold text-red-500">{metrics.performance.complianceMetrics.nonCompliant}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Management Metrics */}
      <div className="bg-gray-800/40 backdrop-blur-sm p-6 rounded-lg border border-brand-dark/20">
        <h3 className="text-lg font-semibold text-brand-white mb-4">Risk Management</h3>
        <div className="space-y-4">
          <div>
            <p className="text-brand-gray2">Total Risks</p>
            <p className="text-2xl font-bold text-brand-white">{metrics.risk.totalRisks}</p>
          </div>
          <div>
            <p className="text-brand-gray2">Risk Distribution</p>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-brand-white">High Risk</p>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${(metrics.risk.riskMetrics.highRisk / metrics.risk.totalRisks) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-brand-white mt-1">{metrics.risk.riskMetrics.highRisk}</p>
              </div>
              <div>
                <p className="text-sm text-brand-white">Medium Risk</p>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ width: `${(metrics.risk.riskMetrics.mediumRisk / metrics.risk.totalRisks) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-brand-white mt-1">{metrics.risk.riskMetrics.mediumRisk}</p>
              </div>
              <div>
                <p className="text-sm text-brand-white">Low Risk</p>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(metrics.risk.riskMetrics.lowRisk / metrics.risk.totalRisks) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-brand-white mt-1">{metrics.risk.riskMetrics.lowRisk}</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-brand-gray2">Mitigation Status</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-brand-white">Mitigated</p>
                <p className="text-lg font-semibold text-green-500">{metrics.risk.riskMetrics.mitigated}</p>
              </div>
              <div>
                <p className="text-sm text-brand-white">In Progress</p>
                <p className="text-lg font-semibold text-blue-500">{metrics.risk.riskMetrics.inProgress}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 