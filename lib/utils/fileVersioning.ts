import { prisma } from '@/lib/prisma';

/**
 * Save current file to version history before updating with new file
 * @param params - Object containing record info and file data
 */
export async function saveFileVersion(params: {
  recordId: number;
  currentFileUrl: string | null;
  currentFileName: string | null;
  currentFileSize: bigint | null;
  currentFileType: string | null;
  currentVersion: string | null;
  newFileUrl: string | null;
  userId: number | null;
  versionTable: string;
  recordIdField: string;
  versionField: string;
}) {
  const {
    recordId,
    currentFileUrl,
    currentFileName,
    currentFileSize,
    currentFileType,
    currentVersion,
    newFileUrl,
    userId,
    versionTable,
    recordIdField,
    versionField
  } = params;

  // If a new file is being uploaded and it's different from the current one,
  // save the current file to versions table before updating
  if (
    newFileUrl &&
    newFileUrl !== currentFileUrl &&
    currentFileUrl &&
    currentVersion
  ) {
    const versionModelMap: Record<string, any> = {
      'business_process_file_versions': prisma.businessProcessFileVersion,
      'business_document_file_versions': prisma.businessDocumentFileVersion,
      'business_quality_objective_file_versions': prisma.businessQualityObjectiveFileVersion,
      'performance_monitoring_control_file_versions': prisma.performanceMonitoringControlFileVersion,
      'non_conformity_file_versions': prisma.nonConformityFileVersion,
      'record_keeping_system_file_versions': prisma.recordKeepingSystemFileVersion,
      'business_improvement_file_versions': prisma.businessImprovementFileVersion,
      'third_party_evaluation_file_versions': prisma.thirdPartyEvaluationFileVersion,
      'customer_feedback_system_file_versions': prisma.customerFeedbackSystemFileVersion,
      'training_session_file_versions': prisma.trainingSessionFileVersion,
      'racm_matrix_file_versions': prisma.racmMatrixFileVersion,
      'qms_assessment_file_versions': prisma.qMSAssessmentFileVersion,
    };

    const versionModel = versionModelMap[versionTable];
    if (!versionModel) {
      console.error(`Unknown version table: ${versionTable}`);
      return;
    }

    const data: Record<string, any> = {
      [recordIdField]: recordId,
      [versionField]: currentVersion,
      file_url: currentFileUrl,
      file_name: currentFileName || '',
      file_size: currentFileSize,
      file_type: currentFileType,
      uploaded_by: userId
    };

    await versionModel.create({ data });
  }
}

