import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { getCurrentUserBusinessAreas } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ 
        error: 'Unauthorized - No business area access',
        userBusinessAreas: []
      }, { status: 401 });
    }

    // Test data from different tables to show the filtering is working
    const results = {
      userBusinessAreas: userBusinessAreas,
      businessProcesses: [],
      businessDocuments: [],
      qualityObjectives: [],
      riskManagement: [],
      performanceMonitoring: [],
      qmsAssessments: [],
      trainingSessions: []
    };

    // Create placeholders for IN clause
    const placeholders = userBusinessAreas.map(() => '?').join(',');

    // Test business processes
    try {
      results.businessProcesses = await query(`
        SELECT id, business_area, process_name, process_owner 
        FROM businessprocessregister 
        WHERE business_area IN (${placeholders})
        ORDER BY id DESC
        LIMIT 5
      `, userBusinessAreas);
    } catch (error) {
      console.error('Error fetching business processes:', error);
    }

    // Test business documents
    try {
      results.businessDocuments = await query(`
        SELECT id, business_area, document_name, document_owner 
        FROM businessdocumentregister 
        WHERE business_area IN (${placeholders})
        ORDER BY id DESC
        LIMIT 5
      `, userBusinessAreas);
    } catch (error) {
      console.error('Error fetching business documents:', error);
    }

    // Test quality objectives
    try {
      results.qualityObjectives = await query(`
        SELECT id, business_area, category, responsible_person_team 
        FROM businessqualityobjectives 
        WHERE business_area IN (${placeholders})
        ORDER BY id DESC
        LIMIT 5
      `, userBusinessAreas);
    } catch (error) {
      console.error('Error fetching quality objectives:', error);
    }

    // Test risk management
    try {
      results.riskManagement = await query(`
        SELECT id, business_area, process_name, control_owner 
        FROM racm_matrix 
        WHERE business_area IN (${placeholders})
        ORDER BY id DESC
        LIMIT 5
      `, userBusinessAreas);
    } catch (error) {
      console.error('Error fetching risk management:', error);
    }

    // Test performance monitoring
    try {
      results.performanceMonitoring = await query(`
        SELECT id, business_area, Name_reports, responsible_persons 
        FROM performancemonitoringcontrol 
        WHERE business_area IN (${placeholders})
        ORDER BY id DESC
        LIMIT 5
      `, userBusinessAreas);
    } catch (error) {
      console.error('Error fetching performance monitoring:', error);
    }

    // Test QMS assessments
    try {
      results.qmsAssessments = await query(`
        SELECT id, business_area, assessor_name, assessment_date 
        FROM qms_assessments 
        WHERE business_area IN (${placeholders})
        ORDER BY id DESC
        LIMIT 5
      `, userBusinessAreas);
    } catch (error) {
      console.error('Error fetching QMS assessments:', error);
    }

    // Test training sessions
    try {
      results.trainingSessions = await query(`
        SELECT id, business_area, sessions, session_date 
        FROM trainingsessions 
        WHERE business_area IN (${placeholders})
        ORDER BY id DESC
        LIMIT 5
      `, userBusinessAreas);
    } catch (error) {
      console.error('Error fetching training sessions:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Business area filtering test completed',
      totalBusinessAreas: userBusinessAreas.length,
      ...results
    });

  } catch (error) {
    console.error('Error in business area filtering test:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test business area filtering',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 