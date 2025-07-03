import prisma from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Represents the data structure for a business quality objective
 * @interface BusinessQualityData
 */
interface BusinessQualityData {
  /** Unique identifier for the objective */
  id: number;
  /** Category of the objective */
  category: string | null;
  /** Business area the objective belongs to */
  business_area: string | null;
  /** Sub-business area for more specific categorization */
  sub_business_area: string | null;
  /** Main objectives of the QMS */
  qms_main_objectives: string | null;
  /** Detailed description of the objective */
  qms_objective_description: string | null;
  /** KPI or SLA targets associated with the objective */
  kpi_or_sla_targets: string | null;
  /** Performance monitoring details */
  performance_monitoring: string | null;
  /** Proof of measuring the objective */
  proof_of_measuring: string | null;
  /** Proof of reporting the objective */
  proof_of_reporting: string | null;
  /** Frequency of monitoring */
  frequency: string | null;
  /** Person or team responsible for the objective */
  responsible_person_team: string | null;
  /** Date when the objective should be reviewed */
  review_date: Date | null;
  /** Current progress status */
  progress: string | null;
  /** Percentage of completion */
  status_percentage: number | null;
}

/**
 * Represents the data structure for a business process
 * @interface BusinessProcessData
 */
interface BusinessProcessData {
  /** Unique identifier for the process */
  id: number;
  /** Business area the process belongs to */
  business_area: string | null;
  /** Sub-business area for more specific categorization */
  sub_business_area: string | null;
  /** Name of the process */
  process_name: string | null;
  /** Name of the associated document */
  document_name: string | null;
  /** Version of the process/document */
  version: string | null;
  /** Current progress status */
  progress: string | null;
  /** Document status */
  doc_status: string | null;
  /** Percentage of completion */
  status_percentage: number | null;
  /** Priority level of the process */
  priority: string | null;
  /** Target completion date */
  target_date: Date | null;
  /** Owner of the process */
  process_owner: string | null;
  /** Last update date */
  update_date: Date | null;
  /** Additional remarks */
  remarks: string | null;
  /** Review date */
  review_date: Date | null;
}

/**
 * Represents the metrics for business quality objectives
 * @interface Metrics
 */
interface Metrics {
  /** Total number of objectives */
  totalObjectives: number;
  /** Distribution of objectives by category */
  byCategory: Record<string, number>;
  /** Distribution of objectives by progress */
  byProgress: Record<string, number>;
  /** Distribution of objectives by frequency */
  byFrequency: Record<string, number>;
  /** Overall progress percentage */
  overallProgress: number;
  /** Distribution of objectives by status */
  statusDistribution: Record<string, number>;
  /** KPI-specific metrics */
  kpiMetrics: {
    /** Total number of KPIs */
    totalKPIs: number;
    /** Number of completed KPIs */
    completedKPIs: number;
    /** Number of in-progress KPIs */
    inProgressKPIs: number;
    /** Number of not started KPIs */
    notStartedKPIs: number;
    /** Average progress across all KPIs */
    averageProgress: number;
  };
}

/**
 * Represents the metrics for performance monitoring
 * @interface PerformanceMetrics
 */
interface PerformanceMetrics {
  /** Total number of reports */
  totalReports: number;
  /** Distribution of reports by type */
  byType: Record<string, number>;
  /** Distribution of reports by priority */
  byPriority: Record<string, number>;
  /** Distribution of reports by status */
  byStatus: Record<string, number>;
  /** Overall progress percentage */
  overallProgress: number;
  /** Distribution of reports by status */
  statusDistribution: Record<string, number>;
  /** Compliance-specific metrics */
  complianceMetrics: {
    /** Total number of reports */
    totalReports: number;
    /** Number of compliant reports */
    compliant: number;
    /** Number of non-compliant reports */
    nonCompliant: number;
    /** Number of in-progress reports */
    inProgress: number;
    /** Overall compliance rate */
    complianceRate: number;
  };
}

/**
 * Represents the metrics for risk management
 * @interface RiskMetrics
 */
interface RiskMetrics {
  /** Total number of risks */
  totalRisks: number;
  /** Distribution of risks by category */
  byCategory: Record<string, number>;
  /** Distribution of risks by priority */
  byPriority: Record<string, number>;
  /** Distribution of risks by status */
  byStatus: Record<string, number>;
  /** Overall progress percentage */
  overallProgress: number;
  /** Distribution of risks by status */
  statusDistribution: Record<string, number>;
  /** Risk-specific metrics */
  riskMetrics: {
    /** Total number of risks */
    totalRisks: number;
    /** Number of high-risk items */
    highRisk: number;
    /** Number of medium-risk items */
    mediumRisk: number;
    /** Number of low-risk items */
    lowRisk: number;
    /** Number of mitigated risks */
    mitigated: number;
    /** Number of in-progress risks */
    inProgress: number;
  };
}

/**
 * Service class for calculating various metrics in the QMS
 * @class CalculationService
 */
export class CalculationService {
  /**
   * Calculates metrics for business quality objectives
   * @param businessArea - The business area to filter by
   * @returns {Promise<Metrics>} Object containing various metrics for business quality objectives
   */
  static async calculateBusinessQualityMetrics(businessArea: string): Promise<Metrics> {
    const objectives = await prisma.businessQualityObjective.findMany({
      where: { business_area: businessArea }
    });
    
    const metrics: Metrics = {
      totalObjectives: objectives.length,
      byCategory: this.calculateByCategory(objectives),
      byProgress: this.calculateByProgress(objectives),
      byFrequency: this.calculateByFrequency(objectives),
      overallProgress: this.calculateOverallProgress(objectives),
      statusDistribution: this.calculateStatusDistribution(objectives),
      kpiMetrics: this.calculateKPIMetrics(objectives)
    };

    return metrics;
  }

  /**
   * Calculates metrics for performance monitoring
   * @param businessArea - The business area to filter by
   * @returns {Promise<PerformanceMetrics>} Object containing various metrics for performance monitoring
   */
  static async calculatePerformanceMetrics(businessArea: string): Promise<PerformanceMetrics> {
    const reports = await prisma.performanceMonitoringControl.findMany({
      where: { business_area: businessArea }
    });
    
    const metrics: PerformanceMetrics = {
      totalReports: reports.length,
      byType: this.calculateByType(reports as any),
      byPriority: this.calculateByPriority(reports as any),
      byStatus: this.calculateByStatus(reports as any),
      overallProgress: this.calculateOverallProgress(reports as any),
      statusDistribution: this.calculateStatusDistribution(reports as any),
      complianceMetrics: this.calculateComplianceMetrics(reports as any)
    };

    return metrics;
  }

  /**
   * Calculates metrics for risk management
   * @param businessArea - The business area to filter by
   * @returns {Promise<RiskMetrics>} Object containing various metrics for risk management
   */
  static async calculateRiskManagementMetrics(businessArea: string): Promise<RiskMetrics> {
    const risks = await prisma.racmMatrix.findMany({
      where: { business_area: businessArea }
    });
    
    const metrics: RiskMetrics = {
      totalRisks: risks.length,
      byCategory: this.calculateByCategory(risks as any),
      byPriority: this.calculateByPriority(risks as any),
      byStatus: this.calculateByStatus(risks as any),
      overallProgress: this.calculateOverallProgress(risks as any),
      statusDistribution: this.calculateStatusDistribution(risks as any),
      riskMetrics: this.calculateRiskMetrics(risks as any)
    };

    return metrics;
  }

  /**
   * Calculates distribution by category
   * @param data - Array of data items
   * @returns Distribution of items by category
   */
  private static calculateByCategory(data: (BusinessQualityData | BusinessProcessData | RiskManagementData)[]): Record<string, number> {
    return data.reduce((acc, item) => {
      const category = 'category' in item ? item.category : item.business_area;
      acc[category || 'Uncategorized'] = (acc[category || 'Uncategorized'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Calculates distribution by progress
   * @param data - Array of data items
   * @returns Distribution of items by progress
   */
  private static calculateByProgress(data: (BusinessQualityData | BusinessProcessData | PerformanceMonitoringData | RiskManagementData)[]): Record<string, number> {
    return data.reduce((acc, item) => {
      const progress = item.progress || 'Not Started';
      acc[progress] = (acc[progress] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Calculates distribution by frequency
   * @param data - Array of data items
   * @returns Distribution of items by frequency
   */
  private static calculateByFrequency(data: (BusinessQualityData | PerformanceMonitoringData)[]): Record<string, number> {
    return data.reduce((acc, item) => {
      const frequency = 'frequency' in item ? item.frequency : 'Not Specified';
      acc[frequency || 'Not Specified'] = (acc[frequency || 'Not Specified'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Calculates distribution by type
   * @param data - Array of data items
   * @returns Distribution of items by type
   */
  private static calculateByType(data: (BusinessProcessData | PerformanceMonitoringData)[]): Record<string, number> {
    return data.reduce((acc, item) => {
      const type = 'process_name' in item ? item.process_name : 'type' in item ? item.type : 'Not Specified';
      acc[type || 'Not Specified'] = (acc[type || 'Not Specified'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Calculates distribution by priority
   * @param data - Array of data items
   * @returns Distribution of items by priority
   */
  private static calculateByPriority(data: (BusinessProcessData | PerformanceMonitoringData | RiskManagementData)[]): Record<string, number> {
    return data.reduce((acc, item) => {
      const priority = 'priority' in item ? item.priority : 'Not Specified';
      acc[priority || 'Not Specified'] = (acc[priority || 'Not Specified'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Calculates distribution by status
   * @param data - Array of data items
   * @returns Distribution of items by status
   */
  private static calculateByStatus(data: (BusinessQualityData | BusinessProcessData | PerformanceMonitoringData | RiskManagementData)[]): Record<string, number> {
    return data.reduce((acc, item) => {
      const status = 'doc_status' in item ? item.doc_status : 'status' in item ? item.status : 'Not Specified';
      acc[status || 'Not Specified'] = (acc[status || 'Not Specified'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Calculates overall progress percentage
   * @param data - Array of data items
   * @returns Overall progress percentage
   */
  private static calculateOverallProgress(data: (BusinessQualityData | BusinessProcessData | PerformanceMonitoringData | RiskManagementData)[]): number {
    if (data.length === 0) return 0;
    
    const totalPercentage = data.reduce((sum, item) => {
      const percentage = item.status_percentage || 0;
      return sum + Number(percentage);
    }, 0);
    
    return Math.round(totalPercentage / data.length);
  }

  /**
   * Calculates status distribution percentages
   * @param data - Array of data items
   * @returns Distribution of items by status as percentages
   */
  private static calculateStatusDistribution(data: (BusinessQualityData | BusinessProcessData | PerformanceMonitoringData | RiskManagementData)[]): Record<string, number> {
    const total = data.length;
    if (total === 0) return {};

    const distribution = this.calculateByStatus(data);
    
    return Object.entries(distribution).reduce((acc, [status, count]) => {
      acc[status] = Math.round((Number(count) / total) * 100);
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Calculates KPI-specific metrics
   * @param data - Array of business quality objectives
   * @returns KPI-specific metrics
   */
  private static calculateKPIMetrics(data: BusinessQualityData[]): Metrics['kpiMetrics'] {
    return {
      totalKPIs: data.length,
      completedKPIs: data.filter(item => item.progress === 'Completed').length,
      inProgressKPIs: data.filter(item => item.progress === 'In Progress').length,
      notStartedKPIs: data.filter(item => item.progress === 'Not Started').length,
      averageProgress: this.calculateOverallProgress(data)
    };
  }

  /**
   * Calculates compliance-specific metrics
   * @param data - Array of business processes
   * @returns Compliance-specific metrics
   */
  private static calculateComplianceMetrics(data: PerformanceMonitoringData[]): PerformanceMetrics['complianceMetrics'] {
    return {
      totalReports: data.length,
      compliant: data.filter(item => item.doc_status === 'Compliant').length,
      nonCompliant: data.filter(item => item.doc_status === 'Non-Compliant').length,
      inProgress: data.filter(item => item.doc_status === 'In Progress').length,
      complianceRate: this.calculateComplianceRate(data)
    };
  }

  /**
   * Calculates risk-specific metrics
   * @param data - Array of business processes
   * @returns Risk-specific metrics
   */
  private static calculateRiskMetrics(data: RiskManagementData[]): RiskMetrics['riskMetrics'] {
    return {
      totalRisks: data.length,
      highRisk: data.filter(item => item.priority === 'High').length,
      mediumRisk: data.filter(item => item.priority === 'Medium').length,
      lowRisk: data.filter(item => item.priority === 'Low').length,
      mitigated: data.filter(item => item.status === 'Mitigated').length,
      inProgress: data.filter(item => item.status === 'In Progress').length
    };
  }

  /**
   * Calculates compliance rate
   * @param data - Array of business processes
   * @returns Compliance rate as a percentage
   */
  private static calculateComplianceRate(data: PerformanceMonitoringData[]): number {
    if (data.length === 0) return 0;
    
    const compliant = data.filter(item => item.doc_status === 'Compliant').length;
    return Math.round((compliant / data.length) * 100);
  }
}

interface PerformanceMonitoringData {
  id: number;
  business_area: string | null;
  sub_business_area: string | null;
  type: string | null;
  progress: string | null;
  doc_status: string | null;
  status_percentage: Decimal | null;
  priority: string | null;
  frequency?: string;
}

interface RiskManagementData {
  id: number;
  business_area: string | null;
  category: string | null;
  status: string | null;
  priority: string | null;
  progress: string | null;
  status_percentage: Decimal | null;
} 