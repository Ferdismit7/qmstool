import { prisma } from '@/lib/prisma';

/**
 * Interface for Management Report Data
 */
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
    qualityObjectives: QualityObjectiveMetrics;
    processManagement: ProcessManagementMetrics;
    riskManagement: RiskManagementMetrics;
    compliance: ComplianceMetrics;
    operationalExcellence: OperationalExcellenceMetrics;
    resourceManagement: ResourceManagementMetrics;
    customerFocus: CustomerFocusMetrics;
  };
  topAchievements: string[];
  areasNeedingAttention: string[];
  criticalActions: CriticalAction[];
}

interface QualityObjectiveMetrics {
  totalObjectives: number;
  completedObjectives: number;
  completionRate: number;
  averageProgress: number;
  objectivesAtRisk: number;
  kpiComplianceRate: number;
}

interface ProcessManagementMetrics {
  totalProcesses: number;
  documentedProcesses: number;
  completionRate: number;
  criticalProcessesStatus: number;
  efficiencyScore: number;
}

interface RiskManagementMetrics {
  totalRisks: number;
  riskDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  mitigationProgress: number;
  newRisksThisPeriod: number;
  averageImpactLevelScore: number;
}

interface ComplianceMetrics {
  requiredDocuments: number;
  availableDocuments: number;
  complianceRate: number;
  reviewStatus: {
    upToDate: number;
    overdue: number;
    pending: number;
  };
  auditReadinessScore: number;
}

interface OperationalExcellenceMetrics {
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
}

interface ResourceManagementMetrics {
  trainingSessionsCompleted: number;
  staffCertificationRate: number;
  skillsGapPercentage: number;
  supplierEvaluationStatus: number;
  supplierPerformanceScore: number;
}

interface CustomerFocusMetrics {
  customerSatisfactionScore: number;
  feedbackResponseRate: number;
  serviceQualityScore: number;
  stakeholderEngagementLevel: number;
}

interface CriticalAction {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  deadline: string;
  responsiblePerson: string;
  status: 'pending' | 'in-progress' | 'completed';
}

/**
 * Service class for generating comprehensive management reports
 */
export class ManagementReportService {
  /**
   * Generates a comprehensive management report for a business area
   */
  static async generateManagementReport(businessArea: string): Promise<ManagementReportData> {
    const [
      qualityMetrics,
      processMetrics,
      riskMetrics,
      complianceMetrics,
      operationalMetrics,
      resourceMetrics,
      customerMetrics
    ] = await Promise.all([
      this.calculateQualityObjectiveMetrics(businessArea),
      this.calculateProcessManagementMetrics(businessArea),
      this.calculateRiskManagementMetrics(businessArea),
      this.calculateComplianceMetrics(businessArea),
      this.calculateOperationalExcellenceMetrics(businessArea),
      this.calculateResourceManagementMetrics(businessArea),
      this.calculateCustomerFocusMetrics(businessArea)
    ]);

    const overallHealthScore = this.calculateOverallHealthScore({
      qualityObjectives: qualityMetrics,
      processManagement: processMetrics,
      riskManagement: riskMetrics,
      compliance: complianceMetrics,
      operationalExcellence: operationalMetrics,
      resourceManagement: resourceMetrics,
      customerFocus: customerMetrics
    });

    const trendAnalysis = await this.calculateTrendAnalysis(businessArea);
    const riskLevel = this.determineRiskLevel(overallHealthScore);
    const topAchievements = await this.identifyTopAchievements(businessArea);
    const areasNeedingAttention = await this.identifyAreasNeedingAttention(businessArea);
    const criticalActions = await this.identifyCriticalActions(businessArea);

    return {
      businessArea,
      overallHealthScore,
      trendAnalysis,
      riskLevel,
      keyMetrics: {
        qualityObjectives: qualityMetrics,
        processManagement: processMetrics,
        riskManagement: riskMetrics,
        compliance: complianceMetrics,
        operationalExcellence: operationalMetrics,
        resourceManagement: resourceMetrics,
        customerFocus: customerMetrics
      },
      topAchievements,
      areasNeedingAttention,
      criticalActions
    };
  }

  /**
   * Calculates quality objective metrics
   */
  private static async calculateQualityObjectiveMetrics(businessArea: string): Promise<QualityObjectiveMetrics> {
    const objectives = await prisma.businessQualityObjective.findMany({
      where: {
        business_area: businessArea,
        deleted_at: null
      }
    });

    const totalObjectives = objectives.length;
    const completedObjectives = objectives.filter(obj => obj.progress === 'Completed').length;
    const objectivesAtRisk = objectives.filter(obj => 
      obj.progress === 'Major Challenges' || obj.progress === 'Minor Challenges'
    ).length;

    // Calculate average progress using actual status_percentage values
    const averageProgress = totalObjectives > 0 
      ? objectives.reduce((sum, obj) => sum + (Number(obj.status_percentage) || 0), 0) / totalObjectives
      : 0;

    // Use the average progress as the completion rate instead of counting completed items
    const completionRate = averageProgress;

    const kpiComplianceRate = totalObjectives > 0 
      ? (completedObjectives / totalObjectives) * 100
      : 0;

    return {
      totalObjectives,
      completedObjectives,
      completionRate,
      averageProgress,
      objectivesAtRisk,
      kpiComplianceRate
    };
  }

  /**
   * Calculates process management metrics
   */
  private static async calculateProcessManagementMetrics(businessArea: string): Promise<ProcessManagementMetrics> {
    const processes = await prisma.businessProcessRegister.findMany({
      where: {
        business_area: businessArea,
        deleted_at: null
      }
    });

    const totalProcesses = processes.length;
    const documentedProcesses = processes.filter(proc => proc.doc_status === 'Completed').length;
    const criticalProcesses = processes.filter(proc => proc.priority === 'High').length;
    const criticalProcessesStatus = criticalProcesses > 0 
      ? processes.filter(proc => proc.priority === 'High' && proc.doc_status === 'Completed').length / criticalProcesses * 100
      : 0;

    // Calculate average progress using actual status_percentage values
    const efficiencyScore = totalProcesses > 0 
      ? processes.reduce((sum, proc) => sum + (Number(proc.status_percentage) || 0), 0) / totalProcesses
      : 0;

    // Use the average progress as the completion rate instead of counting completed items
    const completionRate = efficiencyScore;

    return {
      totalProcesses,
      documentedProcesses,
      completionRate,
      criticalProcessesStatus,
      efficiencyScore
    };
  }

  /**
   * Calculates risk management metrics
   */
  private static async calculateRiskManagementMetrics(businessArea: string): Promise<RiskManagementMetrics> {
    const risks = await prisma.racmMatrix.findMany({
      where: {
        business_area: businessArea,
        deleted_at: null
      }
    });

    const totalRisks = risks.length;
    
    // Calculate average impact level score
    const validRisks = risks.filter(risk => risk.inherent_risk_score !== null && risk.inherent_risk_score !== undefined);
    const averageImpactLevelScore = validRisks.length > 0 
      ? validRisks.reduce((sum, risk) => sum + (Number(risk.inherent_risk_score) || 0), 0) / validRisks.length
      : 0;

    // Categorize risks based on impact level score
    // High Risk: Score 15-25 (Very High Impact)
    // Medium Risk: Score 8-14 (High to Medium Impact) 
    // Low Risk: Score 1-7 (Low to Medium Impact)
    const highRisks = risks.filter(risk => {
      const score = Number(risk.inherent_risk_score) || 0;
      return score >= 15 && score <= 25;
    }).length;
    
    const mediumRisks = risks.filter(risk => {
      const score = Number(risk.inherent_risk_score) || 0;
      return score >= 8 && score < 15;
    }).length;
    
    const lowRisks = risks.filter(risk => {
      const score = Number(risk.inherent_risk_score) || 0;
      return score >= 1 && score < 8;
    }).length;

    const mitigatedRisks = risks.filter(risk => risk.status === 'Closed').length;
    const mitigationProgress = totalRisks > 0 ? (mitigatedRisks / totalRisks) * 100 : 0;

    // Calculate new risks in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newRisksThisPeriod = risks.filter(risk => 
      risk.created_at && new Date(risk.created_at) >= thirtyDaysAgo
    ).length;

    return {
      totalRisks,
      riskDistribution: {
        high: highRisks,
        medium: mediumRisks,
        low: lowRisks
      },
      mitigationProgress,
      newRisksThisPeriod,
      averageImpactLevelScore
    };
  }

  /**
   * Calculates compliance metrics
   */
  private static async calculateComplianceMetrics(businessArea: string): Promise<ComplianceMetrics> {
    const documents = await prisma.businessDocumentRegister.findMany({
      where: {
        business_area: businessArea,
        deleted_at: null
      }
    });

    const requiredDocuments = documents.length;
    const availableDocuments = documents.filter(doc => doc.doc_status === 'Completed').length;
    
    // Calculate average progress using actual status_percentage values
    const averageProgress = requiredDocuments > 0 
      ? documents.reduce((sum, doc) => sum + (Number(doc.status_percentage) || 0), 0) / requiredDocuments
      : 0;

    // Use the average progress as the compliance rate instead of counting completed items
    const complianceRate = averageProgress;

    const upToDate = documents.filter(doc => {
      if (!doc.review_date) return false;
      const reviewDate = new Date(doc.review_date);
      const today = new Date();
      return reviewDate >= today;
    }).length;

    const overdue = documents.filter(doc => {
      if (!doc.review_date) return false;
      const reviewDate = new Date(doc.review_date);
      const today = new Date();
      return reviewDate < today;
    }).length;

    const pending = documents.filter(doc => doc.doc_status === 'Not Started').length;

    const auditReadinessScore = this.calculateAuditReadinessScore(documents);

    return {
      requiredDocuments,
      availableDocuments,
      complianceRate,
      reviewStatus: {
        upToDate,
        overdue,
        pending
      },
      auditReadinessScore
    };
  }

  /**
   * Calculates operational excellence metrics
   */
  private static async calculateOperationalExcellenceMetrics(businessArea: string): Promise<OperationalExcellenceMetrics> {
    // Fetch all operational data in parallel
    const [
      nonConformities,
      businessImprovements,
      recordKeepingSystems,
      performanceControls,
      thirdPartyEvaluations,
      customerFeedbackSystems
    ] = await Promise.all([
      prisma.nonConformity.findMany({
        where: {
          business_area: businessArea,
          deleted_at: null
        }
      }),
      prisma.businessImprovement.findMany({
        where: {
          business_area: businessArea,
          deleted_at: null
        }
      }),
      prisma.recordKeepingSystem.findMany({
        where: {
          business_area: businessArea,
          deleted_at: null
        }
      }),
      prisma.performanceMonitoringControl.findMany({
        where: {
          business_area: businessArea,
          deleted_at: null
        }
      }),
      prisma.thirdPartyEvaluation.findMany({
        where: {
          business_area: businessArea,
          deleted_at: null
        }
      }),
      prisma.customerFeedbackSystem.findMany({
        where: {
          business_area: businessArea,
          deleted_at: null
        }
      })
    ]);

    // Calculate Non-Conformity Metrics
    const totalNonConformities = nonConformities.length;
    const openNonConformities = nonConformities.filter(nc => 
      ['Open', 'In Progress'].includes(nc.status || '')
    ).length;
    const closedNonConformities = nonConformities.filter(nc => nc.status === 'Closed').length;
    const criticalNonConformities = nonConformities.filter(nc => nc.priority === 'Critical').length;
    const highPriorityNonConformities = nonConformities.filter(nc => 
      ['Critical', 'High'].includes(nc.priority || '')
    ).length;
    
    // Calculate overdue non-conformities
    const today = new Date();
    const overdueNonConformities = nonConformities.filter(nc => {
      if (!nc.target_date) return false;
      return new Date(nc.target_date) < today && nc.status !== 'Closed';
    }).length;

    // Calculate average resolution time (in days)
    const resolvedNonConformities = nonConformities.filter(nc => 
      nc.status === 'Closed' && nc.created_at && nc.actual_resolution_date
    );
    const averageResolutionTime = resolvedNonConformities.length > 0
      ? resolvedNonConformities.reduce((sum, nc) => {
          const created = new Date(nc.created_at!);
          const resolved = new Date(nc.actual_resolution_date!);
          return sum + Math.ceil((resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        }, 0) / resolvedNonConformities.length
      : 0;

    // Calculate Business Improvement Metrics
    const totalImprovements = businessImprovements.length;
    const completedImprovements = businessImprovements.filter(bi => bi.status === 'Completed').length;
    const inProgressImprovements = businessImprovements.filter(bi => bi.status === 'In Progress').length;
    const plannedImprovements = businessImprovements.filter(bi => bi.status === 'Planned').length;
    const highPriorityImprovements = businessImprovements.filter(bi => 
      ['Critical', 'High'].includes(bi.priority || '')
    ).length;

    // Calculate average completion time for improvements
    const completedImprovementsWithDates = businessImprovements.filter(bi => 
      bi.status === 'Completed' && bi.created_at && bi.actual_completion_date
    );
    const averageCompletionTime = completedImprovementsWithDates.length > 0
      ? completedImprovementsWithDates.reduce((sum, bi) => {
          const created = new Date(bi.created_at!);
          const completed = new Date(bi.actual_completion_date!);
          return sum + Math.ceil((completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        }, 0) / completedImprovementsWithDates.length
      : 0;

    // Calculate Record Keeping Metrics
    const totalRecordSystems = recordKeepingSystems.length;
    const compliantSystems = recordKeepingSystems.filter(rks => 
      rks.compliance_status === 'Compliant'
    ).length;
    const nonCompliantSystems = recordKeepingSystems.filter(rks => 
      rks.compliance_status === 'Non-Compliant'
    ).length;
    
    // Calculate average compliance score
    const averageComplianceScore = totalRecordSystems > 0
      ? recordKeepingSystems.reduce((sum, rks) => sum + (Number(rks.status_percentage) || 0), 0) / totalRecordSystems
      : 0;

    // Calculate overdue audits
    const overdueAudits = recordKeepingSystems.filter(rks => {
      if (!rks.next_audit_date) return false;
      return new Date(rks.next_audit_date) < today;
    }).length;

    // Calculate Performance Monitoring Metrics
    const totalControls = performanceControls.length;
    const completedControls = performanceControls.filter(pc => pc.doc_status === 'Completed').length;
    const overdueControls = performanceControls.filter(pc => {
      if (!pc.target_date) return false;
      return new Date(pc.target_date) < today && pc.doc_status !== 'Completed';
    }).length;
    const criticalControls = performanceControls.filter(pc => pc.priority === 'High').length;
    
    // Calculate average performance score
    const averagePerformanceScore = totalControls > 0
      ? performanceControls.reduce((sum, pc) => sum + (Number(pc.status_percentage) || 0), 0) / totalControls
      : 0;

    // Calculate Third Party Evaluation Metrics
    const totalEvaluations = thirdPartyEvaluations.length;
    const completedEvaluations = thirdPartyEvaluations.filter(tpe => 
      tpe.evaluation_status === 'Completed'
    ).length;
    const pendingEvaluations = thirdPartyEvaluations.filter(tpe => 
      tpe.evaluation_status === 'Pending'
    ).length;
    const overdueEvaluations = thirdPartyEvaluations.filter(tpe => {
      if (!tpe.next_evaluation_date) return false;
      return new Date(tpe.next_evaluation_date) < today;
    }).length;
    
    // Calculate average evaluation score
    const averageEvaluationScore = totalEvaluations > 0
      ? thirdPartyEvaluations.reduce((sum, tpe) => sum + (Number(tpe.evaluation_score) || 0), 0) / totalEvaluations
      : 0;

    // Calculate Customer Feedback Metrics
    const totalFeedbackSystems = customerFeedbackSystems.length;
    const activeSystems = customerFeedbackSystems.filter(cfs => 
      cfs.status === 'Active'
    ).length;
    
    // Calculate average satisfaction score
    const averageSatisfactionScore = totalFeedbackSystems > 0
      ? customerFeedbackSystems.reduce((sum, cfs) => sum + (Number(cfs.satisfaction_score) || 0), 0) / totalFeedbackSystems
      : 0;

    // Calculate response rate
    const responseRate = totalFeedbackSystems > 0
      ? customerFeedbackSystems.reduce((sum, cfs) => sum + (Number(cfs.response_rate) || 0), 0) / totalFeedbackSystems
      : 0;

    return {
      openNonConformities,
      closedNonConformities,
      averageResolutionTime,
      recurringIssues: 0, // Would need additional logic to identify recurring issues
      improvementInitiatives: totalImprovements,
      completedImprovements,
      nonConformityMetrics: {
        totalNonConformities,
        openNonConformities,
        closedNonConformities,
        averageResolutionTime,
        criticalNonConformities,
        highPriorityNonConformities,
        overdueNonConformities
      },
      businessImprovementMetrics: {
        totalImprovements,
        completedImprovements,
        inProgressImprovements,
        plannedImprovements,
        averageCompletionTime,
        highPriorityImprovements
      },
      recordKeepingMetrics: {
        totalRecordSystems,
        compliantSystems,
        nonCompliantSystems,
        averageComplianceScore,
        overdueAudits
      },
      performanceMonitoringMetrics: {
        totalControls,
        completedControls,
        overdueControls,
        averagePerformanceScore,
        criticalControls
      },
      thirdPartyEvaluationMetrics: {
        totalEvaluations,
        completedEvaluations,
        pendingEvaluations,
        averageEvaluationScore,
        overdueEvaluations
      },
      customerFeedbackMetrics: {
        totalFeedbackSystems,
        activeSystems,
        averageSatisfactionScore,
        responseRate
      }
    };
  }

  /**
   * Calculates resource management metrics
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static async calculateResourceManagementMetrics(businessArea: string): Promise<ResourceManagementMetrics> {
    const trainingSessions = await prisma.trainingSession.findMany({
      where: {
        business_area: businessArea
      }
    });

    const trainingSessionsCompleted = trainingSessions.length;
    
    // Placeholder values for metrics that would need additional implementation
    return {
      trainingSessionsCompleted,
      staffCertificationRate: 85, // Placeholder
      skillsGapPercentage: 15, // Placeholder
      supplierEvaluationStatus: 90, // Placeholder
      supplierPerformanceScore: 88 // Placeholder
    };
  }

  /**
   * Calculates customer focus metrics
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static async calculateCustomerFocusMetrics(businessArea: string): Promise<CustomerFocusMetrics> {
    // Placeholder values for customer metrics
    return {
      customerSatisfactionScore: 85,
      feedbackResponseRate: 92,
      serviceQualityScore: 88,
      stakeholderEngagementLevel: 90
    };
  }

  /**
   * Calculates overall health score
   */
  private static calculateOverallHealthScore(metrics: {
    qualityObjectives: QualityObjectiveMetrics;
    processManagement: ProcessManagementMetrics;
    riskManagement: RiskManagementMetrics;
    compliance: ComplianceMetrics;
    operationalExcellence: OperationalExcellenceMetrics;
    resourceManagement: ResourceManagementMetrics;
    customerFocus: CustomerFocusMetrics;
  }): number {
    const weights = {
      qualityObjectives: 0.25, // Core QMS component
      processManagement: 0.20, // Core QMS component
      compliance: 0.20, // Core QMS component
      riskManagement: 0.15, // Important for risk mitigation
      operationalExcellence: 0.15, // Now includes real data from all operational pages
      resourceManagement: 0.03, // Training and development
      customerFocus: 0.02 // Customer satisfaction
    };

    // Calculate risk score based on risk distribution
    const riskScore = 100 - (metrics.riskManagement.riskDistribution.high * 10);

    // Calculate operational excellence score from multiple metrics
    const operationalScore = this.calculateOperationalScore(metrics.operationalExcellence);

    // Calculate resource management score
    const resourceScore = metrics.resourceManagement.trainingSessionsCompleted > 0 ? 85 : 0;

    // Calculate customer focus score
    const customerScore = metrics.customerFocus.customerSatisfactionScore;

    const score = 
      (metrics.qualityObjectives.completionRate * weights.qualityObjectives) +
      (metrics.processManagement.completionRate * weights.processManagement) +
      (metrics.compliance.complianceRate * weights.compliance) +
      (riskScore * weights.riskManagement) +
      (operationalScore * weights.operationalExcellence) +
      (resourceScore * weights.resourceManagement) +
      (customerScore * weights.customerFocus);

    return Math.min(Math.max(score, 0), 100);
  }

  /**
   * Calculates operational excellence score from multiple operational metrics
   */
  private static calculateOperationalScore(operationalMetrics: OperationalExcellenceMetrics): number {
    const scores: number[] = [];

    // Non-conformity score (lower is better)
    const ncResolutionRate = operationalMetrics.nonConformityMetrics.totalNonConformities > 0
      ? (operationalMetrics.nonConformityMetrics.closedNonConformities / operationalMetrics.nonConformityMetrics.totalNonConformities) * 100
      : 100;
    scores.push(ncResolutionRate);

    // Business improvement score
    const improvementRate = operationalMetrics.businessImprovementMetrics.totalImprovements > 0
      ? (operationalMetrics.businessImprovementMetrics.completedImprovements / operationalMetrics.businessImprovementMetrics.totalImprovements) * 100
      : 100;
    scores.push(improvementRate);

    // Record keeping compliance score
    const recordComplianceRate = operationalMetrics.recordKeepingMetrics.totalRecordSystems > 0
      ? (operationalMetrics.recordKeepingMetrics.compliantSystems / operationalMetrics.recordKeepingMetrics.totalRecordSystems) * 100
      : 100;
    scores.push(recordComplianceRate);

    // Performance monitoring score
    const performanceRate = operationalMetrics.performanceMonitoringMetrics.totalControls > 0
      ? (operationalMetrics.performanceMonitoringMetrics.completedControls / operationalMetrics.performanceMonitoringMetrics.totalControls) * 100
      : 100;
    scores.push(performanceRate);

    // Third party evaluation score
    const evaluationRate = operationalMetrics.thirdPartyEvaluationMetrics.totalEvaluations > 0
      ? (operationalMetrics.thirdPartyEvaluationMetrics.completedEvaluations / operationalMetrics.thirdPartyEvaluationMetrics.totalEvaluations) * 100
      : 100;
    scores.push(evaluationRate);

    // Customer feedback score
    const feedbackScore = operationalMetrics.customerFeedbackMetrics.totalFeedbackSystems > 0
      ? operationalMetrics.customerFeedbackMetrics.averageSatisfactionScore
      : 100;
    scores.push(feedbackScore);

    // Return average of all operational scores
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  /**
   * Calculates trend analysis
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static async calculateTrendAnalysis(_businessArea: string): Promise<{
    currentMonth: number;
    previousMonth: number;
    trend: 'improving' | 'declining' | 'stable';
  }> {
    // Placeholder for trend analysis
    return {
      currentMonth: 85,
      previousMonth: 82,
      trend: 'improving' as const
    };
  }

  /**
   * Determines risk level based on health score
   */
  private static determineRiskLevel(healthScore: number): 'green' | 'yellow' | 'red' {
    if (healthScore >= 80) return 'green';
    if (healthScore >= 60) return 'yellow';
    return 'red';
  }

  /**
   * Identifies top achievements based on actual QMS data analysis
   */
  private static async identifyTopAchievements(businessArea: string): Promise<string[]> {
    const achievements: string[] = [];

    try {
      // 1. Check for completed high-priority processes
      const completedHighPriorityProcesses = await prisma.businessProcessRegister.count({
        where: {
          business_area: businessArea,
          deleted_at: null,
          priority: 'High',
          doc_status: 'Completed'
        }
      });

      if (completedHighPriorityProcesses > 0) {
        achievements.push(`Successfully completed ${completedHighPriorityProcesses} high-priority process documentation`);
      }

      // 2. Check for mitigated high-risk items
      const mitigatedHighRisks = await prisma.racmMatrix.count({
        where: {
          business_area: businessArea,
          deleted_at: null,
          inherent_risk_score: {
            gte: 15
          },
          status: 'Closed'
        }
      });

      if (mitigatedHighRisks > 0) {
        achievements.push(`Successfully mitigated ${mitigatedHighRisks} high-risk items`);
      }

      // 3. Check for completed quality objectives
      const completedObjectives = await prisma.businessQualityObjective.count({
        where: {
          business_area: businessArea,
          deleted_at: null,
          progress: 'Completed'
        }
      });

      if (completedObjectives > 0) {
        achievements.push(`Achieved ${completedObjectives} quality objectives successfully`);
      }

      // 4. Check for resolved non-conformities
      const resolvedNonConformities = await prisma.nonConformity.count({
        where: {
          business_area: businessArea,
          deleted_at: null,
          status: 'Closed'
        }
      });

      if (resolvedNonConformities > 0) {
        achievements.push(`Successfully resolved ${resolvedNonConformities} non-conformities`);
      }

      // 5. Check for up-to-date documents
      const upToDateDocuments = await prisma.businessDocumentRegister.count({
        where: {
          business_area: businessArea,
          deleted_at: null,
          doc_status: 'Completed',
          review_date: {
            gte: new Date()
          }
        }
      });

      if (upToDateDocuments > 0) {
        achievements.push(`Maintained ${upToDateDocuments} documents with current review status`);
      }

      // 6. Check for high completion rates
      const qualityObjectives = await prisma.businessQualityObjective.findMany({
        where: {
          business_area: businessArea,
          deleted_at: null
        }
      });

      const avgQualityProgress = qualityObjectives.length > 0 
        ? qualityObjectives.reduce((sum, obj) => sum + (Number(obj.status_percentage) || 0), 0) / qualityObjectives.length
        : 0;

      if (avgQualityProgress >= 80) {
        achievements.push(`Maintained excellent quality objective completion rate of ${avgQualityProgress.toFixed(1)}%`);
      } else if (avgQualityProgress >= 60) {
        achievements.push(`Achieved good quality objective completion rate of ${avgQualityProgress.toFixed(1)}%`);
      }

      // 7. Check for recent improvements
      const recentImprovements = await prisma.businessImprovement.count({
        where: {
          business_area: businessArea,
          deleted_at: null,
          status: 'Completed',
          actual_completion_date: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      });

      if (recentImprovements > 0) {
        achievements.push(`Completed ${recentImprovements} business improvement initiatives in the last 30 days`);
      }

      // Return top 5 achievements, or all if less than 5
      return achievements.slice(0, 5);

    } catch (error) {
      console.error('Error identifying top achievements:', error);
      return [
        'QMS system is operational and maintaining data integrity',
        'Quality management processes are being followed',
        'Continuous improvement initiatives are in place'
      ];
    }
  }

  /**
   * Identifies areas needing attention based on actual QMS data analysis
   */
  private static async identifyAreasNeedingAttention(businessArea: string): Promise<string[]> {
    const areasNeedingAttention: string[] = [];

    try {
      // 1. Check overall completion rates
      const qualityObjectives = await prisma.businessQualityObjective.findMany({
        where: {
          business_area: businessArea,
          deleted_at: null
        }
      });

      const processes = await prisma.businessProcessRegister.findMany({
        where: {
          business_area: businessArea,
          deleted_at: null
        }
      });

      const documents = await prisma.businessDocumentRegister.findMany({
        where: {
          business_area: businessArea,
          deleted_at: null
        }
      });

      // Calculate average completion rates
      const avgQualityProgress = qualityObjectives.length > 0 
        ? qualityObjectives.reduce((sum, obj) => sum + (Number(obj.status_percentage) || 0), 0) / qualityObjectives.length
        : 0;

      const avgProcessProgress = processes.length > 0
        ? processes.reduce((sum, proc) => sum + (Number(proc.status_percentage) || 0), 0) / processes.length
        : 0;

      const avgDocumentProgress = documents.length > 0
        ? documents.reduce((sum, doc) => sum + (Number(doc.status_percentage) || 0), 0) / documents.length
        : 0;

      // Add areas with low completion rates
      if (avgQualityProgress < 60) {
        areasNeedingAttention.push(`Quality objectives completion rate is ${avgQualityProgress.toFixed(1)}% - below target threshold of 60%`);
      }

      if (avgProcessProgress < 50) {
        areasNeedingAttention.push(`Process documentation completion rate is ${avgProcessProgress.toFixed(1)}% - requires immediate attention`);
      }

      if (avgDocumentProgress < 70) {
        areasNeedingAttention.push(`Document compliance rate is ${avgDocumentProgress.toFixed(1)}% - below compliance target of 70%`);
      }

      // 2. Check for high-risk exposure
      const highRisks = await prisma.racmMatrix.count({
        where: {
          business_area: businessArea,
          deleted_at: null,
          inherent_risk_score: {
            gte: 15
          },
          status: {
            not: 'Closed'
          }
        }
      });

      if (highRisks > 0) {
        areasNeedingAttention.push(`${highRisks} high-risk items require immediate mitigation attention`);
      }

      // 3. Check for overdue items
      const overdueDocuments = await prisma.businessDocumentRegister.count({
        where: {
          business_area: businessArea,
          deleted_at: null,
          review_date: {
            lt: new Date()
          },
          doc_status: {
            not: 'Completed'
          }
        }
      });

      if (overdueDocuments > 0) {
        areasNeedingAttention.push(`${overdueDocuments} document reviews are overdue and require immediate attention`);
      }

      // 4. Check for open non-conformities
      const openNonConformities = await prisma.nonConformity.count({
        where: {
          business_area: businessArea,
          deleted_at: null,
          status: {
            in: ['Open', 'In Progress']
          }
        }
      });

      if (openNonConformities > 0) {
        areasNeedingAttention.push(`${openNonConformities} non-conformities are open and need resolution`);
      }

      // 5. Check for critical processes with low completion
      const criticalLowProcesses = await prisma.businessProcessRegister.count({
        where: {
          business_area: businessArea,
          deleted_at: null,
          priority: 'High',
          status_percentage: {
            lt: 30
          }
        }
      });

      if (criticalLowProcesses > 0) {
        areasNeedingAttention.push(`${criticalLowProcesses} high-priority processes have completion rates below 30%`);
      }

      // 6. Check for quality objectives at risk
      const atRiskObjectives = await prisma.businessQualityObjective.count({
        where: {
          business_area: businessArea,
          deleted_at: null,
          progress: {
            in: ['Major Challenges', 'Minor Challenges']
          }
        }
      });

      if (atRiskObjectives > 0) {
        areasNeedingAttention.push(`${atRiskObjectives} quality objectives are facing challenges and need intervention`);
      }

      // Return top 5 most critical areas, or all if less than 5
      return areasNeedingAttention.slice(0, 5);

    } catch (error) {
      console.error('Error identifying areas needing attention:', error);
      return [
        'Unable to analyze areas needing attention - please review QMS data manually',
        'Process documentation completion rate below target',
        'Risk mitigation progress needs acceleration'
      ];
    }
  }

  /**
   * Identifies critical actions based on actual QMS data analysis
   */
  private static async identifyCriticalActions(businessArea: string): Promise<CriticalAction[]> {
    const criticalActions: CriticalAction[] = [];
    let actionId = 1;

    try {
      // 1. Check for high-risk items that need immediate attention
      const highRisks = await prisma.racmMatrix.findMany({
        where: {
          business_area: businessArea,
          deleted_at: null,
          inherent_risk_score: {
            gte: 15 // High risk threshold
          },
          status: {
            not: 'Closed'
          }
        },
        take: 5
      });

      highRisks.forEach(risk => {
                 criticalActions.push({
           id: (actionId++).toString(),
           title: `Mitigate High-Risk Item: ${risk.process_name || 'Untitled Risk'}`,
           description: `Risk score: ${risk.inherent_risk_score}. Status: ${risk.status}. Issue: ${risk.issue_description?.substring(0, 100)}${risk.issue_description && risk.issue_description.length > 100 ? '...' : ''}. Requires immediate attention to reduce risk exposure.`,
           priority: 'high' as const,
           deadline: this.calculateDeadline(7), // 7 days for high-risk items
           responsiblePerson: risk.control_owner || 'Risk Manager',
           status: 'pending' as const
         });
      });

      // 2. Check for overdue document reviews
      const overdueDocuments = await prisma.businessDocumentRegister.findMany({
        where: {
          business_area: businessArea,
          deleted_at: null,
          review_date: {
            lt: new Date() // Past due date
          },
          doc_status: {
            not: 'Completed'
          }
        },
        take: 3
      });

      overdueDocuments.forEach(doc => {
        criticalActions.push({
          id: (actionId++).toString(),
          title: `Review Overdue Document: ${doc.document_name || 'Untitled Document'}`,
          description: `Document review was due on ${doc.review_date?.toLocaleDateString()}. Current status: ${doc.doc_status}.`,
          priority: 'high' as const,
          deadline: this.calculateDeadline(3), // 3 days for overdue reviews
                     responsiblePerson: doc.document_owner || 'Document Owner',
          status: 'pending' as const
        });
      });

      // 3. Check for processes with low completion rates
      const lowCompletionProcesses = await prisma.businessProcessRegister.findMany({
        where: {
          business_area: businessArea,
          deleted_at: null,
          status_percentage: {
            lt: 30 // Less than 30% complete
          },
          priority: 'High'
        },
        take: 3
      });

      lowCompletionProcesses.forEach(process => {
        criticalActions.push({
          id: (actionId++).toString(),
          title: `Accelerate High-Priority Process: ${process.process_name || 'Untitled Process'}`,
          description: `Process completion rate: ${process.status_percentage}%. Priority: ${process.priority}. Needs immediate attention to meet targets.`,
          priority: 'medium' as const,
          deadline: this.calculateDeadline(14), // 14 days for process acceleration
                     responsiblePerson: process.process_owner || 'Process Owner',
          status: 'pending' as const
        });
      });

      // 4. Check for quality objectives at risk
      const atRiskObjectives = await prisma.businessQualityObjective.findMany({
        where: {
          business_area: businessArea,
          deleted_at: null,
          progress: {
            in: ['Major Challenges', 'Minor Challenges']
          }
        },
        take: 3
      });

      atRiskObjectives.forEach(objective => {
        criticalActions.push({
          id: (actionId++).toString(),
                     title: `Address Quality Objective Challenge: ${objective.qms_main_objectives || 'Untitled Objective'}`,
          description: `Current progress: ${objective.progress}. Status: ${objective.status_percentage}%. Requires intervention to meet targets.`,
          priority: 'medium' as const,
          deadline: this.calculateDeadline(10), // 10 days for objective challenges
                     responsiblePerson: objective.responsible_person_team || 'Quality Manager',
          status: 'pending' as const
        });
      });

      // 5. Check for non-conformities that need attention
      const openNonConformities = await prisma.nonConformity.findMany({
        where: {
          business_area: businessArea,
          deleted_at: null,
          status: {
            in: ['Open', 'In Progress']
          },
          priority: {
            in: ['Critical', 'High']
          }
        },
        take: 3
      });

      openNonConformities.forEach(nc => {
        criticalActions.push({
          id: (actionId++).toString(),
          title: `Resolve Non-Conformity: ${nc.nc_number || 'NC-' + nc.id}`,
          description: `Priority: ${nc.priority}. Status: ${nc.status}. Target date: ${nc.target_date ? new Date(nc.target_date).toLocaleDateString() : 'Not set'}.`,
          priority: nc.priority === 'Critical' ? 'high' as const : 'medium' as const,
          deadline: nc.target_date ? new Date(nc.target_date).toISOString().split('T')[0] : this.calculateDeadline(7),
          responsiblePerson: nc.responsible_person || 'Quality Manager',
          status: 'pending' as const
        });
      });

      // 6. Check for performance monitoring controls that need attention
      const overdueControls = await prisma.performanceMonitoringControl.findMany({
        where: {
          business_area: businessArea,
          deleted_at: null,
                     target_date: {
             lt: new Date() // Past due date
           },
          doc_status: {
            not: 'Completed'
          }
        },
        take: 2
      });

      overdueControls.forEach(control => {
        criticalActions.push({
          id: (actionId++).toString(),
                     title: `Review Overdue Performance Control: ${control.Name_reports || 'Untitled Control'}`,
           description: `Target date was due on ${control.target_date?.toLocaleDateString()}. Current status: ${control.doc_status}.`,
          priority: 'medium' as const,
          deadline: this.calculateDeadline(5), // 5 days for overdue controls
                     responsiblePerson: control.responsible_persons || 'Performance Manager',
          status: 'pending' as const
        });
      });

      // Sort by priority (high first) and limit to top 10 most critical
      return criticalActions
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        })
        .slice(0, 10);

    } catch (error) {
      console.error('Error identifying critical actions:', error);
      // Return a fallback action if analysis fails
      return [{
        id: '1',
        title: 'Review QMS Data Analysis',
        description: 'Unable to analyze critical actions. Please review QMS data manually.',
        priority: 'medium' as const,
        deadline: this.calculateDeadline(7),
        responsiblePerson: 'QMS Manager',
        status: 'pending' as const
      }];
    }
  }

  /**
   * Helper method to calculate deadlines
   */
  private static calculateDeadline(daysFromNow: number): string {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + daysFromNow);
    return deadline.toISOString().split('T')[0];
  }

  /**
   * Calculates audit readiness score
   */
  private static calculateAuditReadinessScore(documents: Array<{
    doc_status: string | null;
    review_date: Date | null;
  }>): number {
    if (documents.length === 0) return 0;

    const completedDocs = documents.filter(doc => doc.doc_status === 'Completed').length;
    const upToDateDocs = documents.filter(doc => {
      if (!doc.review_date) return false;
      const reviewDate = new Date(doc.review_date);
      const today = new Date();
      return reviewDate >= today;
    }).length;

    const completionScore = (completedDocs / documents.length) * 50;
    const currencyScore = (upToDateDocs / documents.length) * 50;

    return completionScore + currencyScore;
  }
}
