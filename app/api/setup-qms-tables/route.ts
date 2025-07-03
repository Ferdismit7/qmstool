import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function GET() {
  try {
    console.log('Setting up QMS tables...');

    // Create qms_assessments table
    await query(`
      CREATE TABLE IF NOT EXISTS qms_assessments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        business_area VARCHAR(100) NOT NULL,
        assessor_name VARCHAR(100) NOT NULL,
        assessment_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_business_area (business_area),
        INDEX idx_created_at (created_at)
      )
    `);

    console.log('Created qms_assessments table');

    // Create qms_assessment_items table
    await query(`
      CREATE TABLE IF NOT EXISTS qms_assessment_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        assessment_id INT NOT NULL,
        section VARCHAR(50) NOT NULL,
        clause_reference VARCHAR(20) NOT NULL,
        item_number VARCHAR(10) NOT NULL,
        item_description TEXT NOT NULL,
        status ENUM('C', 'NC', 'OFI', 'NA') NOT NULL,
        comment TEXT,
        FOREIGN KEY (assessment_id) REFERENCES qms_assessments(id) ON DELETE CASCADE,
        INDEX idx_assessment_id (assessment_id),
        INDEX idx_section (section),
        INDEX idx_item_number (item_number)
      )
    `);

    console.log('Created qms_assessment_items table');

    // Create qms_approvals table
    await query(`
      CREATE TABLE IF NOT EXISTS qms_approvals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        assessment_id INT UNIQUE NOT NULL,
        conducted_by VARCHAR(100),
        conducted_date DATE,
        approved_by VARCHAR(100),
        approved_date DATE,
        FOREIGN KEY (assessment_id) REFERENCES qms_assessments(id) ON DELETE CASCADE,
        INDEX idx_assessment_id (assessment_id)
      )
    `);

    console.log('Created qms_approvals table');

    // Create qms_sections table
    await query(`
      CREATE TABLE IF NOT EXISTS qms_sections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        section_number VARCHAR(10) NOT NULL,
        title VARCHAR(255) NOT NULL,
        clause_reference VARCHAR(50) NOT NULL,
        UNIQUE KEY unique_section (section_number)
      )
    `);

    console.log('Created qms_sections table');

    // Create qms_status_options table
    await query(`
      CREATE TABLE IF NOT EXISTS qms_status_options (
        code ENUM('C', 'NC', 'OFI', 'NA') PRIMARY KEY,
        meaning VARCHAR(100) NOT NULL
      )
    `);

    console.log('Created qms_status_options table');

    // Insert default status options
    await query(`
      INSERT IGNORE INTO qms_status_options (code, meaning) VALUES
      ('C', 'Conform / In Place'),
      ('NC', 'Non-Conformance'),
      ('OFI', 'Opportunity for Improvement'),
      ('NA', 'Not Applicable')
    `);

    console.log('Inserted default status options');

    // Insert default sections
    await query(`
      INSERT IGNORE INTO qms_sections (section_number, title, clause_reference) VALUES
      ('1', 'Quality Management System & Processes', 'Clause 4.2/4.4/6.1/6.2/7'),
      ('2', 'Support – Resources, Competence, Awareness', 'Clause 7'),
      ('3', 'Operations', 'Clause 8'),
      ('4', 'Performance Monitoring & Improvement', 'Clauses 9 & 10')
    `);

    console.log('Inserted default sections');

    return NextResponse.json({
      success: true,
      message: 'QMS tables setup completed successfully',
      tables: [
        'qms_assessments',
        'qms_assessment_items', 
        'qms_approvals',
        'qms_sections',
        'qms_status_options'
      ]
    });
  } catch (error) {
    console.error('QMS Tables Setup Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to setup QMS tables',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 