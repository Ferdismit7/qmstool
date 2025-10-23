'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiDownload, FiTrendingUp, FiTrendingDown, FiMinus, FiAlertTriangle, FiCheckCircle, FiClock } from 'react-icons/fi';
import { CenteredLoadingSpinner } from '../components/ui/LoadingSpinner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ManagementReportData {
  businessArea: string;
  overallHealthScore: number;
  trendAnalysis: {
    currentMonth: number;
    previousMonth: number;
    trend: 'improving' | 'declining' | 'stable';
  };
  riskLevel: 'green' | 'yellow' | 'red';
  keyMetrics: {
    qualityObjectives: {
      totalObjectives: number;
      completedObjectives: number;
      completionRate: number;
      averageProgress: number;
      objectivesAtRisk: number;
      kpiComplianceRate: number;
    };
    processManagement: {
      totalProcesses: number;
      documentedProcesses: number;
      completionRate: number;
      criticalProcessesStatus: number;
      efficiencyScore: number;
    };
         riskManagement: {
       totalRisks: number;
       riskDistribution: {
         high: number;
         medium: number;
         low: number;
       };
       mitigationProgress: number;
       newRisksThisPeriod: number;
       averageImpactLevelScore: number;
     };
    compliance: {
      requiredDocuments: number;
      availableDocuments: number;
      complianceRate: number;
      reviewStatus: {
        upToDate: number;
        overdue: number;
        pending: number;
      };
      auditReadinessScore: number;
    };
    operationalExcellence: {
      openNonConformities: number;
      closedNonConformities: number;
      averageResolutionTime: number;
      recurringIssues: number;
      improvementInitiatives: number;
      completedImprovements: number;
      nonConformityMetrics: {
        totalNonConformities: number;
        openNonConformities: number;
        closedNonConformities: number;
        averageResolutionTime: number;
        criticalNonConformities: number;
        highPriorityNonConformities: number;
        overdueNonConformities: number;
      };
      businessImprovementMetrics: {
        totalImprovements: number;
        completedImprovements: number;
        inProgressImprovements: number;
        plannedImprovements: number;
        averageCompletionTime: number;
        highPriorityImprovements: number;
      };
      recordKeepingMetrics: {
        totalRecordSystems: number;
        compliantSystems: number;
        nonCompliantSystems: number;
        averageComplianceScore: number;
        overdueAudits: number;
      };
      performanceMonitoringMetrics: {
        totalControls: number;
        completedControls: number;
        overdueControls: number;
        averagePerformanceScore: number;
        criticalControls: number;
      };
      thirdPartyEvaluationMetrics: {
        totalEvaluations: number;
        completedEvaluations: number;
        pendingEvaluations: number;
        averageEvaluationScore: number;
        overdueEvaluations: number;
      };
      customerFeedbackMetrics: {
        totalFeedbackSystems: number;
        activeSystems: number;
        averageSatisfactionScore: number;
        responseRate: number;
      };
    };
    resourceManagement: {
      trainingSessionsCompleted: number;
      staffCertificationRate: number;
      skillsGapPercentage: number;
      supplierEvaluationStatus: number;
      supplierPerformanceScore: number;
    };
    customerFocus: {
      customerSatisfactionScore: number;
      feedbackResponseRate: number;
      serviceQualityScore: number;
      stakeholderEngagementLevel: number;
    };
  };
  topAchievements: string[];
  areasNeedingAttention: string[];
  criticalActions: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    deadline: string;
    responsiblePerson: string;
    status: 'pending' | 'in-progress' | 'completed';
  }>;
}

export default function ManagementReportPage() {
  const searchParams = useSearchParams();
  const [reportData, setReportData] = useState<ManagementReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [businessAreas, setBusinessAreas] = useState<Array<{ business_area: string }>>([]);
  const [selectedBusinessArea, setSelectedBusinessArea] = useState<string>('');
  const [downloading, setDownloading] = useState(false);

  // Fetch user's authorized business areas
  useEffect(() => {
    const fetchUserBusinessAreas = async () => {
      try {
        // Get the token from localStorage or sessionStorage
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        
        const response = await fetch('/api/auth/user-business-areas', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          const userBusinessAreas = userData.businessAreas || [];
          
          // Convert to the format expected by the dropdown
          const businessAreasFormatted = userBusinessAreas.map((area: string) => ({ business_area: area }));
          setBusinessAreas(businessAreasFormatted);
          
          // Set the business area from URL parameter or first available area
          const businessAreaFromUrl = searchParams.get('businessArea');
          if (businessAreaFromUrl && userBusinessAreas.includes(businessAreaFromUrl)) {
            setSelectedBusinessArea(businessAreaFromUrl);
          } else if (userBusinessAreas.length > 0) {
            setSelectedBusinessArea(userBusinessAreas[0]);
          }
        } else {
          console.error('Failed to fetch user business areas:', response.status);
        }
      } catch (err) {
        console.error('Error fetching user business areas:', err);
      }
    };

    fetchUserBusinessAreas();
  }, [searchParams]);

  // Fetch management report when business area changes
  useEffect(() => {
    const fetchManagementReport = async () => {
      if (!selectedBusinessArea) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/management-report?businessArea=${encodeURIComponent(selectedBusinessArea)}`);
        if (response.ok) {
          const result = await response.json();
          setReportData(result.data);
        } else {
          setError('Failed to fetch management report');
        }
      } catch {
        setError('Error loading management report');
      } finally {
        setLoading(false);
      }
    };

    fetchManagementReport();
  }, [selectedBusinessArea]);

  const handleBusinessAreaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBusinessArea(event.target.value);
  };

  const handleDownloadPDF = async () => {
    if (!reportData) return;
    
    setDownloading(true);
    try {
      const doc = new jsPDF();
    let y = 20;

    // Title
    doc.setFontSize(20);
    doc.text('Management Report', 105, y, { align: 'center' });
    y += 10;
    
    doc.setFontSize(12);
    doc.text(`Business Area: ${reportData.businessArea}`, 105, y, { align: 'center' });
    y += 8;
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, y, { align: 'center' });
    y += 15;

    // Executive Summary
    doc.setFontSize(16);
    doc.text('Executive Summary', 14, y);
    y += 8;

    // Overall Health Score
    doc.setFontSize(12);
    doc.text(`Overall Health Score: ${reportData.overallHealthScore.toFixed(1)}%`, 14, y);
    y += 6;
    doc.text(`Risk Level: ${reportData.riskLevel.toUpperCase()}`, 14, y);
    y += 6;
    doc.text(`Trend: ${reportData.trendAnalysis.trend}`, 14, y);
    y += 10;

    // Key Metrics Summary
    doc.setFontSize(14);
    doc.text('Key Metrics Summary', 14, y);
    y += 8;

         const metricsData = [
       ['Quality Objectives', `${reportData.keyMetrics.qualityObjectives.completionRate.toFixed(1)}%`],
       ['Process Registry', `${reportData.keyMetrics.processManagement.completionRate.toFixed(1)}%`],
       ['Document Registry', `${reportData.keyMetrics.compliance.complianceRate.toFixed(1)}%`],
       ['Risk Mitigation', `${reportData.keyMetrics.riskManagement.mitigationProgress.toFixed(1)}%`],
       ['Total Risks', `${reportData.keyMetrics.riskManagement.totalRisks}`],
       ['Avg Impact Score', `${reportData.keyMetrics.riskManagement.averageImpactLevelScore.toFixed(1)}`],
       ['Non-Conformities', `${reportData.keyMetrics.operationalExcellence.nonConformityMetrics.totalNonConformities}`],
       ['Open Non-Conformities', `${reportData.keyMetrics.operationalExcellence.nonConformityMetrics.openNonConformities}`],
       ['Business Improvements', `${reportData.keyMetrics.operationalExcellence.businessImprovementMetrics.totalImprovements}`],
       ['Completed Improvements', `${reportData.keyMetrics.operationalExcellence.businessImprovementMetrics.completedImprovements}`],
       ['Record Keeping Systems', `${reportData.keyMetrics.operationalExcellence.recordKeepingMetrics.totalRecordSystems}`],
       ['Performance Controls', `${reportData.keyMetrics.operationalExcellence.performanceMonitoringMetrics.totalControls}`],
       ['Third Party Evaluations', `${reportData.keyMetrics.operationalExcellence.thirdPartyEvaluationMetrics.totalEvaluations}`],
       ['Customer Feedback Systems', `${reportData.keyMetrics.operationalExcellence.customerFeedbackMetrics.totalFeedbackSystems}`]
     ];

    autoTable(doc, {
      startY: y,
      head: [['Metric', 'Score']],
      body: metricsData,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      margin: { left: 14, right: 14 },
      theme: 'grid',
    });

         y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    // Comprehensive Operational Metrics
    if (y > 200) {
      doc.addPage();
      y = 20;
    }
    
    doc.setFontSize(14);
    doc.text('Comprehensive Operational Metrics', 14, y);
    y += 8;

    const operationalData = [
      ['Non-Conformities', 'Total', 'Open', 'Critical', 'Overdue'],
      ['', `${reportData.keyMetrics.operationalExcellence.nonConformityMetrics.totalNonConformities}`, 
       `${reportData.keyMetrics.operationalExcellence.nonConformityMetrics.openNonConformities}`, 
       `${reportData.keyMetrics.operationalExcellence.nonConformityMetrics.criticalNonConformities}`, 
       `${reportData.keyMetrics.operationalExcellence.nonConformityMetrics.overdueNonConformities}`],
      ['Business Improvements', 'Total', 'Completed', 'In Progress', 'High Priority'],
      ['', `${reportData.keyMetrics.operationalExcellence.businessImprovementMetrics.totalImprovements}`, 
       `${reportData.keyMetrics.operationalExcellence.businessImprovementMetrics.completedImprovements}`, 
       `${reportData.keyMetrics.operationalExcellence.businessImprovementMetrics.inProgressImprovements}`, 
       `${reportData.keyMetrics.operationalExcellence.businessImprovementMetrics.highPriorityImprovements}`],
      ['Record Keeping', 'Total', 'Compliant', 'Non-Compliant', 'Overdue Audits'],
      ['', `${reportData.keyMetrics.operationalExcellence.recordKeepingMetrics.totalRecordSystems}`, 
       `${reportData.keyMetrics.operationalExcellence.recordKeepingMetrics.compliantSystems}`, 
       `${reportData.keyMetrics.operationalExcellence.recordKeepingMetrics.nonCompliantSystems}`, 
       `${reportData.keyMetrics.operationalExcellence.recordKeepingMetrics.overdueAudits}`],
      ['Performance Monitoring', 'Total', 'Completed', 'Overdue', 'Critical'],
      ['', `${reportData.keyMetrics.operationalExcellence.performanceMonitoringMetrics.totalControls}`, 
       `${reportData.keyMetrics.operationalExcellence.performanceMonitoringMetrics.completedControls}`, 
       `${reportData.keyMetrics.operationalExcellence.performanceMonitoringMetrics.overdueControls}`, 
       `${reportData.keyMetrics.operationalExcellence.performanceMonitoringMetrics.criticalControls}`],
      ['Third Party Evaluations', 'Total', 'Completed', 'Pending', 'Overdue'],
      ['', `${reportData.keyMetrics.operationalExcellence.thirdPartyEvaluationMetrics.totalEvaluations}`, 
       `${reportData.keyMetrics.operationalExcellence.thirdPartyEvaluationMetrics.completedEvaluations}`, 
       `${reportData.keyMetrics.operationalExcellence.thirdPartyEvaluationMetrics.pendingEvaluations}`, 
       `${reportData.keyMetrics.operationalExcellence.thirdPartyEvaluationMetrics.overdueEvaluations}`],
      ['Customer Feedback', 'Total', 'Active', 'Avg Satisfaction', 'Response Rate'],
      ['', `${reportData.keyMetrics.operationalExcellence.customerFeedbackMetrics.totalFeedbackSystems}`, 
       `${reportData.keyMetrics.operationalExcellence.customerFeedbackMetrics.activeSystems}`, 
       `${reportData.keyMetrics.operationalExcellence.customerFeedbackMetrics.averageSatisfactionScore.toFixed(1)}%`, 
       `${reportData.keyMetrics.operationalExcellence.customerFeedbackMetrics.responseRate.toFixed(1)}%`]
    ];

    autoTable(doc, {
      startY: y,
      head: [['Category', 'Metric 1', 'Metric 2', 'Metric 3', 'Metric 4']],
      body: operationalData,
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      margin: { left: 14, right: 14 },
      theme: 'grid',
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    // Top Achievements
    if (reportData.topAchievements.length > 0) {
      doc.setFontSize(14);
      doc.text('Top Achievements', 14, y);
      y += 8;

             reportData.topAchievements.forEach((achievement) => {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        doc.setFontSize(10);
        doc.text(`• ${achievement}`, 16, y);
        y += 5;
      });
      y += 5;
    }

    // Areas Needing Attention
    if (reportData.areasNeedingAttention.length > 0) {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(14);
      doc.text('Areas Needing Attention', 14, y);
      y += 8;

             reportData.areasNeedingAttention.forEach((area) => {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        doc.setFontSize(10);
        doc.text(`• ${area}`, 16, y);
        y += 5;
      });
      y += 5;
    }

    // Critical Actions
    if (reportData.criticalActions.length > 0) {
      if (y > 200) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(14);
      doc.text('Critical Actions Required', 14, y);
      y += 8;

      const actionsData = reportData.criticalActions.map(action => [
        action.title,
        action.priority.toUpperCase(),
        action.deadline,
        action.responsiblePerson
      ]);

      autoTable(doc, {
        startY: y,
        head: [['Action', 'Priority', 'Deadline', 'Responsible']],
        body: actionsData,
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        margin: { left: 14, right: 14 },
        theme: 'grid',
      });
    }

      // Save the PDF
      doc.save(`management-report-${reportData.businessArea}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setDownloading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <FiTrendingUp className="text-green-500" />;
      case 'declining':
        return <FiTrendingDown className="text-red-500" />;
      default:
        return <FiMinus className="text-gray-500" />;
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'green':
        return 'text-green-500 bg-green-100';
      case 'yellow':
        return 'text-yellow-600 bg-yellow-100';
      case 'red':
        return 'text-red-500 bg-red-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (businessAreas.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <CenteredLoadingSpinner />
          <p className="text-gray-400 mt-4">Loading your authorized business areas...</p>
        </div>
      </div>
    );
  }

  if (!selectedBusinessArea) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <p className="text-gray-400">Please select a business area to view the management report.</p>
        </div>
      </div>
    );
  }

  if (loading) return <CenteredLoadingSpinner />;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;
  if (!reportData) return <div className="text-gray-500 text-center py-8">No report data available for the selected business area.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-2">Management Report</h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="businessAreaSelect" className="text-gray-300 font-medium">
                Business Area:
              </label>
              <select
                id="businessAreaSelect"
                value={selectedBusinessArea}
                onChange={handleBusinessAreaChange}
                className="px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 min-w-[200px]"
                disabled={businessAreas.length === 0}
              >
                {businessAreas.length === 0 ? (
                  <option value="">Loading your business areas...</option>
                ) : (
                  businessAreas.map((area) => (
                    <option key={area.business_area} value={area.business_area}>
                      {area.business_area}
                    </option>
                  ))
                )}
              </select>
            </div>
            {reportData && (
              <p className="text-gray-400 text-sm">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleDownloadPDF}
          disabled={downloading || !reportData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiDownload />
          {downloading ? 'Generating PDF...' : 'Download PDF'}
        </button>
      </div>

      {/* Executive Summary */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Executive Summary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Overall Health Score */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">Overall Health Score</h3>
            <div className="flex items-center gap-2">
              <span className={`text-3xl font-bold ${getHealthScoreColor(reportData.overallHealthScore)}`}>
                {reportData.overallHealthScore.toFixed(1)}%
              </span>
              {getTrendIcon(reportData.trendAnalysis.trend)}
            </div>
            <p className="text-gray-300 text-sm mt-2">
              {reportData.trendAnalysis.trend === 'improving' ? 'Improving' : 
               reportData.trendAnalysis.trend === 'declining' ? 'Declining' : 'Stable'} from last month
            </p>
          </div>

          {/* Risk Level */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">Risk Level</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(reportData.riskLevel)}`}>
              {reportData.riskLevel.toUpperCase()}
            </span>
          </div>

          {/* Key Metrics Summary */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">Key Metrics</h3>
                         <div className="space-y-1">
               <p className="text-gray-300 text-sm">
                 Quality Objectives: {reportData.keyMetrics.qualityObjectives.completionRate.toFixed(1)}%
               </p>
               <p className="text-gray-300 text-sm">
                 Process Registry: {reportData.keyMetrics.processManagement.completionRate.toFixed(1)}%
               </p>
               <p className="text-gray-300 text-sm">
                 Document Registry: {reportData.keyMetrics.compliance.complianceRate.toFixed(1)}%
               </p>
             </div>
          </div>
        </div>

        {/* Top Achievements and Areas Needing Attention */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <FiCheckCircle className="text-green-500" />
              Top Achievements
            </h3>
            <ul className="space-y-2">
              {reportData.topAchievements.map((achievement, index) => (
                <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  {achievement}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <FiAlertTriangle className="text-yellow-500" />
              Areas Needing Attention
            </h3>
            <ul className="space-y-2">
              {reportData.areasNeedingAttention.map((area, index) => (
                <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {/* Quality Objectives */}
         <div className="bg-gray-800 rounded-lg p-6">
           <h3 className="text-xl font-bold text-white mb-4">Quality Objectives</h3>
           <div className="space-y-4">
             <div className="flex justify-between items-center">
               <span className="text-gray-300">Average Progress</span>
               <span className="text-white font-semibold">
                 {reportData.keyMetrics.qualityObjectives.completionRate.toFixed(1)}%
               </span>
             </div>
             <div className="w-full bg-gray-700 rounded-full h-2">
               <div 
                 className="bg-blue-500 h-2 rounded-full" 
                 style={{ width: `${reportData.keyMetrics.qualityObjectives.completionRate}%` }}
               ></div>
             </div>
             <div className="grid grid-cols-2 gap-4 text-sm">
               <div>
                 <p className="text-gray-400">Total Objectives</p>
                 <p className="text-white font-semibold">{reportData.keyMetrics.qualityObjectives.totalObjectives}</p>
               </div>
               <div>
                 <p className="text-gray-400">At Risk</p>
                 <p className="text-red-400 font-semibold">{reportData.keyMetrics.qualityObjectives.objectivesAtRisk}</p>
               </div>
             </div>
           </div>
         </div>

                 {/* Process Management */}
         <div className="bg-gray-800 rounded-lg p-6">
           <h3 className="text-xl font-bold text-white mb-4">Process Registry</h3>
           <div className="space-y-4">
             <div className="flex justify-between items-center">
               <span className="text-gray-300">Average Progress</span>
               <span className="text-white font-semibold">
                 {reportData.keyMetrics.processManagement.completionRate.toFixed(1)}%
               </span>
             </div>
             <div className="w-full bg-gray-700 rounded-full h-2">
               <div 
                 className="bg-green-500 h-2 rounded-full" 
                 style={{ width: `${reportData.keyMetrics.processManagement.completionRate}%` }}
               ></div>
             </div>
             <div className="grid grid-cols-2 gap-4 text-sm">
               <div>
                 <p className="text-gray-400">Total Processes</p>
                 <p className="text-white font-semibold">{reportData.keyMetrics.processManagement.totalProcesses}</p>
               </div>
               <div>
                 <p className="text-gray-400">Critical Status</p>
                 <p className="text-yellow-400 font-semibold">
                   {reportData.keyMetrics.processManagement.criticalProcessesStatus.toFixed(1)}%
                 </p>
               </div>
             </div>
           </div>
         </div>

                 {/* Risk Management */}
         <div className="bg-gray-800 rounded-lg p-6">
           <h3 className="text-xl font-bold text-white mb-4">Risk Management</h3>
           <div className="space-y-4">
             <div className="flex justify-between items-center">
               <span className="text-gray-300">Total Risks</span>
               <span className="text-white font-semibold">
                 {reportData.keyMetrics.riskManagement.totalRisks}
               </span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-gray-300">Average Impact Score</span>
               <span className="text-white font-semibold">
                 {reportData.keyMetrics.riskManagement.averageImpactLevelScore.toFixed(1)}
               </span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-gray-300">Mitigation Progress</span>
               <span className="text-white font-semibold">
                 {reportData.keyMetrics.riskManagement.mitigationProgress.toFixed(1)}%
               </span>
             </div>
             <div className="w-full bg-gray-700 rounded-full h-2">
               <div 
                 className="bg-purple-500 h-2 rounded-full" 
                 style={{ width: `${reportData.keyMetrics.riskManagement.mitigationProgress}%` }}
               ></div>
             </div>
             <div className="grid grid-cols-3 gap-4 text-sm">
               <div>
                 <p className="text-gray-400">High Risk (15-25)</p>
                 <p className="text-red-400 font-semibold">{reportData.keyMetrics.riskManagement.riskDistribution.high}</p>
               </div>
               <div>
                 <p className="text-gray-400">Medium Risk (8-14)</p>
                 <p className="text-yellow-400 font-semibold">{reportData.keyMetrics.riskManagement.riskDistribution.medium}</p>
               </div>
               <div>
                 <p className="text-gray-400">Low Risk (1-7)</p>
                 <p className="text-green-400 font-semibold">{reportData.keyMetrics.riskManagement.riskDistribution.low}</p>
               </div>
             </div>
           </div>
         </div>

                 {/* Compliance */}
         <div className="bg-gray-800 rounded-lg p-6">
           <h3 className="text-xl font-bold text-white mb-4">Document Registry</h3>
           <div className="space-y-4">
             <div className="flex justify-between items-center">
               <span className="text-gray-300">Average Progress</span>
               <span className="text-white font-semibold">
                 {reportData.keyMetrics.compliance.complianceRate.toFixed(1)}%
               </span>
             </div>
             <div className="w-full bg-gray-700 rounded-full h-2">
               <div 
                 className="bg-teal-500 h-2 rounded-full" 
                 style={{ width: `${reportData.keyMetrics.compliance.complianceRate}%` }}
               ></div>
             </div>
             <div className="grid grid-cols-2 gap-4 text-sm">
               <div>
                 <p className="text-gray-400">Audit Readiness</p>
                 <p className="text-white font-semibold">
                   {reportData.keyMetrics.compliance.auditReadinessScore.toFixed(1)}%
                 </p>
               </div>
               <div>
                 <p className="text-gray-400">Overdue Reviews</p>
                 <p className="text-red-400 font-semibold">{reportData.keyMetrics.compliance.reviewStatus.overdue}</p>
               </div>
             </div>
           </div>
         </div>
      </div>

      {/* Comprehensive Operational Metrics */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-white mb-6">Comprehensive Operational Metrics</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Non-Conformities */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Non-Conformities</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total Non-Conformities</span>
                <span className="text-white font-semibold">
                  {reportData.keyMetrics.operationalExcellence.nonConformityMetrics.totalNonConformities}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Open Issues</span>
                <span className="text-red-400 font-semibold">
                  {reportData.keyMetrics.operationalExcellence.nonConformityMetrics.openNonConformities}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Critical Issues</span>
                <span className="text-red-500 font-semibold">
                  {reportData.keyMetrics.operationalExcellence.nonConformityMetrics.criticalNonConformities}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Overdue Issues</span>
                <span className="text-orange-400 font-semibold">
                  {reportData.keyMetrics.operationalExcellence.nonConformityMetrics.overdueNonConformities}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Avg Resolution Time</span>
                <span className="text-white font-semibold">
                  {reportData.keyMetrics.operationalExcellence.nonConformityMetrics.averageResolutionTime.toFixed(1)} days
                </span>
              </div>
            </div>
          </div>

          {/* Business Improvements */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Business Improvements</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total Improvements</span>
                <span className="text-white font-semibold">
                  {reportData.keyMetrics.operationalExcellence.businessImprovementMetrics.totalImprovements}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Completed</span>
                <span className="text-green-400 font-semibold">
                  {reportData.keyMetrics.operationalExcellence.businessImprovementMetrics.completedImprovements}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">In Progress</span>
                <span className="text-blue-400 font-semibold">
                  {reportData.keyMetrics.operationalExcellence.businessImprovementMetrics.inProgressImprovements}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">High Priority</span>
                <span className="text-yellow-400 font-semibold">
                  {reportData.keyMetrics.operationalExcellence.businessImprovementMetrics.highPriorityImprovements}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Avg Completion Time</span>
                <span className="text-white font-semibold">
                  {reportData.keyMetrics.operationalExcellence.businessImprovementMetrics.averageCompletionTime.toFixed(1)} days
                </span>
              </div>
            </div>
          </div>

          {/* Record Keeping Systems */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Record Keeping Systems</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total Systems</span>
                <span className="text-white font-semibold">
                  {reportData.keyMetrics.operationalExcellence.recordKeepingMetrics.totalRecordSystems}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Compliant Systems</span>
                <span className="text-green-400 font-semibold">
                  {reportData.keyMetrics.operationalExcellence.recordKeepingMetrics.compliantSystems}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Non-Compliant</span>
                <span className="text-red-400 font-semibold">
                  {reportData.keyMetrics.operationalExcellence.recordKeepingMetrics.nonCompliantSystems}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Overdue Audits</span>
                <span className="text-orange-400 font-semibold">
                  {reportData.keyMetrics.operationalExcellence.recordKeepingMetrics.overdueAudits}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Avg Compliance Score</span>
                <span className="text-white font-semibold">
                  {reportData.keyMetrics.operationalExcellence.recordKeepingMetrics.averageComplianceScore.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Performance Monitoring */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Performance Monitoring</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total Controls</span>
                <span className="text-white font-semibold">
                  {reportData.keyMetrics.operationalExcellence.performanceMonitoringMetrics.totalControls}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Completed Controls</span>
                <span className="text-green-400 font-semibold">
                  {reportData.keyMetrics.operationalExcellence.performanceMonitoringMetrics.completedControls}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Overdue Controls</span>
                <span className="text-red-400 font-semibold">
                  {reportData.keyMetrics.operationalExcellence.performanceMonitoringMetrics.overdueControls}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Critical Controls</span>
                <span className="text-yellow-400 font-semibold">
                  {reportData.keyMetrics.operationalExcellence.performanceMonitoringMetrics.criticalControls}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Avg Performance Score</span>
                <span className="text-white font-semibold">
                  {reportData.keyMetrics.operationalExcellence.performanceMonitoringMetrics.averagePerformanceScore.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Third Party Evaluations */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Third Party Evaluations</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total Evaluations</span>
                <span className="text-white font-semibold">
                  {reportData.keyMetrics.operationalExcellence.thirdPartyEvaluationMetrics.totalEvaluations}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Completed</span>
                <span className="text-green-400 font-semibold">
                  {reportData.keyMetrics.operationalExcellence.thirdPartyEvaluationMetrics.completedEvaluations}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Pending</span>
                <span className="text-blue-400 font-semibold">
                  {reportData.keyMetrics.operationalExcellence.thirdPartyEvaluationMetrics.pendingEvaluations}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Overdue</span>
                <span className="text-red-400 font-semibold">
                  {reportData.keyMetrics.operationalExcellence.thirdPartyEvaluationMetrics.overdueEvaluations}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Avg Evaluation Score</span>
                <span className="text-white font-semibold">
                  {reportData.keyMetrics.operationalExcellence.thirdPartyEvaluationMetrics.averageEvaluationScore.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Customer Feedback Systems */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Customer Feedback Systems</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total Systems</span>
                <span className="text-white font-semibold">
                  {reportData.keyMetrics.operationalExcellence.customerFeedbackMetrics.totalFeedbackSystems}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Active Systems</span>
                <span className="text-green-400 font-semibold">
                  {reportData.keyMetrics.operationalExcellence.customerFeedbackMetrics.activeSystems}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Avg Satisfaction Score</span>
                <span className="text-blue-400 font-semibold">
                  {reportData.keyMetrics.operationalExcellence.customerFeedbackMetrics.averageSatisfactionScore.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Response Rate</span>
                <span className="text-white font-semibold">
                  {reportData.keyMetrics.operationalExcellence.customerFeedbackMetrics.responseRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Actions */}
      <div className="mt-8 bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FiClock />
          Critical Actions Required
        </h3>
        <div className="space-y-4">
          {reportData.criticalActions.map((action) => (
            <div key={action.id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-white font-semibold">{action.title}</h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  action.priority === 'high' ? 'bg-red-500 text-white' :
                  action.priority === 'medium' ? 'bg-yellow-500 text-black' :
                  'bg-green-500 text-white'
                }`}>
                  {action.priority.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-300 text-sm mb-2">{action.description}</p>
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Responsible: {action.responsiblePerson}</span>
                <span>Deadline: {action.deadline}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
