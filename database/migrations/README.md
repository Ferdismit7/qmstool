# Database Migrations

This directory contains SQL migration scripts for the QMS Tool database.

## Migration Files

### 001_create_business_process_document_links.sql
- **Purpose**: Creates the junction table to link Business Processes with Business Documents
- **Date**: 2024-01-XX
- **Description**: 
  - Creates `business_process_document_links` table
  - Establishes foreign key relationships with proper constraints
  - Adds indexes for optimal query performance
  - Includes audit fields (created_at, updated_at, created_by)

## How to Run Migrations

### Option 1: Using MySQL Command Line
```bash
mysql -u your_username -p your_database_name < database/migrations/001_create_business_process_document_links.sql
```

### Option 2: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your database
3. Open the migration file
4. Execute the script

### Option 3: Using phpMyAdmin
1. Login to phpMyAdmin
2. Select your database
3. Go to SQL tab
4. Copy and paste the migration content
5. Execute

## Verification

After running the migration, verify the table was created:

```sql
-- Check if table exists
SHOW TABLES LIKE 'business_process_document_links';

-- Check table structure
DESCRIBE business_process_document_links;

-- Check foreign key constraints
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM 
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE 
    TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'business_process_document_links';
```

## Rollback (if needed)

To rollback this migration:

```sql
-- Drop the table (this will also remove all data)
DROP TABLE IF EXISTS `business_process_document_links`;
```

## Notes

- The migration includes proper foreign key constraints with CASCADE DELETE
- Unique constraint prevents duplicate links between the same process and document
- Indexes are created for optimal query performance
- Audit fields track who created the link and when
