import { NextRequest, NextResponse } from 'next/server';
import { CalculationService } from '@/app/lib/services/calculationService';
import { getCurrentUserBusinessArea } from '@/lib/auth';

/**
 * API route handler for calculating metrics
 * Calculates business quality, performance, and risk metrics for the user's business area
 * 
 * @route GET /api/metrics/calculate
 * @returns {Promise<NextResponse>} JSON response containing calculated metrics
 */
export async function GET(request: NextRequest) {
  try {
    const userBusinessArea = await getCurrentUserBusinessArea(request);
    if (!userBusinessArea) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Calculate all metrics for the user's business area
    const [businessQualityMetrics, performanceMetrics, riskMetrics] = await Promise.all([
      CalculationService.calculateBusinessQualityMetrics(userBusinessArea),
      CalculationService.calculatePerformanceMetrics(userBusinessArea),
      CalculationService.calculateRiskManagementMetrics(userBusinessArea)
    ]);

    return NextResponse.json({
      businessQuality: businessQualityMetrics,
      performance: performanceMetrics,
      risk: riskMetrics
    });
  } catch (error) {
    console.error('Error calculating metrics:', error);
    return NextResponse.json(
      { error: 'Failed to calculate metrics' },
      { status: 500 }
    );
  }
} 