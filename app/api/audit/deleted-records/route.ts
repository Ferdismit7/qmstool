import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserBusinessAreas, getUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const user = await getUserFromToken(request);
    if (!user || !user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized - No business area access' },
        { status: 401 }
      );
    }

    // Fetch deleted records from all tables with soft delete fields
    const deletedRecords: Array<{
      id: number;
      tableName: string;
      recordId: number;
      deletedAt: Date | null;
      deletedBy: number | null;
      businessArea?: string | null;
      fileName?: string | null;
      deletedByUser?: {
        username: string;
        email: string;
      } | null;
    }> = [];

    // Business Documents
    const deletedBusinessDocuments = await prisma.businessDocumentRegister.findMany({
      where: {
        deleted_at: { not: null },
        business_area: { in: userBusinessAreas }
      },
      select: {
        id: true,
        business_area: true,
        file_name: true,
        file_url: true,
        deleted_at: true,
        deleted_by: true,
        deletedBy: {
          select: {
            username: true,
            email: true
          }
        }
      },
      orderBy: { deleted_at: 'desc' }
    });

    deletedBusinessDocuments.forEach(doc => {
      deletedRecords.push({
        id: doc.id,
        tableName: 'businessdocumentregister',
        recordId: doc.id,
        deletedAt: doc.deleted_at,
        deletedBy: doc.deleted_by,
        businessArea: doc.business_area,
        fileName: doc.file_name,
        deletedByUser: doc.deletedBy
      });
    });

    // Business Processes
    const deletedBusinessProcesses = await prisma.businessProcessRegister.findMany({
      where: {
        deleted_at: { not: null },
        business_area: { in: userBusinessAreas }
      },
      select: {
        id: true,
        business_area: true,
        file_name: true,
        file_url: true,
        deleted_at: true,
        deleted_by: true,
        deletedBy: {
          select: {
            username: true,
            email: true
          }
        }
      },
      orderBy: { deleted_at: 'desc' }
    });

    deletedBusinessProcesses.forEach(process => {
      deletedRecords.push({
        id: process.id,
        tableName: 'businessprocessregister',
        recordId: process.id,
        deletedAt: process.deleted_at,
        deletedBy: process.deleted_by,
        businessArea: process.business_area,
        fileName: process.file_name,
        deletedByUser: process.deletedBy
      });
    });

    // Quality Objectives
    const deletedQualityObjectives = await prisma.businessQualityObjective.findMany({
      where: {
        deleted_at: { not: null },
        business_area: { in: userBusinessAreas }
      },
      select: {
        id: true,
        business_area: true,
        file_name: true,
        file_url: true,
        deleted_at: true,
        deleted_by: true,
        deletedBy: {
          select: {
            username: true,
            email: true
          }
        }
      },
      orderBy: { deleted_at: 'desc' }
    });

    deletedQualityObjectives.forEach(objective => {
      deletedRecords.push({
        id: objective.id,
        tableName: 'businessqualityobjectives',
        recordId: objective.id,
        deletedAt: objective.deleted_at,
        deletedBy: objective.deleted_by,
        businessArea: objective.business_area,
        fileName: objective.file_name,
        deletedByUser: objective.deletedBy
      });
    });

    // Performance Monitoring
    const deletedPerformanceMonitoring = await prisma.performanceMonitoringControl.findMany({
      where: {
        deleted_at: { not: null },
        business_area: { in: userBusinessAreas }
      },
      select: {
        id: true,
        business_area: true,
        file_name: true,
        file_url: true,
        deleted_at: true,
        deleted_by: true,
        deletedBy: {
          select: {
            username: true,
            email: true
          }
        }
      },
      orderBy: { deleted_at: 'desc' }
    });

    deletedPerformanceMonitoring.forEach(monitoring => {
      deletedRecords.push({
        id: monitoring.id,
        tableName: 'performancemonitoringcontrol',
        recordId: monitoring.id,
        deletedAt: monitoring.deleted_at,
        deletedBy: monitoring.deleted_by,
        businessArea: monitoring.business_area,
        fileName: monitoring.file_name,
        deletedByUser: monitoring.deletedBy
      });
    });

    // Risk Management
    const deletedRiskManagement = await prisma.racmMatrix.findMany({
      where: {
        deleted_at: { not: null },
        business_area: { in: userBusinessAreas }
      },
      select: {
        id: true,
        business_area: true,
        file_name: true,
        file_url: true,
        deleted_at: true,
        deleted_by: true,
        deletedBy: {
          select: {
            username: true,
            email: true
          }
        }
      },
      orderBy: { deleted_at: 'desc' }
    });

    deletedRiskManagement.forEach(risk => {
      deletedRecords.push({
        id: risk.id,
        tableName: 'racm_matrix',
        recordId: risk.id,
        deletedAt: risk.deleted_at,
        deletedBy: risk.deleted_by,
        businessArea: risk.business_area,
        fileName: risk.file_name,
        deletedByUser: risk.deletedBy
      });
    });

    // Non-Conformities
    const deletedNonConformities = await prisma.nonConformity.findMany({
      where: {
        deleted_at: { not: null },
        business_area: { in: userBusinessAreas }
      },
      select: {
        id: true,
        business_area: true,
        file_name: true,
        file_url: true,
        deleted_at: true,
        deleted_by: true,
        deletedBy: {
          select: {
            username: true,
            email: true
          }
        }
      },
      orderBy: { deleted_at: 'desc' }
    });

    deletedNonConformities.forEach(nc => {
      deletedRecords.push({
        id: nc.id,
        tableName: 'non_conformities',
        recordId: nc.id,
        deletedAt: nc.deleted_at,
        deletedBy: nc.deleted_by,
        businessArea: nc.business_area,
        fileName: nc.file_name,
        deletedByUser: nc.deletedBy
      });
    });

    // Record Keeping Systems
    const deletedRecordKeeping = await prisma.recordKeepingSystem.findMany({
      where: {
        deleted_at: { not: null },
        business_area: { in: userBusinessAreas }
      },
      select: {
        id: true,
        business_area: true,
        file_name: true,
        file_url: true,
        deleted_at: true,
        deleted_by: true,
        deletedBy: {
          select: {
            username: true,
            email: true
          }
        }
      },
      orderBy: { deleted_at: 'desc' }
    });

    deletedRecordKeeping.forEach(record => {
      deletedRecords.push({
        id: record.id,
        tableName: 'record_keeping_systems',
        recordId: record.id,
        deletedAt: record.deleted_at,
        deletedBy: record.deleted_by,
        businessArea: record.business_area,
        fileName: record.file_name,
        deletedByUser: record.deletedBy
      });
    });

    // Business Improvements
    const deletedBusinessImprovements = await prisma.businessImprovement.findMany({
      where: {
        deleted_at: { not: null },
        business_area: { in: userBusinessAreas }
      },
      select: {
        id: true,
        business_area: true,
        file_name: true,
        file_url: true,
        deleted_at: true,
        deleted_by: true,
        deletedBy: {
          select: {
            username: true,
            email: true
          }
        }
      },
      orderBy: { deleted_at: 'desc' }
    });

    deletedBusinessImprovements.forEach(improvement => {
      deletedRecords.push({
        id: improvement.id,
        tableName: 'business_improvements',
        recordId: improvement.id,
        deletedAt: improvement.deleted_at,
        deletedBy: improvement.deleted_by,
        businessArea: improvement.business_area,
        fileName: improvement.file_name,
        deletedByUser: improvement.deletedBy
      });
    });

    // Sort all records by deletion date (most recent first)
    deletedRecords.sort((a, b) => 
      new Date(b.deletedAt!).getTime() - new Date(a.deletedAt!).getTime()
    );

    return NextResponse.json({
      success: true,
      deletedRecords,
      totalCount: deletedRecords.length
    });

  } catch (error) {
    console.error('Error fetching deleted records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deleted records' },
      { status: 500 }
    );
  }
}
