import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    console.log('Setting up database tables...');

    // Create businessareas table
    await query(`
      CREATE TABLE IF NOT EXISTS businessareas (
        business_area VARCHAR(50) PRIMARY KEY
      )
    `);
    console.log('Created businessareas table');

    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(50) UNIQUE NOT NULL,
        username VARCHAR(20) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        business_area VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_business_area (business_area),
        FOREIGN KEY (business_area) REFERENCES businessareas(business_area) ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);
    console.log('Created users table');

    // Create businessprocessregister table
    await query(`
      CREATE TABLE IF NOT EXISTS businessprocessregister (
        id INT AUTO_INCREMENT PRIMARY KEY,
        business_area VARCHAR(50),
        sub_business_area VARCHAR(100),
        process_name VARCHAR(100),
        document_name VARCHAR(100),
        version VARCHAR(20),
        progress VARCHAR(20),
        doc_status VARCHAR(20),
        status_percentage DECIMAL(5,0),
        priority VARCHAR(20),
        target_date DATE,
        process_owner VARCHAR(20),
        update_date DATE,
        remarks TEXT,
        review_date DATE,
        INDEX idx_business_area (business_area),
        FOREIGN KEY (business_area) REFERENCES businessareas(business_area) ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);
    console.log('Created businessprocessregister table');

    // Create businessqualityobjectives table
    await query(`
      CREATE TABLE IF NOT EXISTS businessqualityobjectives (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category VARCHAR(100),
        business_area VARCHAR(50),
        sub_business_area VARCHAR(100),
        qms_main_objectives TEXT,
        qms_objective_description TEXT,
        kpi_or_sla_targets TEXT,
        performance_monitoring TEXT,
        proof_of_measuring VARCHAR(20),
        proof_of_reporting VARCHAR(20),
        frequency VARCHAR(20),
        responsible_person_team VARCHAR(100),
        review_date DATE,
        progress VARCHAR(20),
        status_percentage INT,
        INDEX idx_business_area (business_area),
        FOREIGN KEY (business_area) REFERENCES businessareas(business_area) ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);
    console.log('Created businessqualityobjectives table');

    // Create businessdocumentregister table
    await query(`
      CREATE TABLE IF NOT EXISTS businessdocumentregister (
        id INT AUTO_INCREMENT PRIMARY KEY,
        business_area VARCHAR(50),
        sub_business_area VARCHAR(100),
        document_name VARCHAR(100),
        name_and_numbering VARCHAR(100),
        document_type VARCHAR(20),
        version VARCHAR(20),
        progress VARCHAR(20),
        doc_status VARCHAR(20),
        status_percentage DECIMAL(5,0),
        priority VARCHAR(20),
        target_date DATE,
        document_owner VARCHAR(20),
        update_date DATE,
        remarks TEXT,
        review_date DATE,
        INDEX idx_business_area (business_area),
        FOREIGN KEY (business_area) REFERENCES businessareas(business_area) ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);
    console.log('Created businessdocumentregister table');

    // Create performancemonitoringcontrol table
    await query(`
      CREATE TABLE IF NOT EXISTS performancemonitoringcontrol (
        id INT AUTO_INCREMENT PRIMARY KEY,
        business_area VARCHAR(50),
        sub_business_area VARCHAR(100),
        Name_reports VARCHAR(100),
        doc_type VARCHAR(50),
        priority VARCHAR(20),
        doc_status VARCHAR(100),
        progress VARCHAR(100),
        status_percentage DECIMAL(5,0),
        target_date DATE,
        proof VARCHAR(20),
        frequency VARCHAR(50),
        responsible_persons VARCHAR(50),
        remarks TEXT,
        INDEX idx_business_area (business_area),
        FOREIGN KEY (business_area) REFERENCES businessareas(business_area) ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);
    console.log('Created performancemonitoringcontrol table');

    // Create racm_matrix table
    await query(`
      CREATE TABLE IF NOT EXISTS racm_matrix (
        id INT AUTO_INCREMENT PRIMARY KEY,
        process_name VARCHAR(255) NOT NULL,
        activity_description TEXT,
        issue_description TEXT NOT NULL,
        issue_type VARCHAR(100),
        likelihood INT,
        impact INT,
        risk_score INT,
        control_description TEXT,
        control_type VARCHAR(20),
        control_owner VARCHAR(255),
        control_effectiveness VARCHAR(20),
        residual_risk INT,
        status VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        business_area VARCHAR(50),
        INDEX idx_business_area (business_area),
        FOREIGN KEY (business_area) REFERENCES businessareas(business_area) ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);
    console.log('Created racm_matrix table');

    // Create trainingsessions table
    await query(`
      CREATE TABLE IF NOT EXISTS trainingsessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        business_area VARCHAR(50),
        sessions VARCHAR(50) NOT NULL,
        session_date DATE NOT NULL,
        remarks TEXT NOT NULL,
        INDEX idx_business_area (business_area),
        FOREIGN KEY (business_area) REFERENCES businessareas(business_area) ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);
    console.log('Created trainingsessions table');

    // Create businessprocessversions table
    await query(`
      CREATE TABLE IF NOT EXISTS businessprocessversions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        businessProcessId VARCHAR(255) NOT NULL,
        versionNumber VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Created businessprocessversions table');

    // Create user_business_areas table for many-to-many relationship
    await query(`
      CREATE TABLE IF NOT EXISTS user_business_areas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        business_area VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_business_area (user_id, business_area),
        INDEX idx_user_id (user_id),
        INDEX idx_business_area (business_area),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (business_area) REFERENCES businessareas(business_area) ON DELETE CASCADE
      )
    `);
    console.log('Created user_business_areas table');

    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully',
      tables: [
        'businessareas',
        'users',
        'businessprocessregister',
        'businessqualityobjectives',
        'businessdocumentregister',
        'performancemonitoringcontrol',
        'racm_matrix',
        'trainingsessions',
        'businessprocessversions',
        'user_business_areas'
      ]
    });
  } catch (error) {
    console.error('Database Setup Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to setup database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 